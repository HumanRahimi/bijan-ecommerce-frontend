"use strict";

/* ============================================
   Cart
   ============================================ */

function initCart() {
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

  const panel = document.querySelector("[data-cart-popover]");
  const panelList = panel?.querySelector("[data-cart-list]");
  const panelEmpty = panel?.querySelector("[data-cart-empty]");
  const panelCount = panel?.querySelector("[data-cart-popover-count]");
  const closeButton = panel?.querySelector("[data-cart-close]");

  const openButtons = Array.from(document.querySelectorAll("[data-cart-open]"));

  const countElements = Array.from(
    document.querySelectorAll("[data-cart-count]"),
  );

  const cartButtons = Array.from(document.querySelectorAll("[data-cart-add]"));

  /* ========================================
     State
     ======================================== */

  let pendingProduct = null;
  let pendingOpenButton = null;

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

  function getCart(user) {
    if (!user || !Array.isArray(user.cart)) {
      return [];
    }

    return user.cart;
  }

  function getCartItemId(item) {
    if (typeof item === "string") {
      return item;
    }

    return item?.id || "";
  }

  function getCartItemQuantity(item) {
    if (!item || typeof item === "string") {
      return 1;
    }

    const quantity = Number(item.quantity);

    return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  }

  function getCartTotalQuantity(user) {
    return getCart(user).reduce(function (total, item) {
      return total + getCartItemQuantity(item);
    }, 0);
  }

  function getProductSnapshot(product, quantity = 1) {
    return {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity,
      addedAt: new Date().toISOString(),
    };
  }

  function getDisplayProduct(item) {
    const id = getCartItemId(item);
    const currentProduct = BijanProducts.getProductById(id);
    const quantity = getCartItemQuantity(item);

    if (currentProduct) {
      return {
        ...(item && typeof item === "object" ? item : {}),
        ...currentProduct,
        id,
        quantity,
      };
    }

    if (typeof item === "string") {
      return {
        id,
        title: "محصول ذخیره‌شده",
        image: "",
        price: "",
        quantity,
      };
    }

    return {
      id,
      title: item?.title || "محصول",
      image: item?.image || "",
      price: item?.price || "",
      quantity,
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

  let liveRegion = document.querySelector("[data-cart-live]");

  if (!liveRegion) {
    liveRegion = document.createElement("div");

    liveRegion.className = "visually-hidden";

    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.setAttribute("data-cart-live", "");

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
     Counts
     ======================================== */

  function updateCounts(user) {
    const totalQuantity = getCartTotalQuantity(user);

    const countText = toPersianDigits(totalQuantity);

    countElements.forEach(function (element) {
      element.textContent = countText;

      element.setAttribute("aria-label", `${totalQuantity} محصول در سبد خرید`);
    });

    if (panelCount) {
      panelCount.textContent = `${countText} محصول`;
    }
  }

  /* ========================================
     Create Cart Item
     ======================================== */

  function createCartItem(item) {
    const product = getDisplayProduct(item);

    const article = document.createElement("article");

    article.className = "cart-popover__item";
    article.dataset.productId = product.id;

    /* ---------- Image ---------- */

    const media = document.createElement("div");

    media.className = "cart-popover__item-media";

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

    content.className = "cart-popover__item-content";

    const title = document.createElement("strong");

    title.className = "cart-popover__item-title";
    title.textContent = product.title || "محصول";

    content.appendChild(title);

    if (product.price) {
      const price = document.createElement("span");

      price.className = "cart-popover__item-price";
      price.textContent = product.price;

      content.appendChild(price);
    }

    /* ---------- Quantity ---------- */

    const controls = document.createElement("div");

    controls.className = "cart-popover__quantity";

    const minusButton = document.createElement("button");

    minusButton.type = "button";
    minusButton.className = "cart-popover__quantity-button";

    minusButton.dataset.cartMinus = product.id;

    minusButton.setAttribute("aria-label", `کم کردن تعداد ${product.title}`);

    minusButton.disabled = product.quantity <= 1;

    minusButton.innerHTML =
      '<i class="fa-solid fa-minus" aria-hidden="true"></i>';

    const quantity = document.createElement("span");

    quantity.className = "cart-popover__quantity-value";

    quantity.textContent = toPersianDigits(product.quantity);

    quantity.setAttribute("aria-label", `تعداد ${product.quantity}`);

    const plusButton = document.createElement("button");

    plusButton.type = "button";
    plusButton.className = "cart-popover__quantity-button";

    plusButton.dataset.cartPlus = product.id;

    plusButton.setAttribute("aria-label", `زیاد کردن تعداد ${product.title}`);

    plusButton.innerHTML =
      '<i class="fa-solid fa-plus" aria-hidden="true"></i>';

    controls.append(minusButton, quantity, plusButton);

    content.appendChild(controls);

    /* ---------- Remove ---------- */

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "cart-popover__item-remove";

    removeButton.dataset.cartRemove = product.id;

    removeButton.setAttribute("aria-label", `حذف ${product.title} از سبد خرید`);

    removeButton.innerHTML =
      '<i class="fa-regular fa-trash-can" aria-hidden="true"></i>';

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

    const cart = getCart(user);

    panelList.replaceChildren();

    if (cart.length === 0) {
      panelList.hidden = true;
      panelEmpty.hidden = false;

      return;
    }

    panelList.hidden = false;
    panelEmpty.hidden = true;

    const fragment = document.createDocumentFragment();

    cart.forEach(function (item) {
      fragment.appendChild(createCartItem(item));
    });

    panelList.appendChild(fragment);
  }

  function renderCart() {
    const user = BijanStore.getCurrentUser();

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

    if (!currentUser || !product?.id) {
      return false;
    }

    const updatedUser = BijanStore.updateCurrentUser(function (user) {
      const index = user.cart.findIndex(function (item) {
        return getCartItemId(item) === product.id;
      });

      /*
       * محصول برای اولین بار اضافه شده
       */

      if (index < 0) {
        user.cart.push(getProductSnapshot(product, 1));

        return;
      }

      /*
       * محصول از قبل داخل سبد است
       * Quantity افزایش پیدا می‌کند
       */

      const currentItem = user.cart[index];

      const nextQuantity = getCartItemQuantity(currentItem) + 1;

      if (typeof currentItem === "string") {
        user.cart[index] = getProductSnapshot(product, nextQuantity);

        return;
      }

      user.cart[index] = {
        ...currentItem,
        ...product,

        id: product.id,

        quantity: nextQuantity,

        addedAt: currentItem.addedAt || new Date().toISOString(),
      };
    });

    if (!updatedUser) {
      console.error("Cart add failed.");

      return false;
    }

    announce(`${product.title} به سبد خرید اضافه شد.`);

    return true;
  }

  /* ========================================
     Quantity
     ======================================== */

  function changeQuantity(productId, delta) {
    const currentUser = BijanStore.getCurrentUser();

    if (!currentUser || !productId) {
      return false;
    }

    const updatedUser = BijanStore.updateCurrentUser(function (user) {
      const index = user.cart.findIndex(function (item) {
        return getCartItemId(item) === productId;
      });

      if (index < 0) {
        return;
      }

      const currentItem = user.cart[index];

      const nextQuantity = Math.max(
        1,
        getCartItemQuantity(currentItem) + delta,
      );

      const displayProduct = getDisplayProduct(currentItem);

      user.cart[index] = {
        ...(typeof currentItem === "object" ? currentItem : {}),

        ...displayProduct,

        id: productId,

        quantity: nextQuantity,

        addedAt:
          typeof currentItem === "object" && currentItem.addedAt
            ? currentItem.addedAt
            : new Date().toISOString(),
      };
    });

    return Boolean(updatedUser);
  }

  /* ========================================
     Remove Product
     ======================================== */

  function removeProductById(productId, productTitle = "محصول") {
    const currentUser = BijanStore.getCurrentUser();

    if (!currentUser || !productId) {
      return false;
    }

    const updatedUser = BijanStore.updateCurrentUser(function (user) {
      user.cart = user.cart.filter(function (item) {
        return getCartItemId(item) !== productId;
      });
    });

    if (!updatedUser) {
      console.error("Cart remove failed.");

      return false;
    }

    announce(`${productTitle} از سبد خرید حذف شد.`);

    return true;
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

    panel.style.position = "fixed";

    panel.style.insetInlineEnd = "auto";
    panel.style.left = `${left}px`;
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
      pendingOpenButton = button;

      requestLogin();

      return;
    }

    document.dispatchEvent(
      new CustomEvent("header-surface:open", {
        detail: {
          source: "cart",
        },
      }),
    );

    if (!panel) {
      return;
    }

    closeMobileMenu();

    window.clearTimeout(panelCloseTimer);

    activeOpenButton = button;

    renderPanel(user);

    /*
     * چون Cart اصلی داخل Desktop Header است،
     * برای اینکه روی Compact Header هم کار کند
     * هنگام باز شدن به body منتقل می‌شود.
     */

    if (panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }

    panel.hidden = false;

    positionPanel(button);

    openButtons.forEach(function (openButton) {
      openButton.setAttribute("aria-expanded", String(openButton === button));
    });

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
     Add To Cart Buttons
     ======================================== */

  cartButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const product = BijanProducts.getProductFromElement(button);

      if (!product) {
        console.warn("Cart product not found.");

        return;
      }

      const currentUser = BijanStore.getCurrentUser();

      /*
       * Login Required
       */

      if (!currentUser) {
        pendingProduct = {
          ...product,
        };

        requestLogin();

        return;
      }

      addProduct(product);
    });
  });

  /* ========================================
     Header Cart
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
     Quantity / Remove
     ======================================== */

  panelList?.addEventListener("click", function (event) {
    const plusButton = event.target.closest("[data-cart-plus]");

    const minusButton = event.target.closest("[data-cart-minus]");

    const removeButton = event.target.closest("[data-cart-remove]");

    /*
     * Plus
     */

    if (plusButton) {
      changeQuantity(plusButton.dataset.cartPlus, 1);

      return;
    }

    /*
     * Minus
     */

    if (minusButton) {
      changeQuantity(minusButton.dataset.cartMinus, -1);

      return;
    }

    /*
     * Remove
     */

    if (removeButton) {
      const productId = removeButton.dataset.cartRemove;

      const currentUser = BijanStore.getCurrentUser();

      const item = getCart(currentUser).find(function (cartItem) {
        return getCartItemId(cartItem) === productId;
      });

      const product = item ? getDisplayProduct(item) : null;

      removeProductById(productId, product?.title || "محصول");
    }
  });

  /* ========================================
     Account Changed
     ======================================== */

  document.addEventListener("account:changed", function (event) {
    const user = event.detail?.user || null;

    /*
     * Logout
     */

    if (!user) {
      pendingProduct = null;
      pendingOpenButton = null;

      closePanel();

      renderCart();

      return;
    }

    /*
     * کاربر Add To Cart زده
     * و بعد Login کرده
     */

    if (pendingProduct) {
      const product = pendingProduct;

      pendingProduct = null;

      addProduct(product);
    }

    /*
     * کاربر Cart Header زده
     * و بعد Login کرده
     */

    if (pendingOpenButton) {
      const button = pendingOpenButton;

      pendingOpenButton = null;

      window.setTimeout(function () {
        openPanel(button);
      }, 350);
    }

    renderCart();
  });

  /* ========================================
     Store Updated
     ======================================== */

  document.addEventListener("store:user-updated", function () {
    renderCart();
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

  document.addEventListener("header-surface:open", function (event) {
    if (event.detail?.source === "cart") {
      return;
    }

    closePanel();
  });

  /* ========================================
     Resize / Refresh
     ======================================== */

  window.addEventListener("resize", syncPanelPosition);

  window.addEventListener("scroll", syncPanelPosition, {
    passive: true,
  });

  window.addEventListener("pageshow", function () {
    renderCart();
  });

  window.addEventListener("storage", function (event) {
    if (
      event.key === "bijan_demo_users" ||
      event.key === "bijan_demo_current_user"
    ) {
      renderCart();
    }
  });

  /* ========================================
     Initial Render
     ======================================== */

  renderCart();
}
