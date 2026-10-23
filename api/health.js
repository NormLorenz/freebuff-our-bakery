import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Same source of truth as api/chat.js and the front-end: public/menu.json.
const menuPath = path.join(__dirname, "..", "public", "menu.json");

export default async function handler(_req, res) {
  try {
    const menu = JSON.parse(await readFile(menuPath, "utf8"));
    res.status(200).json({
      ok: true,
      items: menu.items.length,
      hasKey: Boolean(process.env.OPENAI_API_KEY)
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      ok: false,
      error: "Menu file missing or unreadable — deployment is broken."
    });
  }
}
