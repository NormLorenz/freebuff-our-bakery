/* ============================================================
   Crumb & Craft — script.js
   Theme toggle, mobile nav, menu filters, reveal-on-scroll,
   scroll-spy, newsletter validation.
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

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
