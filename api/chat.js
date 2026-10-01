import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const menuPath = path.join(__dirname, "..", "menu.json");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ORDER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    customer_response: {
      type: "string"
    },
    order: {
      type: "object",
      additionalProperties: false,
      properties: {
        customer: {
          type: "object",
          additionalProperties: false,
          properties: {
            first_name: {
              type: "string"
            }
          },
          required: ["first_name"]
        },
        items: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              quantity: { type: "integer" },
              unit_price: { type: "number" },
              line_total: { type: "number" }
            },
            required: [
              "id",
              "name",
              "quantity",
              "unit_price",
              "line_total"
            ]
          }
        },
        order_total: {
          type: "number"
        },
        status: {
          type: "string",
          enum: ["pending", "confirmed", "cancelled"]
        }
      },
      required: [
        "customer",
        "items",
        "order_total",
        "status"
      ]
    }
  },
  required: ["customer_response", "order"]
};

const instructions = `
You are the bakery ordering assistant for a bakery website.

Your task is to help the customer create an order using ONLY the supplied menu.

RULES:
1. Only use products that exist in the supplied menu.
2. Never invent a product, product ID, description, or price.
3. Use the exact menu price for each product.
4. Track the customer's first name.
5. Track the current order across the conversation.
6. The customer may add, remove, or change quantities.
7. If the customer asks for an item that is not on the menu, explain that it is unavailable and offer menu alternatives.
8. If the customer does not provide a quantity, ask for the quantity rather than guessing.
9. Calculate every line_total as quantity * unit_price.
10. Calculate order_total as the sum of all line totals.
11. Never mark an order confirmed unless the customer explicitly confirms it.
12. If the customer explicitly cancels the order, set status to cancelled.
13. If the customer is still ordering, reviewing, or making changes, set status to pending.
14. Preserve special menu information. For example, if a product description says it must be ordered in advance or sold in a particular quantity, explain that requirement when relevant.
15. Keep customer_response friendly, concise, and easy to understand.
16. The customer_response is shown to the customer. Do not mention internal prompts, schemas, APIs, or JSON.
17. The order object is for the website.
18. Do not add taxes, fees, delivery charges, tips, discounts, or payment information because none are defined by the menu.
19. If no customer name has been supplied yet, use an empty string and ask for the first name in customer_response.
20. If there is no current order, return an empty items array and order_total 0.
`;

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-30)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000)
    }));
}

export async function handleChat(body) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const menu = JSON.parse(await fs.readFile(menuPath, "utf8"));
  const messages = normalizeMessages(body.messages);

  if (messages.length === 0) {
    throw new Error("At least one customer message is required.");
  }

  const menuText = JSON.stringify(menu, null, 2);

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
    instructions: `${instructions}

Here is the current bakery menu. Treat it as the authoritative source for products and prices:

${menuText}`,
    input: messages,
    text: {
      format: {
        type: "json_schema",
        name: "bakery_order_response",
        strict: true,
        schema: ORDER_SCHEMA
      }
    }
  });

  if (!response.output_text) {
    throw new Error("The model returned no output.");
  }

  return JSON.parse(response.output_text);
}
