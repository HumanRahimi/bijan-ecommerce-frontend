"use strict";

/* ============================================
   Product Search
   ============================================ */

function initProductSearch() {
  const forms = Array.from(document.querySelectorAll("[data-product-search]"));

  if (forms.length === 0) {
    return;
  }

  if (!window.BijanProducts) {
    console.error("BijanProducts is not loaded.");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const categoryMap = {
    eye: "eye-and-eyebrow",
    lip: "lip",
    perfume: "perfume",
  };

  const categoryLabels = {
    "eye-and-eyebrow": "آرایش چشم",
    lip: "آرایش لب",
    mobile: "تلفن همراه",
    "beauty-and-health": "زیبایی و سلامت",
    perfume: "عطر و ادکلن",
    supermarket: "کالاهای سوپرمارکتی",
    digital: "کالای دیجیتال",
    books: "کتاب و لوازم التحریر",
    "home-appliances": "لوازم خانه و آشپزخانه",
    clothes: "مد و پوشاک",
    "skin-care-accessories": "مراقبت پوست",
    sport: "ورزش و سفر",
  };

  let searchIndex = [];
  let highlightTimer = null;

  /* ========================================
     Helpers
     ======================================== */

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeText(value) {
    return cleanText(value)
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[أإٱ]/g, "ا")
      .replace(/ۀ/g, "ه")
      .replace(/\u200c/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function getCategory(card) {
    const explicitCategory =
      card.dataset.searchCategory ||
      card.closest("[data-search-category]")?.dataset.searchCategory;

    if (explicitCategory) {
      return explicitCategory;
    }

    const productCategory = card.dataset.productCategory || "";

    return categoryMap[productCategory] || productCategory;
  }

  /* ========================================
     Build Shared Search Index
     ======================================== */

  function buildSearchIndex() {
    searchIndex = [];

    const products = BijanProducts.getAllProducts();

    products.forEach(function (product) {
      const cards = BijanProducts.getProductCards(product.id);

      if (cards.length === 0) {
        return;
      }

      const target = cards[0];

      let category = "";

      for (const card of cards) {
        const cardCategory = getCategory(card);

        if (cardCategory) {
          category = cardCategory;
          break;
        }
      }

      searchIndex.push({
        id: product.id,

        title: product.title,

        normalizedTitle: normalizeText(product.title),

        image: product.image,

        price: product.price,

        category,

        target,
      });
    });
  }

  /* ========================================
     Find Matches
     ======================================== */

  function getMatches(query, selectedCategory) {
    const normalizedQuery = normalizeText(query);

    if (normalizedQuery.length < 2) {
      return [];
    }

    const terms = normalizedQuery.split(" ").filter(Boolean);

    return searchIndex.filter(function (product) {
      const categoryMatches =
        !selectedCategory || product.category === selectedCategory;

      const textMatches = terms.every(function (term) {
        return product.normalizedTitle.includes(term);
      });

      return categoryMatches && textMatches;
    });
  }

  /* ========================================
     Highlight Query
     ======================================== */

  function appendHighlightedText(element, text, query) {
    const cleanedQuery = cleanText(query);

    if (!cleanedQuery) {
      element.textContent = text;
      return;
    }

    const lowercaseText = text.toLocaleLowerCase("fa");

    const lowercaseQuery = cleanedQuery.toLocaleLowerCase("fa");

    const index = lowercaseText.indexOf(lowercaseQuery);

    if (index < 0) {
      element.textContent = text;
      return;
    }

    element.append(document.createTextNode(text.slice(0, index)));

    const mark = document.createElement("mark");

    mark.textContent = text.slice(index, index + cleanedQuery.length);

    element.append(mark);

    element.append(
      document.createTextNode(text.slice(index + cleanedQuery.length)),
    );
  }

  /* ========================================
     Reveal New Product
     ======================================== */

  function revealNewProductIfNeeded(target) {
    if (!target.matches("[data-product-card]") || !target.hidden) {
      return;
    }

    const section = target.closest("[data-new-products]");

    const allButton = section?.querySelector('[data-product-filter="all"]');

    if (allButton) {
      allButton.click();
    } else {
      target.hidden = false;
    }
  }

  /* ========================================
     Scroll To Product
     ======================================== */

  function activateProduct(product) {
    const target = product.target;

    if (!target || !document.documentElement.contains(target)) {
      return;
    }

    revealNewProductIfNeeded(target);

    window.requestAnimationFrame(function () {
      target.scrollIntoView({
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",

        block: "center",
      });

      window.clearTimeout(highlightTimer);

      target.classList.remove("search-target-highlight");

      void target.offsetWidth;

      target.classList.add("search-target-highlight");

      highlightTimer = window.setTimeout(function () {
        target.classList.remove("search-target-highlight");
      }, 1200);
    });
  }

  /* ========================================
     Close Mobile Sidebar
     ======================================== */

  function closeMobileSidebar() {
    const menuToggle = document.querySelector("[data-mobile-menu-toggle]");

    if (menuToggle?.getAttribute("aria-expanded") === "true") {
      menuToggle.click();
    }
  }

  /* ========================================
     Setup One Search Form
     ======================================== */

  function setupSearchForm(form, formIndex) {
    const input = form.querySelector("[data-search-input]");

    const resultsPanel = form.querySelector("[data-search-results]");

    const categorySelect = form.querySelector("[data-search-category-select]");

    if (!input || !resultsPanel) {
      return;
    }

    const isSidebarSearch = Boolean(form.closest(".mobile-sidebar"));

    let visibleResults = [];
    let activeIndex = -1;

    /* ==============================
       Close Results
       ============================== */

    function closeResults() {
      resultsPanel.hidden = true;

      resultsPanel.replaceChildren();

      visibleResults = [];
      activeIndex = -1;

      input.setAttribute("aria-expanded", "false");

      input.removeAttribute("aria-activedescendant");
    }

    /* ==============================
       Result Button
       ============================== */

    function createResultButton(product, index, query) {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "product-search__result";

      button.id = `product-search-option-${formIndex}-${index}`;

      button.setAttribute("role", "option");

      button.setAttribute("aria-selected", "false");

      button.dataset.searchResultIndex = String(index);

      /*
       * Image
       */

      const media = document.createElement("span");

      media.className = "product-search__result-media";

      if (product.image) {
        const image = document.createElement("img");

        image.src = product.image;
        image.alt = "";
        image.width = 58;
        image.height = 58;
        image.loading = "lazy";

        media.appendChild(image);
      } else {
        const icon = document.createElement("i");

        icon.className = "fa-solid fa-box-open";

        icon.setAttribute("aria-hidden", "true");

        media.appendChild(icon);
      }

      /*
       * Content
       */

      const content = document.createElement("span");

      content.className = "product-search__result-content";

      const title = document.createElement("span");

      title.className = "product-search__result-title";

      appendHighlightedText(title, product.title, query);

      /*
       * Meta
       */

      const meta = document.createElement("span");

      meta.className = "product-search__result-meta";

      const category = document.createElement("span");

      category.textContent = categoryLabels[product.category] || "محصول";

      const price = document.createElement("strong");

      price.textContent = product.price || "مشاهده محصول";

      meta.append(category, price);

      content.append(title, meta);

      button.append(media, content);

      button.addEventListener("click", function () {
        selectProduct(product);
      });

      return button;
    }

    /* ==============================
       Message
       ============================== */

    function renderMessage(message) {
      resultsPanel.replaceChildren();

      const element = document.createElement("div");

      element.className = "product-search__message";

      element.textContent = message;

      resultsPanel.appendChild(element);

      resultsPanel.hidden = false;

      input.setAttribute("aria-expanded", "true");
    }

    /* ==============================
       Render Results
       ============================== */

    function renderResults() {
      const query = input.value;

      const normalizedQuery = normalizeText(query);

      if (normalizedQuery.length === 0) {
        closeResults();
        return;
      }

      if (normalizedQuery.length < 2) {
        visibleResults = [];
        activeIndex = -1;

        renderMessage("حداقل ۲ حرف برای جستجو وارد کنید.");

        return;
      }

      const selectedCategory = categorySelect?.value || "";

      visibleResults = getMatches(query, selectedCategory);

      activeIndex = -1;

      resultsPanel.replaceChildren();

      if (visibleResults.length === 0) {
        renderMessage("محصولی با این عبارت پیدا نشد.");

        return;
      }

      const fragment = document.createDocumentFragment();

      visibleResults.forEach(function (product, index) {
        fragment.appendChild(createResultButton(product, index, query));
      });

      const footer = document.createElement("div");

      footer.className = "product-search__results-footer";

      footer.textContent = `${visibleResults.length.toLocaleString(
        "fa-IR",
      )} نتیجه نمایش داده شد`;

      fragment.appendChild(footer);

      resultsPanel.appendChild(fragment);

      resultsPanel.hidden = false;

      input.setAttribute("aria-expanded", "true");
    }

    /* ==============================
       Active Result
       ============================== */

    function setActiveIndex(index) {
      const buttons = Array.from(
        resultsPanel.querySelectorAll("[data-search-result-index]"),
      );

      if (buttons.length === 0) {
        return;
      }

      activeIndex = (index + buttons.length) % buttons.length;

      buttons.forEach(function (button, buttonIndex) {
        const isActive = buttonIndex === activeIndex;

        button.classList.toggle("is-active", isActive);

        button.setAttribute("aria-selected", String(isActive));
      });

      const activeButton = buttons[activeIndex];

      input.setAttribute("aria-activedescendant", activeButton.id);

      activeButton.scrollIntoView({
        block: "nearest",
      });
    }

    /* ==============================
       Select Product
       ============================== */

    function selectProduct(product) {
      input.value = product.title;

      closeResults();

      if (isSidebarSearch) {
        closeMobileSidebar();
      }

      activateProduct(product);
    }

    /* ==============================
       Input
       ============================== */

    input.addEventListener("input", renderResults);

    input.addEventListener("focus", function () {
      if (normalizeText(input.value).length > 0) {
        renderResults();
      }
    });

    /* ==============================
       Category
       Desktop only
       ============================== */

    categorySelect?.addEventListener("change", function () {
      if (normalizeText(input.value).length > 0) {
        renderResults();
        input.focus();
      }
    });

    /* ==============================
       Keyboard
       ============================== */

    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeResults();
        return;
      }

      if (resultsPanel.hidden || visibleResults.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();

        setActiveIndex(activeIndex + 1);

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setActiveIndex(
          activeIndex <= 0 ? visibleResults.length - 1 : activeIndex - 1,
        );

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        const index = activeIndex >= 0 ? activeIndex : 0;

        selectProduct(visibleResults[index]);
      }
    });

    /* ==============================
       Submit
       ============================== */

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (visibleResults.length === 0) {
        renderResults();
        return;
      }

      const index = activeIndex >= 0 ? activeIndex : 0;

      selectProduct(visibleResults[index]);
    });

    /* ==============================
       Click Outside
       ============================== */

    document.addEventListener("pointerdown", function (event) {
      if (!form.contains(event.target)) {
        closeResults();
      }
    });
  }

  /* ========================================
     Start
     ======================================== */

  buildSearchIndex();

  forms.forEach(function (form, formIndex) {
    setupSearchForm(form, formIndex);
  });
}
