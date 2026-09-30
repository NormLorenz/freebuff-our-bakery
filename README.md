# 🥐 Crumb & Craft — Neighborhood Bakery Website

A simple, responsive website for a local bakery, built with plain **HTML, CSS, and JavaScript** — no frameworks, no build step, no runtime dependencies.

## Overview

**Crumb & Craft** is a fictional neighborhood bakery site featuring:

- **Hero section** — tagline, call-to-action buttons, and quick stats
- **Menu** — data-driven from `menu.json` (8 items: breads, pastries, cakes) with category filter chips (All / Breads / Pastries / Cakes)
- **About** — the bakery's story and values
- **Gallery** — a grid of recent bakes
- **Budget calculator** — set a spending budget, tally up menu items with quantity steppers, and see at a glance whether you're under or over
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

## Project Structure

```
bakery-website/
├── index.html   # Page structure (menu cards & filter chips are rendered by JS)
├── menu.json    # Menu data: items, categories, prices, badges
├── styles.css   # Styling + light/dark themes (CSS variables)
├── script.js    # Loads menu.json, then theme toggle, nav, filters, budget calculator, scroll effects (loaded with `defer`)
└── README.md    # This file
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

### Option 1 — Local development server (recommended)

A local server most closely mimics real hosting and avoids any browser quirks with `file://` URLs. Run **one** of these from this folder:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code: install the "Live Server" extension, then right-click index.html → "Open with Live Server"
```

Then visit:

```
http://localhost:8000
```

For hosting, any static host works as-is — GitHub Pages, Netlify, Cloudflare Pages, etc.

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
