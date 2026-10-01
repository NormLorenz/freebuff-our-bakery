import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleChat } from "./api/chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "100kb" }));

// menu.json lives in the project root (shared with the chat API in api/),
// so expose it explicitly — express.static(public) can't see it.
app.get("/menu.json", (_req, res) => {
  res.sendFile(path.join(__dirname, "menu.json"));
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    const result = await handleChat(req.body ?? {});
    res.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Unable to process the bakery order right now."
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Bakery chatbot running at http://localhost:${port}`);
});
