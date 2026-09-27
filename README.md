# 🥐 Crumb & Craft — Neighborhood Bakery Website

A simple, responsive website for a local bakery, built with plain **HTML, CSS, and JavaScript** — no frameworks, no build step, no runtime dependencies.

## Overview

**Crumb & Craft** is a fictional neighborhood bakery site featuring:

- **Hero section** — tagline, call-to-action buttons, and quick stats
- **Menu** — 8 items (breads, pastries, cakes) with category filter chips (All / Breads / Pastries / Cakes)
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
- 🧮 **Budget calculator** — enter a budget (or tap the $5 / $10 / $20 quick chips) and add menu items with +/− steppers. The tally shows item count, cent-accurate total, and a live status message for under / exact / over budget. Prices are read straight from the menu cards at load, so editing a price in `index.html` updates the calculator automatically — no duplicate data to maintain.

## Project Structure

```
bakery-website/
├── index.html   # All page content and structure
├── styles.css   # Styling + light/dark themes (CSS variables)
├── script.js    # Theme toggle, nav, filters, budget calculator, scroll effects (loaded with `defer`)
└── README.md    # This file
```

## Launching the Website

### Option 1 — Double-click (simplest)

Open File Explorer, navigate to this folder, and **double-click `index.html`**. It opens in your default browser — no server needed, since there's no backend.

### Option 2 — Paste the direct URL

Copy this into your browser's address bar (adjust the path if you moved the folder):

```
file:///C:/Users/norml/code/freebuff-code/bakery-website/index.html
```

### Option 3 — Local development server (recommended)

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

## Customizing

- **Name, address, hours, menu items** — edit the text directly in `index.html`
- **Colors** — change the CSS variables at the top of `styles.css` (`:root` for light mode, `[data-theme="dark"]` for dark mode)
- **Fonts** — swap the Google Fonts link in `index.html` and the `--font-*` variables in `styles.css`
- **Real photos** — replace the emoji placeholders in the menu, gallery, and about sections with `<img>` tags
- **Prices** — edit a price in `index.html` and the budget calculator picks it up automatically (it reads prices from the menu cards on load)
- **Newsletter** — wire the form handler in `script.js` to your email service or backend endpoint

## Browser Support

Works in all modern browsers (Chrome, Edge, Firefox, Safari). Uses widely supported features like CSS custom properties, `color-mix()`, `aspect-ratio`, and `IntersectionObserver`.

---

> **Note:** This site was created with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Create an HTML, CSS, and JS website for a local bakery. Provide light mode and dark mode.'*

> **Note:** Updated the site with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Please add a calculator so the user can tally up how much bakery products they can buy.'*
