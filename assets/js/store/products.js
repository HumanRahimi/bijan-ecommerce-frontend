"use strict";

/* ============================================
   Bijan Products
   Shared Product Registry
   ============================================ */

(function () {
  const PRODUCT_CONFIGS = [
    {
      selector: ".deal-card",
      title: ".deal-card__title",
      image: ".deal-card__media img",
      price: ".deal-card__price, .deal-card__price-range",
    },

    {
      selector: ".product-card",
      title: ".product-card__title",
      image: ".product-card__media > img",
      price: ".product-card__prices strong",
    },

    {
      selector: ".popular-mini-product",
      title: ".popular-mini-product__title",
      image: ".popular-mini-product__image img",
      price: null,
    },

    {
      selector: ".best-seller-card",
      title: ".best-seller-card__title",
      image: ".best-seller-card__image img",
      price: ".best-seller-card__price strong",
    },
  ];

  let products = [];

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

  function getImageKey(imageSrc) {
    if (!imageSrc) {
      return "";
    }

    return imageSrc.split("/").pop().split("?")[0].toLowerCase();
  }

  function normalizePrice(value) {
    const price = cleanText(value);

    if (!price) {
      return "";
    }

    if (price.includes("تومان")) {
      return price;
    }

    return `${price} تومان`;
  }

  function createProductId(title, image) {
    const source = `${normalizeText(title)}|${getImageKey(image)}`;

    let hash = 0;

    for (let index = 0; index < source.length; index += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(index);

      hash |= 0;
    }

    return `product-${Math.abs(hash)}`;
  }

  /* ========================================
     Card Detection
     ======================================== */

  function getConfigForCard(card) {
    return (
      PRODUCT_CONFIGS.find(function (config) {
        return card.matches(config.selector);
      }) || null
    );
  }

  function getCardFromElement(element) {
    if (!(element instanceof Element)) {
      return null;
    }

    return (
      element.closest(
        PRODUCT_CONFIGS.map(function (config) {
          return config.selector;
        }).join(","),
      ) || null
    );
  }

  /* ========================================
     Extract Product
     ======================================== */

  function getProductFromCard(card) {
    if (!card) {
      return null;
    }

    const config = getConfigForCard(card);

    if (!config) {
      return null;
    }

    const titleElement = card.querySelector(config.title);

    const imageElement = card.querySelector(config.image);

    const priceElement = config.price ? card.querySelector(config.price) : null;

    const title = cleanText(titleElement?.textContent);

    if (!title) {
      return null;
    }

    const image = imageElement?.getAttribute("src") || "";

    const price = normalizePrice(priceElement?.textContent);

    const id = card.dataset.productId || createProductId(title, image);

    /*
     * روی Card هم ID ثبت می‌کنیم
     */

    card.dataset.productId = id;

    return {
      id,
      title,
      image,
      price,
    };
  }

  /* ========================================
     Build Registry
     ======================================== */

  function buildRegistry() {
    products = [];

    const cards = document.querySelectorAll(
      PRODUCT_CONFIGS.map(function (config) {
        return config.selector;
      }).join(","),
    );

    cards.forEach(function (card) {
      const product = getProductFromCard(card);

      if (!product) {
        return;
      }

      const titleKey = normalizeText(product.title);

      const imageKey = getImageKey(product.image);

      /*
       * یک محصول ممکن است در چند Section
       * تکرار شده باشد.
       *
       * Title یکسان یا Image یکسان
       * یعنی همان Product.
       */

      const existing = products.find(function (item) {
        const sameTitle = titleKey && item.titleKey === titleKey;

        const sameImage = imageKey && item.imageKey === imageKey;

        return sameTitle || sameImage;
      });

      if (existing) {
        /*
         * همه Cardهای این محصول
         * یک ID مشترک می‌گیرند.
         */

        card.dataset.productId = existing.id;

        existing.cards.push(card);

        if (!existing.price && product.price) {
          existing.price = product.price;
        }

        if (!existing.image && product.image) {
          existing.image = product.image;
        }

        return;
      }

      const id = createProductId(product.title, product.image);

      card.dataset.productId = id;

      products.push({
        ...product,

        id,
        titleKey,
        imageKey,

        cards: [card],
      });
    });

    return products;
  }

  /* ========================================
     Product Getters
     ======================================== */

  function getAllProducts() {
    return products.map(function (product) {
      return {
        id: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
      };
    });
  }

  function getProductById(productId) {
    const product = products.find(function (item) {
      return item.id === productId;
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
    };
  }

  function getProductFromElement(element) {
    if (!(element instanceof Element)) {
      return null;
    }

    /*
     * اول بررسی می‌کنیم آیا خود Element
     * یا یکی از والدهایش Product ID دارد.
     */

    const productElement = element.closest("[data-product-id]");

    const productId = productElement?.dataset.productId || "";

    if (productId) {
      const product = getProductById(productId);

      if (product) {
        return product;
      }
    }

    /*
     * Fallback برای Cardهای معمولی
     */

    const card = getCardFromElement(element);

    return getProductFromCard(card);
  }

  function getProductCards(productId) {
    const product = products.find(function (item) {
      return item.id === productId;
    });

    return product ? [...product.cards] : [];
  }

  function findProduct({ title = "", image = "" } = {}) {
    const titleKey = normalizeText(title);
    const imageKey = getImageKey(image);

    const product = products.find(function (item) {
      const sameTitle = titleKey && item.titleKey === titleKey;

      const sameImage = imageKey && item.imageKey === imageKey;

      return sameTitle || sameImage;
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
    };
  }

  /* ========================================
     Refresh
     ======================================== */

  function refresh() {
    return buildRegistry();
  }

  /* ========================================
     Public API
     ======================================== */

  window.BijanProducts = Object.freeze({
    refresh,

    getAllProducts,

    getProductById,

    findProduct,

    getProductFromCard,

    getProductFromElement,

    getProductCards,

    getCardFromElement,
  });

  /* ========================================
     Initial Registry
     ======================================== */

  buildRegistry();
})();
