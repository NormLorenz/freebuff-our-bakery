# 🥐 Crumb & Craft — Neighborhood Bakery Website

A simple, responsive website for a local bakery. The site itself is plain **HTML, CSS, and JavaScript** — no frameworks and no build step — with an optional Express server that powers the chatbot ordering API.

## Overview

**Crumb & Craft** is a fictional neighborhood bakery site featuring:

- **Hero section** — tagline, call-to-action buttons, and quick stats
- **Menu** — data-driven from `menu.json` (8 items: breads, pastries, cakes) with category filter chips (All / Breads / Pastries / Cakes)
- **About** — the bakery's story and values
- **Gallery** — a grid of recent bakes
- **Budget calculator** — set a spending budget, tally up menu items with quantity steppers, and see at a glance whether you're under or over
- **Order** — a working chat ordering assistant: a two-panel layout with the chat on the left and a live "Your Order" summary on the right (customer name, items with unit prices, total, and a PENDING/CONFIRMED/CANCELLED status badge). Messages go through `POST /api/chat` (OpenAI, structured JSON output), with Start over / Confirm Order / Cancel Order controls and typing-indicator feedback
- **Visit** — address, hours, contact info, plus a demo newsletter signup form (front-end validation only; no email is actually sent)
- **Footer** — with auto-updating copyright year

## Features

- 🌗 **Light & dark mode** — toggle via the ☀️/🌙 button in the header. The choice is saved to `localStorage` and restored on the next visit. First-time visitors automatically get their OS preference (`prefers-color-scheme`). The theme is applied by an inline script in `<head>` **before first paint**, so there's no flash of the wrong theme.
- 📱 **Fully responsive** — the nav collapses into a burger menu below ~760px; grids adapt with `auto-fill` columns.
- ✨ **Progressive enhancements** — fade-in cards on scroll (via `IntersectionObserver`), scroll-spy that highlights the current section in the nav, and animated menu filtering. All respect `prefers-reduced-motion`.
- ♿ **Accessible** — skip link, ARIA labels on icon buttons, keyboard-friendly Escape-to-close mobile nav, visible focus outlines.
- 🧩 **Easy theming** — every color is a CSS custom property. The whole dark palette is swapped by a single `[data-theme="dark"]` block in `styles.css`.
- 🧮 **Budget calculator** — enter a budget (or tap the $5 / $10 / $20 quick chips) and add menu items with +/− steppers. The tally shows item count, cent-accurate total, and a live status message for under / exact / over budget. Prices are read straight from the rendered menu cards at load, so editing a price in `menu.json` updates the calculator automatically — no duplicate data to maintain.
- 🗂️ **JSON-driven menu** — the whole menu (items, categories, filter chips, badges) lives in `menu.json` and is rendered by `script.js` at load. Add, remove, or reprice items without touching `index.html`. Still fully static: no backend, no build step.
- 💬 **Order-by-chat** — the `#order` section's chat is wired to `POST /api/chat`. The front-end keeps the conversation history, renders the assistant's replies, and mirrors the structured `order` object (customer, items, total, status) into the order panel. Confirm/Cancel send an explicit message back to the assistant so the model updates the order status; "Start over" resets the conversation. If the API is unreachable or `OPENAI_API_KEY` is missing, the chat shows a friendly error bubble instead of breaking.

## Project Structure

```
bakery-website/
├── menu.json                # Menu data: items, categories, prices, badges (shared by site + chat API)
├── server.js                # Express server: serves public/, menu.json, and POST /api/chat
├── public/                  # Static site (served over HTTP)
│   ├── index.html           # Page structure (menu cards & filter chips are rendered by JS)
│   ├── styles.css           # Styling + light/dark themes (CSS variables)
│   ├── script.js            # Loads ../menu.json, then theme toggle, nav, filters, budget calculator, scroll effects (loaded with `defer`)
│   └── images/              # Site images
├── api/                     # Backend (chat API)
│   └── chat.js              # OpenAI-powered ordering assistant (returns structured JSON orders)
├── .env.example             # Template for OPENAI_API_KEY, OPENAI_MODEL, and PORT
└── README.md                # This file
```

### Menu data format (`menu.json`)

```jsonc
{
  "categories": [
    { "id": "bread", "label": "Breads" }   // ids must be unique; "all" is just the first chip
  ],
  "items": [
    {
      "id": "sourdough",                       // unique, used by the calculator
      "name": "Country Sourdough",
      "category": "bread",                     // must match a category id
      "price": 7.5,                            // number, USD
      "emoji": "🍞",                            // card image placeholder
      "description": "Natural levain, 36-hour cold ferment, blistered crust.",
      "badge": { "text": "Most loved", "style": "popular" }  // optional; style: popular | new | order
    }
  ]
}
```

Items with a missing name or a price ≤ 0 are skipped, and missing optional fields fall back to sensible defaults.

## Launching the Website

### ⚠️ Don't double-click `index.html`

The menu is fetched from `menu.json`, and browsers block `fetch()` on `file://` pages. Opening the file directly shows an explanation instead of the menu (everything else on the page still works). Serve it over HTTP using one of the options below.

### Option 1 — The included chat server (recommended)

You'll need a current [Node.js](https://nodejs.org) LTS release installed. Then install dependencies once and start the server:

```bash
npm install
npm start
```

> **Tip:** There is no `npm serve` command — `serve` is not a built-in npm command. Use `npm start`, or `npm run dev` to auto-restart whenever the server code changes.

`npm start` runs `server.js`, which serves the site, `menu.json`, and the `/api/chat` endpoint on one port. Then visit `http://localhost:3000` (or add `/public/` — both work).

The site works out of the box, but the chat endpoint needs an OpenAI API key: copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell) and set `OPENAI_API_KEY` (you can also adjust `OPENAI_MODEL` and `PORT`).

### Deployment

- **Static site only** — any static host works as-is for the site itself: GitHub Pages, Netlify, Cloudflare Pages, etc. (chat ordering won't work without the API).
- **Full project** — any Node.js-capable host: Render, Railway, Vercel, or your own server. Set `OPENAI_API_KEY` there and run `npm start`.
- **Hybrid** — keep the static frontend where it is and deploy only `api/chat.js` as a serverless function, with a small path adjustment so it can still find `menu.json` (it currently reads `../menu.json` relative to the `api/` folder).

## How the Chat Ordering Works

```
Customer
   ↓
Bakery website (public/)
   ↓  POST /api/chat
server.js (Express)
   ↓
api/chat.js → OpenAI Responses API
   ↓  Structured Outputs (strict JSON Schema)
Website
   ├── assistant reply in the chat panel
   └── live order summary on the right
```

- The backend is Node.js + Express using the official `openai` SDK. The endpoint uses OpenAI's **Responses API** (the Assistants API was sunset in August 2026, so Responses is what OpenAI recommends for new integrations) with **Structured Outputs**: the reply must conform to a JSON Schema, which is more reliable than just asking the model to "please return JSON".
- The full contents of `menu.json` are sent to the model with **every request**, so prices and item names can never drift from the menu shown on the site. The assistant is instructed to never invent products, IDs, or prices, and to preserve special menu rules (e.g. Chocolate Cupcakes are sold in fours; the Vanilla Bean Celebration Cake requires 3 days' notice).
- The server keeps no conversation state — the front-end sends the recent message history with each request. There's also a small `GET /api/health` check.
- A typical response looks like:

```json
{
  "customer_response": "Great choice, Mary! ...",
  "order": {
    "customer": { "first_name": "Mary" },
    "items": [
      { "id": "croissant", "name": "Butter Croissant", "quantity": 2, "unit_price": 4.25, "line_total": 8.5 }
    ],
    "order_total": 8.5,
    "status": "pending"
  }
}
```

The `customer_response` is shown in the chat; the `order` object drives the "Your Order" panel (status: `pending` / `confirmed` / `cancelled`).

### Try this conversation

Once the server is running, open the Order section and try:

> Hi, my name is Mary. I'd like two butter croissants and one Country Sourdough.

> Add four chocolate cupcakes.

> Actually, remove one croissant.

> Confirm my order.

The right-hand order panel updates as the conversation progresses. If you omit your name or an item quantity, the assistant asks for it rather than guessing.

## Limitations

This is a **working ordering demo**, not a production ordering system:

- **Confirm does not send a real order.** It flips the order status to `confirmed` in the browser only — nothing is sent to the bakery.
- **No payments, inventory, or POS integration.** Nothing is charged, reserved, or forwarded anywhere.
- **No server-side order storage.** The order exists only in the user's browser session.

Because the order is already structured data (customer, items, totals, status), the natural next step is posting confirmed orders to a database and building a small bakery dashboard that lists incoming orders.

## Security

- The OpenAI call happens entirely in `api/chat.js` on the server. The API key is read from `OPENAI_API_KEY` and is **never** sent to the browser or placed in any front-end file.
- Before accepting real orders or payments, add authentication, rate limiting, and server-side order storage to a trusted backend.

## Customizing

- **Menu items, prices, categories, badges** — edit `menu.json` (see the data format above); the menu section, filter chips, and budget calculator all update from it
- **Colors** — change the CSS variables at the top of `styles.css` (`:root` for light mode, `[data-theme="dark"]` for dark mode)
- **Fonts** — swap the Google Fonts link in `index.html` and the `--font-*` variables in `styles.css`
- **Real photos** — replace the emoji placeholders in the menu, gallery, and about sections with `<img>` tags
- **Prices** — edit a price in `menu.json`; the budget calculator picks it up automatically (it reads prices from the rendered menu cards on load)
- **Newsletter** — wire the form handler in `script.js` to your email service or backend endpoint

## Browser Support

Works in all modern browsers (Chrome, Edge, Firefox, Safari). Uses widely supported features like CSS custom properties, `color-mix()`, `aspect-ratio`, and `IntersectionObserver`.

---

> **Note:** This site was created with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Create an HTML, CSS, and JS website for a local bakery. Provide light mode and dark mode.'*

> **Note:** Updated the site with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Please add a calculator so the user can tally up how much bakery products they can buy.'*

> **Note:** Updated the site with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Please add a new menu item called 'Order' to the right of the 'Calculator' and build a placeholder in the html file so the user can use a chatbot to order items.'*

> **Note:** The chat ordering assistant was built with AI assistance via ChatGPT, from the prompt *'Please build a complete working bakery chatbot project using the attached menu.json file and using OpenAI API.'*
