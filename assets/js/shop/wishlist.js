"use strict";

/* ============================================
   Wishlist
   ============================================ */

function initWishlist() {
  if (!window.BijanStore) {
    console.error("BijanStore is not loaded.");
    return;
  }

  if (!window.BijanProducts) {
    console.error("BijanProducts is not loaded.");
    return;
  }

  /* ========================================
     Elements
     ======================================== */

  const panel = document.querySelector("[data-wishlist-panel]");

  const panelList = panel?.querySelector("[data-wishlist-list]");

  const panelEmpty = panel?.querySelector("[data-wishlist-empty]");

  const panelCount = panel?.querySelector("[data-wishlist-panel-count]");

  const closeButton = panel?.querySelector("[data-wishlist-close]");

  const openButtons = Array.from(
    document.querySelectorAll("[data-wishlist-open]"),
  );

  const countElements = Array.from(
    document.querySelectorAll("[data-wishlist-count]"),
  );

  const wishlistButtons = Array.from(
    document.querySelectorAll("[data-wishlist-toggle]"),
  );

  /* ========================================
     State
     ======================================== */

  let pendingProductId = null;
  let pendingPanelButton = null;

  let activeOpenButton = null;
  let panelCloseTimer = null;

  let panelPositionFrame = null;

  /* ========================================
     Helpers
     ======================================== */

  function toPersianDigits(value) {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

    return String(value).replace(/\d/g, function (digit) {
      return digits[Number(digit)];
    });
  }

  function getWishlist(user) {
    if (!user || !Array.isArray(user.wishlist)) {
      return [];
    }

    return user.wishlist;
  }

  function getWishlistItemId(item) {
    if (typeof item === "string") {
      return item;
    }

    return item?.id || "";
  }

  function hasProduct(user, productId) {
    return getWishlist(user).some(function (item) {
      return getWishlistItemId(item) === productId;
    });
  }

  function getProductSnapshot(product) {
    return {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      addedAt: new Date().toISOString(),
    };
  }

  function getDisplayProduct(item) {
    const id = getWishlistItemId(item);

    const currentProduct = BijanProducts.getProductById(id);

    /*
     * اگر Product هنوز روی صفحه وجود دارد،
     * اطلاعات فعلی صفحه اولویت دارد.
     */

    if (currentProduct) {
      if (item && typeof item === "object") {
        return {
          ...item,
          ...currentProduct,
          id,
        };
      }

      return {
        ...currentProduct,
        id,
      };
    }

    /*
     * سازگاری با Wishlistهای قدیمی
     * که فقط Product ID ذخیره کرده‌اند.
     */

    if (typeof item === "string") {
      return {
        id,
        title: "محصول ذخیره‌شده",
        image: "",
        price: "",
      };
    }

    return {
      id,
      title: item?.title || "محصول",
      image: item?.image || "",
      price: item?.price || "",
      addedAt: item?.addedAt || "",
    };
  }

  /* ========================================
     Mobile Menu
     ======================================== */

  function closeMobileMenu() {
    const menuButton = document.querySelector("[data-mobile-menu-toggle]");

    if (menuButton?.getAttribute("aria-expanded") === "true") {
      menuButton.click();
    }
  }

  /* ========================================
     Request Login
     ======================================== */

  function requestLogin() {
    /*
     * اگر درخواست از منوی موبایل آمده،
     * ابتدا Sidebar بسته شود.
     */

    closeMobileMenu();

    const accountButtons = Array.from(
      document.querySelectorAll("[data-account-open]"),
    );

    const visibleButton = accountButtons.find(function (button) {
      return button.offsetParent !== null;
    });

    const accountButton = visibleButton || accountButtons[0];

    if (!accountButton) {
      console.warn("Account button not found.");

      return;
    }

    window.setTimeout(function () {
      accountButton.click();
    }, 50);
  }

  /* ========================================
     Live Region
     ======================================== */

  let liveRegion = document.querySelector("[data-wishlist-live]");

  if (!liveRegion) {
    liveRegion = document.createElement("div");

    liveRegion.className = "visually-hidden";

    liveRegion.setAttribute("aria-live", "polite");

    liveRegion.setAttribute("aria-atomic", "true");

    liveRegion.setAttribute("data-wishlist-live", "");

    document.body.appendChild(liveRegion);
  }

  function announce(message) {
    if (!liveRegion) {
      return;
    }

    liveRegion.textContent = "";

    window.setTimeout(function () {
      liveRegion.textContent = message;
    }, 20);
  }

  /* ========================================
     Heart Button UI
     ======================================== */

  function setButtonState(button, isActive, product) {
    const icon = button.querySelector(".fa-heart");

    button.classList.toggle("is-wishlist-active", isActive);

    button.setAttribute("aria-pressed", String(isActive));

    if (product) {
      button.setAttribute(
        "aria-label",
        isActive
          ? `حذف ${product.title} از علاقه‌مندی‌ها`
          : `افزودن ${product.title} به علاقه‌مندی‌ها`,
      );
    }

    if (!icon) {
      return;
    }

    icon.classList.toggle("fa-solid", isActive);

    icon.classList.toggle("fa-regular", !isActive);
  }

  /* ========================================
     Counts
     ======================================== */

  function updateCounts(user) {
    const count = getWishlist(user).length;

    countElements.forEach(function (element) {
      element.textContent = toPersianDigits(count);

      element.setAttribute("aria-label", `${count} محصول در علاقه‌مندی‌ها`);
    });

    if (panelCount) {
      panelCount.textContent = `${toPersianDigits(count)} محصول`;
    }
  }

  /* ========================================
     Create Panel Item
     ======================================== */

  function createWishlistItem(item) {
    const product = getDisplayProduct(item);

    const article = document.createElement("article");

    article.className = "wishlist-item";

    article.dataset.productId = product.id;

    /* ---------- Image ---------- */

    const media = document.createElement("div");

    media.className = "wishlist-item__media";

    if (product.image) {
      const image = document.createElement("img");

      image.src = product.image;

      image.alt = product.title || "";

      image.loading = "lazy";

      media.appendChild(image);
    } else {
      const fallback = document.createElement("i");

      fallback.className = "fa-solid fa-box-open";

      fallback.setAttribute("aria-hidden", "true");

      media.appendChild(fallback);
    }

    /* ---------- Content ---------- */

    const content = document.createElement("div");

    content.className = "wishlist-item__content";

    const title = document.createElement("strong");

    title.className = "wishlist-item__title";

    title.textContent = product.title || "محصول";

    content.appendChild(title);

    if (product.price) {
      const price = document.createElement("span");

      price.className = "wishlist-item__price";

      price.textContent = product.price;

      content.appendChild(price);
    }

    /* ---------- Remove ---------- */

    const removeButton = document.createElement("button");

    removeButton.type = "button";

    removeButton.className = "wishlist-item__remove";

    removeButton.dataset.wishlistRemove = product.id;

    removeButton.setAttribute(
      "aria-label",
      `حذف ${product.title} از علاقه‌مندی‌ها`,
    );

    const removeIcon = document.createElement("i");

    removeIcon.className = "fa-regular fa-trash-can";

    removeIcon.setAttribute("aria-hidden", "true");

    removeButton.appendChild(removeIcon);

    article.append(media, content, removeButton);

    return article;
  }

  /* ========================================
     Render Panel
     ======================================== */

  function renderPanel(user) {
    if (!panelList || !panelEmpty) {
      return;
    }

    const wishlist = getWishlist(user);

    panelList.replaceChildren();

    if (wishlist.length === 0) {
      panelList.hidden = true;
      panelEmpty.hidden = false;

      return;
    }

    panelList.hidden = false;
    panelEmpty.hidden = true;

    const fragment = document.createDocumentFragment();

    wishlist.forEach(function (item) {
      fragment.appendChild(createWishlistItem(item));
    });

    panelList.appendChild(fragment);
  }

  /* ========================================
     Render Wishlist
     ======================================== */

  function renderWishlist() {
    const user = BijanStore.getCurrentUser();

    wishlistButtons.forEach(function (button) {
      const product = BijanProducts.getProductFromElement(button);

      if (!product) {
        return;
      }

      const isActive = Boolean(user) && hasProduct(user, product.id);

      setButtonState(button, isActive, product);
    });

    updateCounts(user);

    if (panel && !panel.hidden) {
      renderPanel(user);
    }
  }

  /* ========================================
     Add Product
     ======================================== */

  function addProduct(product) {
    const currentUser = BijanStore.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    /*
     * جلوگیری از Duplicate
     */

    if (hasProduct(currentUser, product.id)) {
      renderWishlist();

      return true;
    }

    const updatedUser = BijanStore.updateCurrentUser(function (user) {
      user.wishlist.push(getProductSnapshot(product));
    });

    if (!updatedUser) {
      console.error("Wishlist add failed.");

      return false;
    }

    announce(`${product.title} به علاقه‌مندی‌ها اضافه شد.`);

    return true;
  }

  /* ========================================
     Remove Product
     ======================================== */

  function removeProductById(productId, productTitle = "محصول") {
    const currentUser = BijanStore.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    const updatedUser = BijanStore.updateCurrentUser(function (user) {
      user.wishlist = user.wishlist.filter(function (item) {
        return getWishlistItemId(item) !== productId;
      });
    });

    if (!updatedUser) {
      console.error("Wishlist remove failed.");

      return false;
    }

    announce(`${productTitle} از علاقه‌مندی‌ها حذف شد.`);

    return true;
  }

  /* ========================================
     Toggle Product
     ======================================== */

  function toggleProduct(product) {
    const currentUser = BijanStore.getCurrentUser();

    /*
     * Login Required
     */

    if (!currentUser) {
      pendingProductId = product.id;

      requestLogin();

      return;
    }

    /*
     * Remove
     */

    if (hasProduct(currentUser, product.id)) {
      removeProductById(product.id, product.title);

      return;
    }

    /*
     * Add
     */

    addProduct(product);
  }

  /* ========================================
     Panel Position
     ======================================== */

  function positionPanel(button) {
    if (!panel || !button) {
      return;
    }

    const rect = button.getBoundingClientRect();

    const panelWidth = panel.offsetWidth;

    const viewportWidth = window.innerWidth;

    const gap = 10;
    const edge = 12;

    let left = rect.right - panelWidth;

    left = Math.max(edge, Math.min(left, viewportWidth - panelWidth - edge));

    const top = rect.bottom + gap;

    panel.style.left = `${left}px`;
    panel.style.right = "auto";
    panel.style.top = `${top}px`;

    panel.style.setProperty("--popover-top", `${top}px`);
  }

  /* ========================================
     Open Panel
     ======================================== */

  function openPanel(button) {
    const user = BijanStore.getCurrentUser();

    /*
     * Login Required
     */

    if (!user) {
      pendingPanelButton = button;

      requestLogin();

      return;
    }

    if (!panel) {
      return;
    }

    closeMobileMenu();

    window.clearTimeout(panelCloseTimer);

    activeOpenButton = button;

    renderPanel(user);

    document.dispatchEvent(
      new CustomEvent("header-surface:open", {
        detail: {
          source: "wishlist",
        },
      }),
    );

    panel.hidden = false;

    openButtons.forEach(function (openButton) {
      openButton.setAttribute("aria-expanded", String(openButton === button));
    });

    positionPanel(button);

    window.requestAnimationFrame(function () {
      panel.classList.add("is-open");
    });
  }

  /* ========================================
     Close Panel
     ======================================== */

  function closePanel(restoreFocus = false) {
    if (!panel || panel.hidden) {
      return;
    }

    const focusTarget = activeOpenButton;

    panel.classList.remove("is-open");

    openButtons.forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });

    window.clearTimeout(panelCloseTimer);

    panelCloseTimer = window.setTimeout(function () {
      panel.hidden = true;

      activeOpenButton = null;

      if (
        restoreFocus &&
        focusTarget &&
        typeof focusTarget.focus === "function"
      ) {
        focusTarget.focus({
          preventScroll: true,
        });
      }
    }, 180);
  }

  /* ========================================
     Product Heart Click
     ======================================== */

  wishlistButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      event.stopPropagation();

      const product = BijanProducts.getProductFromElement(button);

      if (!product) {
        console.warn("Wishlist product not found.");

        return;
      }

      toggleProduct(product);
    });
  });

  /* ========================================
     Open Wishlist
     ======================================== */

  openButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const sameButtonIsOpen =
        panel && !panel.hidden && activeOpenButton === button;

      if (sameButtonIsOpen) {
        closePanel(true);

        return;
      }

      if (panel && !panel.hidden) {
        closePanel();
      }

      openPanel(button);
    });
  });

  /* ========================================
     Close Button
     ======================================== */

  closeButton?.addEventListener("click", function () {
    closePanel(true);
  });

  /* ========================================
     Remove From Panel
     ======================================== */

  panelList?.addEventListener("click", function (event) {
    const removeButton = event.target.closest("[data-wishlist-remove]");

    if (!removeButton) {
      return;
    }

    const productId = removeButton.dataset.wishlistRemove;

    if (!productId) {
      return;
    }

    const currentUser = BijanStore.getCurrentUser();

    const item = getWishlist(currentUser).find(function (wishlistItem) {
      return getWishlistItemId(wishlistItem) === productId;
    });

    const product = item ? getDisplayProduct(item) : null;

    removeProductById(productId, product?.title || "محصول");
  });

  /* ========================================
     Account Changed
     Login / Register / Logout
     ======================================== */

  document.addEventListener("account:changed", function (event) {
    const user = event.detail?.user || null;

    /*
     * Logout
     */

    if (!user) {
      pendingProductId = null;
      pendingPanelButton = null;

      closePanel();

      renderWishlist();

      return;
    }

    /*
     * کاربر ابتدا Heart زده،
     * سپس Login / Register کرده.
     */

    if (pendingProductId) {
      const product = BijanProducts.getProductById(pendingProductId);

      pendingProductId = null;

      if (product) {
        addProduct(product);
      }
    }

    /*
     * کاربر ابتدا Wishlist Header
     * را زده و سپس Login کرده.
     */

    if (pendingPanelButton) {
      const button = pendingPanelButton;

      pendingPanelButton = null;

      window.setTimeout(function () {
        openPanel(button);
      }, 350);
    }

    renderWishlist();
  });

  /* ========================================
     Store Updated
     ======================================== */

  document.addEventListener("store:user-updated", function () {
    renderWishlist();
  });

  /* ========================================
     Click Outside
     ======================================== */

  document.addEventListener("pointerdown", function (event) {
    if (!panel || panel.hidden) {
      return;
    }

    if (panel.contains(event.target)) {
      return;
    }

    const clickedOpener = openButtons.some(function (button) {
      return button.contains(event.target);
    });

    if (clickedOpener) {
      return;
    }

    closePanel();
  });

  /* ========================================
     Keyboard
     ======================================== */

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !panel || panel.hidden) {
      return;
    }

    event.preventDefault();

    closePanel(true);
  });

  document.addEventListener("header-surface:open", function (event) {
    if (event.detail?.source === "wishlist") {
      return;
    }

    closePanel();
  });

  function syncPanelPosition() {
    if (
      !panel ||
      panel.hidden ||
      !activeOpenButton ||
      panelPositionFrame !== null
    ) {
      return;
    }

    panelPositionFrame = window.requestAnimationFrame(function () {
      panelPositionFrame = null;

      const rect = activeOpenButton.getBoundingClientRect();

      const triggerIsOutsideViewport =
        rect.bottom <= 0 ||
        rect.top >= window.innerHeight ||
        rect.right <= 0 ||
        rect.left >= window.innerWidth;

      if (triggerIsOutsideViewport) {
        closePanel();

        return;
      }

      positionPanel(activeOpenButton);
    });
  }

  /* ========================================
     Resize
     ======================================== */

  window.addEventListener("resize", syncPanelPosition);

  window.addEventListener("scroll", syncPanelPosition, {
    passive: true,
  });

  /* ========================================
     Initial Render
     ======================================== */

  renderWishlist();
}
