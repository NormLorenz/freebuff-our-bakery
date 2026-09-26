# 🥐 Crumb & Craft — Neighborhood Bakery Website

A simple, responsive website for a local bakery, built with plain **HTML and CSS** plus **TypeScript** (compiled to plain JS — no frameworks, no runtime dependencies).

## Overview

**Crumb & Craft** is a fictional neighborhood bakery site featuring:

- **Hero section** — tagline, call-to-action buttons, and quick stats
- **Menu** — 8 items (breads, pastries, cakes) with category filter chips (All / Breads / Pastries / Cakes)
- **About** — the bakery's story and values
- **Gallery** — a grid of recent bakes
- **Visit** — address, hours, contact info, plus a demo newsletter signup form (front-end validation only; no email is actually sent)
- **Footer** — with auto-updating copyright year

## Features

- 🌗 **Light & dark mode** — toggle via the ☀️/🌙 button in the header. The choice is saved to `localStorage` and restored on the next visit. First-time visitors automatically get their OS preference (`prefers-color-scheme`). The theme is applied by an inline script in `<head>` **before first paint**, so there's no flash of the wrong theme.
- 📱 **Fully responsive** — the nav collapses into a burger menu below ~760px; grids adapt with `auto-fill` columns.
- ✨ **Progressive enhancements** — fade-in cards on scroll (via `IntersectionObserver`), scroll-spy that highlights the current section in the nav, and animated menu filtering. All respect `prefers-reduced-motion`.
- ♿ **Accessible** — skip link, ARIA labels on icon buttons, keyboard-friendly Escape-to-close mobile nav, visible focus outlines.
- 🧩 **Easy theming** — every color is a CSS custom property. The whole dark palette is swapped by a single `[data-theme="dark"]` block in `styles.css`.

## Project Structure

```
bakery-website/
├── index.html      # All page content and structure
├── styles.css      # Styling + light/dark themes (CSS variables)
├── script.ts       # TypeScript source: theme toggle, nav, filters, scroll effects
├── tsconfig.json   # TypeScript compiler options
├── dist/
│   └── script.js   # Compiled output loaded by index.html
└── package.json    # `npm run build` / `npm run watch`
```

## Launching the Website

### Editing the JavaScript

The script source is [`script.ts`](script.ts). After changing it, recompile the `dist/script.js` that `index.html` loads:

```bash
npm install        # first time only
npm run build      # or: npm run watch to recompile on every save
```

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
- **Newsletter** — wire the form handler in `script.ts` to your email service or backend endpoint (then `npm run build`)

## Browser Support

Works in all modern browsers (Chrome, Edge, Firefox, Safari). Uses widely supported features like CSS custom properties, `color-mix()`, `aspect-ratio`, and `IntersectionObserver`.

---

> **Note:** This site was created with AI assistance using the **GLM 5.3 Flash** model, from the initial prompt *'Create an HTML, CSS, and JS website for a local bakery. Provide light mode and dark mode.'*
