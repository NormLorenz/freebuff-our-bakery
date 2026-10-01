/* ============================================================
   Crumb & Craft — script.js
   Loads menu data from menu.json, then wires up: theme toggle,
   mobile nav, menu filters, reveal-on-scroll, scroll-spy,
   newsletter validation, budget calculator.
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

  /* ---------------- Menu data (driven by menu.json) ---------------- */
  const filterBar = document.getElementById("filter-bar");
  const menuGrid = document.getElementById("menu-grid");
  const menuStatus = document.getElementById("menu-status");
  const emptyMessage = document.getElementById("menu-empty");

  // All menu content comes from our own JSON file, but escape it anyway
  // so a stray quote or angle bracket can't break the markup.
  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (ch) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));

  const formatPrice = (price) =>
    "$" + (Number.isInteger(price) ? String(price) : price.toFixed(2));

  const initMenuFilters = () => {
    const chips = Array.from(filterBar.querySelectorAll(".chip[data-filter]"));
    const menuCards = Array.from(menuGrid.querySelectorAll(".menu-card"));
    if (!chips.length || !menuCards.length) return;

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
  };

  const observeReveals = (elements) => {
    if (!("IntersectionObserver" in window) || !elements.length) return;

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

    elements.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
  };

  const showMenuError = () => {
    if (!menuStatus) return;
    menuStatus.textContent =
      "We couldn't load the menu (menu.json). If you opened this page directly " +
      "from your file system, browsers block local data fetches — serve the " +
      'project root instead, e.g. "npm start" or "npx serve ." from the folder ' +
      "that contains menu.json, then open the /public/ URL.";
    menuStatus.hidden = false;
  };

  const renderMenu = (data) => {
    const categories =
      Array.isArray(data.categories) && data.categories.length
        ? data.categories
        : [
            { id: "all", label: "All" },
            { id: "bread", label: "Breads" },
            { id: "pastry", label: "Pastries" },
            { id: "cake", label: "Cakes" },
          ];

    const items = (Array.isArray(data.items) ? data.items : []).filter(
      (item) => item && item.name && Number(item.price) > 0
    );

    if (filterBar) {
      filterBar.innerHTML = categories
        .map(
          (category, index) => `
            <button class="chip${index === 0 ? " is-active" : ""}" data-filter="${escapeHtml(category.id)}" type="button" aria-pressed="${index === 0}">${escapeHtml(category.label)}</button>`
        )
        .join("");
    }

    if (menuGrid) {
      menuGrid.innerHTML = items
        .map(
          (item) => `
            <article class="menu-card" data-category="${escapeHtml(item.category || "")}">
              <div class="menu-card-media" aria-hidden="true">${escapeHtml(item.emoji || "🍽️")}</div>
              <div class="menu-card-body">
                <div class="menu-card-top">
                  <h3>${escapeHtml(item.name)}</h3>
                  <span class="price">${formatPrice(Number(item.price))}</span>
                </div>
                <p>${escapeHtml(item.description || "")}</p>
                ${item.badge && item.badge.text
                  ? `<span class="badge badge-${escapeHtml(item.badge.style || "popular")}">${escapeHtml(item.badge.text)}</span>`
                  : ""}
              </div>
            </article>`
        )
        .join("");
    }

    if (emptyMessage && items.length === 0) {
      emptyMessage.hidden = false;
    }

    // Dependent features can only run once the cards exist.
    initMenuFilters();
    observeReveals(Array.from(document.querySelectorAll(".menu-card, .gallery-item")));
    initCalculator();
  };

  // menu.json lives in the project root (shared with the chat API), while
  // this script lives in public/. Try the usual relative locations and take
  // the first response that is both OK and actually menu-shaped data, so the
  // site works whether the server root is the project root or public/.
  const looksLikeMenu = (data) =>
    data && typeof data === "object" && Array.isArray(data.items);

  (async () => {
    const candidates = ["menu.json", "../menu.json", "/menu.json"];
    for (const url of candidates) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        if (!looksLikeMenu(data)) continue; // e.g. an HTML fallback page
        renderMenu(data);
        return;
      } catch {
        // Try the next candidate location.
      }
    }
    showMenuError();
  })();

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
  const initCalculator = () => {
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

      // Pull items live from the rendered menu cards (built from menu.json)
      // so prices never drift out of sync
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
  };

  /* ---------------- Chat ordering assistant (POST /api/chat) ---------------- */
  const initChat = () => {
    const chatWindow = document.getElementById("chat-window");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatSend = chatForm ? chatForm.querySelector(".chat-send") : null;
    const resetBtn = document.getElementById("chat-reset");
    const orderStatusEl = document.getElementById("order-status");
    const orderCustomerEl = document.getElementById("order-customer");
    const orderCustomerNameEl = document.getElementById("order-customer-name");
    const orderItemsEl = document.getElementById("order-items");
    const orderEmptyEl = document.getElementById("order-empty");
    const orderTotalEl = document.getElementById("order-total");
    const confirmBtn = document.getElementById("order-confirm");
    const cancelBtn = document.getElementById("order-cancel");

    if (!chatWindow || !chatForm || !chatInput || !chatSend) return;

    const GREETING =
      "Welcome to Crumb & Craft Bakery! What can I help you order today?";

    // Conversation history sent to /api/chat. The greeting is display-only.
    let messages = [];
    let order = null;
    let awaitingReply = false;

    const money = (n) => "$" + Number(n || 0).toFixed(2);

    const addMessage = (role, text) => {
      const row = document.createElement("div");
      row.className = "chat-msg" + (role === "user" ? " is-user" : " is-bot");

      if (role !== "user") {
        const avatar = document.createElement("span");
        avatar.className = "chat-msg-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = "🥐";
        row.appendChild(avatar);
      }

      const bubble = document.createElement("div");
      bubble.className = "chat-bubble";
      const p = document.createElement("p");
      p.className = "chat-msg-text";
      p.textContent = text; // textContent, never innerHTML — messages are untrusted
      bubble.appendChild(p);
      row.appendChild(bubble);

      chatWindow.appendChild(row);
      chatWindow.scrollTop = chatWindow.scrollHeight;
      return row;
    };

    const showTyping = () => {
      const row = addMessage("assistant", "...");
      row.classList.add("is-typing");
      const text = row.querySelector(".chat-msg-text");
      if (text) {
        text.innerHTML = "<span class=\"chat-typing\" aria-label=\"Assistant is typing\"><i></i><i></i><i></i></span>";
      }
      chatWindow.scrollTop = chatWindow.scrollHeight;
      return row;
    };

    const setBusy = (busy) => {
      awaitingReply = busy;
      chatInput.disabled = busy;
      chatSend.disabled = busy;
      refreshOrderButtons();
      if (!busy) chatInput.focus();
    };

    const refreshOrderButtons = () => {
      const hasItems = Boolean(order && Array.isArray(order.items) && order.items.length > 0);
      const isPending = Boolean(order && order.status === "pending");
      const enable = hasItems && isPending && !awaitingReply;
      if (confirmBtn) confirmBtn.disabled = !enable;
      if (cancelBtn) cancelBtn.disabled = !enable;
      if (resetBtn) resetBtn.disabled = awaitingReply || messages.length === 0;
    };

    const renderOrder = (nextOrder) => {
      order = nextOrder || null;

      const items = order && Array.isArray(order.items) ? order.items : [];
      const status = order && typeof order.status === "string" ? order.status : "pending";
      const firstName = order && order.customer && typeof order.customer.first_name === "string"
        ? order.customer.first_name.trim()
        : "";

      if (orderStatusEl) {
        orderStatusEl.textContent = status.toUpperCase();
        orderStatusEl.dataset.status = status;
      }

      if (orderCustomerEl && orderCustomerNameEl) {
        orderCustomerEl.hidden = firstName === "";
        orderCustomerNameEl.textContent = firstName;
      }

      if (orderItemsEl) {
        orderItemsEl.innerHTML = items
          .map((item) => {
            const name = escapeHtml(item && item.name ? item.name : "Item");
            const qty = Number(item && item.quantity) || 0;
            const lineTotal = money(item && item.line_total);
            const unit = Number(item && item.unit_price) || 0;
            return `
              <li class="order-item">
                <div class="order-item-text">
                  <span class="order-item-name">${qty} × ${name}</span>
                  <span class="order-item-unit">${money(unit)} each</span>
                </div>
                <span class="order-item-price">${lineTotal}</span>
              </li>`;
          })
          .join("");
      }

      if (orderEmptyEl) orderEmptyEl.hidden = items.length > 0;

      if (orderTotalEl) {
        orderTotalEl.textContent = money(
          order && Number.isFinite(Number(order.order_total)) ? Number(order.order_total) : 0
        );
      }

      refreshOrderButtons();
    };

    const askAssistant = (userText) => {
      if (awaitingReply) return;
      const text = String(userText || "").trim();
      if (!text) return;

      messages.push({ role: "user", content: text.slice(0, 500) });
      addMessage("user", text);
      chatInput.value = "";

      const typing = showTyping();
      setBusy(true);

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Chat request failed: " + response.status);
          return response.json();
        })
        .then((data) => {
          typing.remove();
          if (!data || typeof data.customer_response !== "string") {
            throw new Error("Unexpected response from the assistant.");
          }
          messages.push({ role: "assistant", content: data.customer_response });
          addMessage("assistant", data.customer_response);
          renderOrder(data.order);
        })
        .catch(() => {
          typing.remove();
          // Roll back the unsent user message so history stays honest.
          if (messages.length && messages[messages.length - 1].role === "user") {
            messages.pop();
          }
          addMessage(
            "assistant",
            "Sorry — the oven light is on and I couldn't reach the kitchen. Please try again in a moment."
          );
        })
        .finally(() => setBusy(false));
    };

    const startOver = () => {
      if (awaitingReply) return;
      messages = [];
      chatWindow.innerHTML = "";
      addMessage("assistant", GREETING);
      renderOrder(null);
      chatInput.focus();
    };

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      askAssistant(chatInput.value);
    });

    if (resetBtn) resetBtn.addEventListener("click", startOver);
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => askAssistant("Confirm my order."));
    }
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => askAssistant("Cancel my order."));
    }

    // Initial state
    addMessage("assistant", GREETING);
    renderOrder(null);
  };

  initChat();

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
