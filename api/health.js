import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// On Vercel, functions run against the deployment where menu.json has been
// copied into public/ by the build command (see vercel.json).
const menuPath = process.env.VERCEL
  ? path.join(__dirname, "..", "public", "menu.json")
  : path.join(__dirname, "..", "menu.json");

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
