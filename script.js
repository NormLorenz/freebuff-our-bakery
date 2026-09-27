/* ============================================================
   Crumb & Craft — script.js
   Theme toggle, mobile nav, menu filters, reveal-on-scroll,
   scroll-spy, newsletter validation, budget calculator.
   ============================================================ */

(() => {
  "use strict";

  /* ---------------- Theme (light / dark) ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");

  const getTheme = () => root.dataset.theme === "dark" ? "dark" : "light";

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("cc-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  };

  if (themeToggle) {
    // Keep the inline <head> script's decision in sync with storage/label.
    themeToggle.addEventListener("click", () => {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    });
  }

  // If the OS preference changes and the user hasn't chosen a theme, follow it.
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkQuery.addEventListener?.("change", (e) => {
    if (!localStorage.getItem("cc-theme")) {
      root.dataset.theme = e.matches ? "dark" : "light";
    }
  });

  /* ---------------- Mobile navigation ---------------- */
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");

  const closeNav = () => {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the mobile menu when a link is chosen or when clicking outside.
    siteNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });

    document.addEventListener("click", (e) => {
      if (
        siteNav.classList.contains("is-open") &&
        !e.target.closest("#site-nav") &&
        !e.target.closest("#nav-toggle")
      ) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // Reset state if resizing up to desktop.
    window.matchMedia("(min-width: 761px)").addEventListener?.("change", (e) => {
      if (e.matches) closeNav();
    });
  }

  /* ---------------- Menu category filters ---------------- */
  const chips = Array.from(document.querySelectorAll(".chip[data-filter]"));
  const menuCards = Array.from(document.querySelectorAll("#menu-grid .menu-card"));
  const emptyMessage = document.getElementById("menu-empty");

  if (chips.length && menuCards.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter;

        chips.forEach((c) => {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-pressed", String(c === chip));
        });

        let visibleCount = 0;
        menuCards.forEach((card) => {
          const match = filter === "all" || card.dataset.category === filter;
          card.classList.toggle("is-hiding", !match);
          if (match) visibleCount += 1;
        });

        if (emptyMessage) {
          emptyMessage.hidden = visibleCount !== 0;
        }
      });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  const revealEls = Array.from(document.querySelectorAll(".menu-card, .gallery-item"));

  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ---------------- Scroll-spy for nav links ---------------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("is-current", link.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------- Newsletter (front-end only) ---------------- */
  const form = document.getElementById("newsletter");
  const emailInput = document.getElementById("newsletter-email");
  const note = document.getElementById("form-note");

  if (form && emailInput && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = emailInput.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      emailInput.classList.toggle("is-invalid", !valid);
      note.classList.toggle("is-success", valid);
      note.classList.toggle("is-error", !valid);

      if (!valid) {
        note.textContent = "Please enter a valid email address.";
        emailInput.focus();
        return;
      }

      // Demo only: no backend. Swap this for a real API call later.
      note.textContent = "Thanks! You're on the list (demo — no email was sent). 🥐";
      form.reset();
    });
  }

  /* ---------------- Budget calculator ---------------- */
  const calc = {
    grid: document.getElementById("calc-items"),
    budgetInput: document.getElementById("calc-budget-input"),
    budgetDisplay: document.getElementById("calc-budget-display"),
    summaryList: document.getElementById("calc-summary-list"),
    summaryEmpty: document.getElementById("calc-summary-empty"),
    totalCount: document.getElementById("calc-total-count"),
    totalCost: document.getElementById("calc-total-cost"),
    status: document.getElementById("calc-status"),
    clearBtn: document.getElementById("calc-clear"),
  };

  if (calc.grid && calc.budgetInput && calc.summaryList && calc.status) {
    const money = (n) => `$${n.toFixed(2)}`;
    const counts = new Map(); // itemId -> quantity

    // Pull items live from the menu cards so prices never drift out of sync
    const items = Array.from(document.querySelectorAll("#menu-grid .menu-card"))
      .map((card, index) => {
        const nameEl = card.querySelector("h3");
        const priceEl = card.querySelector(".price");
        const price = parseFloat((priceEl?.textContent || "").replace(/[^0-9.]/g, "")) || 0;
        return {
          id: `item-${index}`,
          name: nameEl ? nameEl.textContent.trim() : `Item ${index + 1}`,
          price,
        };
      })
      .filter((item) => item.price > 0);

    // Build the item rows once (names come from our own markup, not user input)
    calc.grid.innerHTML = items
      .map(
        (item) => `
      <li class="calc-item is-zero" data-item-id="${item.id}">
        <span class="calc-item-name">${item.name}</span>
        <span class="calc-item-price">${money(item.price)}</span>
        <span class="calc-stepper">
          <button type="button" class="calc-step" data-step="-1" aria-label="Remove one ${item.name}">−</button>
          <span class="calc-qty" data-qty>0</span>
          <button type="button" class="calc-step" data-step="1" aria-label="Add one ${item.name}">+</button>
        </span>
      </li>`
      )
      .join("");

    const update = () => {
      let count = 0;
      let total = 0;
      items.forEach((item) => {
        const qty = counts.get(item.id) || 0;
        count += qty;
        total += qty * item.price;
      });
      total = Math.round(total * 100) / 100;

      // Summary rows for chosen items
      const chosen = items.filter((item) => (counts.get(item.id) || 0) > 0);
      calc.summaryList.innerHTML = chosen
        .map((item) => {
          const qty = counts.get(item.id) || 0;
          return `<li><span>${qty} × ${item.name}</span><span>${money(qty * item.price)}</span></li>`;
        })
        .join("");
      calc.summaryList.hidden = chosen.length === 0;
      calc.summaryEmpty.hidden = chosen.length > 0;

      calc.totalCount.textContent = String(count);
      calc.totalCost.textContent = money(total);

      // Per-item rows: qty readout + dimmed when zero
      calc.grid.querySelectorAll(".calc-item").forEach((row) => {
        const qty = counts.get(row.dataset.itemId) || 0;
        row.querySelector("[data-qty]").textContent = String(qty);
        row.classList.toggle("is-zero", qty === 0);
      });

      // Budget comparison + status message
      const budget = parseFloat(calc.budgetInput.value);
      const hasBudget = Number.isFinite(budget) && budget >= 0;
      calc.budgetDisplay.textContent = hasBudget ? money(budget) : "—";
      calc.budgetDisplay.classList.remove("is-over", "is-exact", "is-under");

      let status;
      if (!hasBudget) {
        status = count > 0 ? "Add a budget above to check your total." : "Set a budget to get started.";
      } else if (total > budget) {
        calc.budgetDisplay.classList.add("is-over");
        status = `Over budget by ${money(total - budget)}. The croissant is worth it, though.`;
      } else if (count === 0) {
        status = `${money(budget)} to spend — start adding items!`;
      } else if (total === budget) {
        calc.budgetDisplay.classList.add("is-exact");
        status = "Exactly on budget. Impeccable math. 🎯";
      } else {
        calc.budgetDisplay.classList.add("is-under");
        status = `Under budget with ${money(budget - total)} to spare.`;
      }
      calc.status.textContent = status;
      calc.clearBtn.disabled = count === 0;
    };

    // Quantity steppers (event delegation on the item list)
    calc.grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".calc-step");
      if (!btn) return;
      const row = btn.closest(".calc-item");
      const id = row?.dataset.itemId;
      if (!id) return;
      const delta = Number(btn.dataset.step) || 0;
      counts.set(id, Math.max(0, Math.min(99, (counts.get(id) || 0) + delta)));
      update();
    });

    calc.budgetInput.addEventListener("input", update);

    // Quick budget chips ($5 / $10 / $20)
    document.querySelectorAll("#calculator [data-budget]").forEach((chip) => {
      chip.addEventListener("click", () => {
        calc.budgetInput.value = chip.dataset.budget;
        update();
      });
    });

    calc.clearBtn.addEventListener("click", () => {
      counts.clear();
      update();
    });

    update();
  }

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
