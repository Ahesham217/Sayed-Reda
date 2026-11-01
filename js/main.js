(function () {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".hero");
  const nav = document.getElementById("site-nav");
  const menuToggle = document.getElementById("menu-toggle");
  const langToggle = document.getElementById("lang-toggle");
  const progress = document.getElementById("scroll-bar");
  const theme = document.querySelector('meta[name="theme-color"]');
  const yearSelect = document.getElementById("cert-year");
  const search = document.getElementById("cert-search");
  const sortBtn = document.getElementById("cert-sort");
  const resetBtn = document.getElementById("cert-reset");
  const table = document.getElementById("cert-table");
  const tbody = table.querySelector("tbody");
  const rows = [...tbody.querySelectorAll("tr")];
  const empty = document.getElementById("cert-empty");
  const DESKTOP = 1180;
  const TEXT = {
    ar: {
      title: "السيد رضا السيد | مهندس برمجيات وخدمات فنية",
      description:
        "الموقع المهني للمهندس السيد رضا السيد، مهندس برمجيات وخدمات فنية في شركة الفاليو للتكنولوجيا. أنظمة CAD/CAM/CAE، وSOLIDWORKS، ودعم آلات CNC متعددة المحاور.",
      locale: "ar_EG",
    },
    en: {
      title: "Sayed Reda ELSayed | Software and Service Engineer",
      description:
        "Professional site of Sayed Reda ELSayed, Software and Service Engineer at Value Technologies. CAD/CAM/CAE, SOLIDWORKS, and multi-axis CNC support.",
      locale: "en_US",
    },
  };

  let sortMode = "guide";

  function isArabicChar(ch) {
    return /[\u0600-\u06FF]/.test(ch);
  }

  function isLatinStart(ch) {
    return /[A-Za-z0-9]/.test(ch);
  }

  function segmentMixed(text) {
    const parts = [];
    let i = 0;
    while (i < text.length) {
      let startLatin = isLatinStart(text[i]);
      if (!startLatin && (text[i] === "(" || text[i] === "[")) {
        let k = i + 1;
        while (k < text.length && /[\s]/.test(text[k])) k += 1;
        startLatin = k < text.length && isLatinStart(text[k]);
      }
      if (startLatin) {
        let j = i;
        while (j < text.length && !isArabicChar(text[j])) j += 1;
        while (j > i && " \u00b7\u2010\u2011\u2012\u2013\u2014\u2015\u2212-".includes(text[j - 1])) j -= 1;
        if (j > i && (text[j - 1] === "(" || text[j - 1] === "[")) j -= 1;
        while (j > i && " \u00b7\u2010\u2011\u2012\u2013\u2014\u2015\u2212-".includes(text[j - 1])) j -= 1;
        const slice = text.slice(i, j);
        const opens = (slice.match(/\(/g) || []).length;
        let closes = (slice.match(/\)/g) || []).length;
        while (closes > opens && j > i && text[j - 1] === ")") {
          j -= 1;
          closes -= 1;
        }
        if (j <= i) {
          parts.push({ latin: false, text: text[i] });
          i += 1;
          continue;
        }
        parts.push({ latin: true, text: text.slice(i, j) });
        i = j;
      } else {
        let j = i + 1;
        while (j < text.length) {
          if (isLatinStart(text[j])) break;
          if (text[j] === "(" || text[j] === "[") {
            let k = j + 1;
            while (k < text.length && text[k] === " ") k += 1;
            if (k < text.length && isLatinStart(text[k])) break;
          }
          j += 1;
        }
        parts.push({ latin: false, text: text.slice(i, j) });
        i = j;
      }
    }
    return parts;
  }

  function isolateEmbeddedLatin(scope) {
    const nodes = [];
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || !parent.closest(".lar") || parent.closest(".latin")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (!/[A-Za-z0-9]/.test(node.nodeValue || "")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const parts = segmentMixed(node.nodeValue || "");
      if (!parts.some((part) => part.latin)) return;
      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part.text) return;
        if (part.latin) {
          const span = document.createElement("span");
          span.className = part.text.length > 22 || part.text.includes(" ") ? "latin phrase" : "latin";
          span.lang = "en";
          span.textContent = part.text;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(part.text));
        }
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  isolateEmbeddedLatin(document.body);

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ar";
  }

  function norm(value) {
    return value
      .toLowerCase()
      .replace(/[\u064B-\u0652]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setMeta(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function applyLanguage(next) {
    const html = document.documentElement;
    html.lang = next;
    html.dir = next === "en" ? "ltr" : "rtl";
    try {
      localStorage.setItem("sr-lang", next);
    } catch (err) {
      /* storage can be blocked; the choice still applies for this view */
    }
    document.title = TEXT[next].title;
    setMeta('meta[name="description"]', "content", TEXT[next].description);
    setMeta('meta[property="og:title"]', "content", TEXT[next].title);
    setMeta('meta[property="og:description"]', "content", TEXT[next].description);
    setMeta('meta[property="og:locale"]', "content", TEXT[next].locale);

    document.querySelectorAll("[data-label-ar]").forEach((el) => {
      const value = el.getAttribute(next === "en" ? "data-label-en" : "data-label-ar");
      if (el.classList.contains("cert-table") || el.closest(".cert-table")) {
        el.dataset.label = value;
      }
      if (el.hasAttribute("aria-label") || el.hasAttribute("data-label-ar")) {
        if (el.closest("td")) {
          el.dataset.label = value;
        } else {
          el.setAttribute("aria-label", value);
        }
      }
    });

    document.querySelectorAll(".cert-table td[data-label-ar]").forEach((td) => {
      td.dataset.label = td.getAttribute(next === "en" ? "data-label-en" : "data-label-ar");
    });

    document.querySelectorAll("[data-ph-ar]").forEach((el) => {
      el.placeholder = el.getAttribute(next === "en" ? "data-ph-en" : "data-ph-ar");
    });

    yearSelect.querySelectorAll("option[data-ar]").forEach((opt) => {
      opt.textContent = opt.getAttribute(next === "en" ? "data-en" : "data-ar");
    });

    langToggle.setAttribute(
      "aria-label",
      next === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"
    );
    syncMenuLabel();
    renderCount();
  }

  function syncMenuLabel() {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    const label = lang() === "en"
      ? open ? "Close menu" : "Open menu"
      : open ? "إغلاق القائمة" : "فتح القائمة";
    menuToggle.setAttribute("aria-label", label);
  }

  function closeMenu(restoreFocus) {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    syncMenuLabel();
    if (restoreFocus) menuToggle.focus();
  }

  function openMenu() {
    nav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
    syncMenuLabel();
    const first = nav.querySelector("a");
    if (first) first.focus();
  }

  function updateChrome() {
    const headerBottom = header.getBoundingClientRect().bottom;
    const overHero = hero.getBoundingClientRect().bottom > headerBottom - 1;
    document.documentElement.classList.toggle("at-top", overHero);
    if (theme) theme.setAttribute("content", overHero ? "#14181f" : "#f3efe6");

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.transform = "scaleX(" + amount + ")";

    const marker = headerBottom + 24;
    const sections = [...document.querySelectorAll("main section[id]")];
    let current = "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section.id;
    });
    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function setSort(mode) {
    sortMode = mode;
    sortBtn.dataset.mode = mode;
    const sorted = [...rows];
    if (mode === "newest") {
      sorted.sort((a, b) => {
        const da = a.dataset.date || "";
        const db = b.dataset.date || "";
        if (da === db) return Number(a.dataset.order) - Number(b.dataset.order);
        if (!da) return 1;
        if (!db) return -1;
        return da < db ? 1 : -1;
      });
    } else {
      sorted.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    }
    sorted.forEach((row) => tbody.appendChild(row));
  }

  function visibleCount() {
    return rows.filter((row) => !row.hidden).length;
  }

  function renderCount() {
    const shown = visibleCount();
    const total = rows.length;
    const ar = document.querySelector("#cert-count .lar");
    const en = document.querySelector("#cert-count .len");
    if (ar) ar.textContent = "عرض " + shown + " من " + total;
    if (en) en.textContent = "Showing " + shown + " of " + total;
  }

  function applyFilters() {
    const query = norm(search.value);
    const year = yearSelect.value;
    rows.forEach((row) => {
      const date = row.dataset.date || "";
      const yearOk = year === "all" || (year === "none" ? date === "" : date.slice(0, 4) === year);
      const textOk = !query || norm(row.textContent).includes(query);
      row.hidden = !(yearOk && textOk);
    });
    const shown = visibleCount();
    empty.hidden = shown !== 0;
    table.hidden = shown === 0;
    const dirty = Boolean(query) || year !== "all" || sortMode !== "guide";
    resetBtn.hidden = !dirty;
    renderCount();
  }

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    if (open) closeMenu(false);
    else openMenu();
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= DESKTOP && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });

  langToggle.addEventListener("click", () => {
    applyLanguage(lang() === "en" ? "ar" : "en");
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateChrome();
    });
  }, { passive: true });

  search.addEventListener("input", applyFilters);
  yearSelect.addEventListener("change", applyFilters);
  sortBtn.addEventListener("click", () => {
    setSort(sortMode === "guide" ? "newest" : "guide");
    applyFilters();
  });
  resetBtn.addEventListener("click", () => {
    search.value = "";
    yearSelect.value = "all";
    setSort("guide");
    applyFilters();
    search.focus();
  });

  const requested = new URLSearchParams(location.search).get("lang");
  applyLanguage(requested === "en" || requested === "ar" ? requested : lang());
  updateChrome();
  applyFilters();
})();
