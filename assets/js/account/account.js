"use strict";

/* ============================================
   Account System
   Modal + Register + Login + Session + Menu
   ============================================ */

function initAccountSystem() {
  const modal = document.querySelector("[data-account-modal]");

  if (!modal) {
    return;
  }

  if (!window.BijanStore) {
    console.error("BijanStore is not loaded.");

    return;
  }

  /* ========================================
     Elements
     ======================================== */

  const dialog = modal.querySelector("[data-account-dialog]");

  const accountButtons = Array.from(
    document.querySelectorAll("[data-account-open]"),
  );

  const closeButtons = Array.from(
    modal.querySelectorAll("[data-account-close]"),
  );

  const tabs = Array.from(modal.querySelectorAll("[data-account-tab]"));

  const panels = Array.from(modal.querySelectorAll("[data-account-panel]"));

  const switchButtons = Array.from(
    modal.querySelectorAll("[data-account-switch]"),
  );

  const passwordButtons = Array.from(
    modal.querySelectorAll("[data-password-toggle]"),
  );

  const loginForm = modal.querySelector("[data-account-login-form]");

  const registerForm = modal.querySelector("[data-account-register-form]");

  const loginMessage = modal.querySelector("[data-account-login-message]");

  const registerMessage = modal.querySelector(
    "[data-account-register-message]",
  );

  const accountTextElements = Array.from(
    document.querySelectorAll("[data-account-button-text]"),
  );

  /* ========================================
     Form Inputs
     ======================================== */

  const loginUsernameInput = loginForm?.querySelector('[name="username"]');

  const loginPasswordInput = loginForm?.querySelector('[name="password"]');

  const registerNameInput = registerForm?.querySelector('[name="name"]');

  const registerUsernameInput =
    registerForm?.querySelector('[name="username"]');

  const registerPasswordInput =
    registerForm?.querySelector('[name="password"]');

  const registerPasswordConfirmInput = registerForm?.querySelector(
    '[name="passwordConfirm"]',
  );

  /* ========================================
     Username Input Settings
     ======================================== */

  [loginUsernameInput, registerUsernameInput].forEach(function (input) {
    if (!input) {
      return;
    }

    input.setAttribute("dir", "ltr");

    input.setAttribute("autocapitalize", "none");

    input.setAttribute("spellcheck", "false");
  });

  /* ========================================
     Account Popover
     ======================================== */

  const popover = document.querySelector("[data-account-popover]");

  const popoverName = popover?.querySelector("[data-account-popover-name]");

  const popoverUsername = popover?.querySelector(
    "[data-account-popover-username]",
  );

  const logoutButton = popover?.querySelector("[data-account-logout]");

  /* ========================================
     Settings
     ======================================== */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  /* ========================================
     State
     ======================================== */

  let currentUser = null;

  let previousActiveElement = null;

  let modalCloseTimer = null;

  let popoverCloseTimer = null;

  let activeAccountButton = null;

  /* ========================================
     Helpers
     ======================================== */

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeUsername(value) {
    return cleanText(value).toLowerCase();
  }

  /*
   * Username Rules:
   *
   * - فقط انگلیسی
   * - حداقل 3 و حداکثر 24 کاراکتر
   * - کاراکتر اول حتماً حرف انگلیسی
   * - عدد مجاز
   * - نقطه مجاز
   * - underline مجاز
   * - Space ممنوع
   */

  function isValidUsername(username) {
    return /^[A-Za-z][A-Za-z0-9._]{2,23}$/.test(username);
  }

  function createUserId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return "user-" + window.crypto.randomUUID();
    }

    return "user-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  }

  /* ========================================
     LocalStorage
     ======================================== */

  function readUsers() {
    return BijanStore.getUsers();
  }

  function saveUsers(users) {
    return BijanStore.saveUsers(users);
  }

  function restoreCurrentUser() {
    return BijanStore.getCurrentUser();
  }

  function setCurrentUser(user) {
    if (user) {
      currentUser = BijanStore.setCurrentUser(user.id);
    } else {
      BijanStore.clearSession();

      currentUser = null;
    }

    updateAccountUI();

    document.dispatchEvent(
      new CustomEvent("account:changed", {
        detail: {
          user: currentUser,
        },
      }),
    );
  }

  /* ========================================
     Global Messages
     ======================================== */

  function clearMessage(element) {
    if (!element) {
      return;
    }

    element.textContent = "";

    element.classList.remove("is-error", "is-success");
  }

  function showMessage(element, message, type = "error") {
    if (!element) {
      return;
    }

    element.textContent = message;

    element.classList.remove("is-error", "is-success");

    element.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function clearAllMessages() {
    clearMessage(loginMessage);

    clearMessage(registerMessage);
  }

  /* ========================================
     Field Error UI
     ======================================== */

  function setFieldError(input, message) {
    if (!input) {
      return;
    }

    const field = input.closest(".account-form__field");

    const control = input.closest(".account-form__control");

    if (!field || !control) {
      return;
    }

    control.classList.add("is-invalid");

    input.setAttribute("aria-invalid", "true");

    let error = field.querySelector(".account-form__field-error");

    if (!error) {
      error = document.createElement("p");

      error.className = "account-form__field-error";

      error.id = `${input.id || input.name}-error`;

      field.appendChild(error);
    }

    error.textContent = message;

    input.setAttribute("aria-describedby", error.id);
  }

  function clearFieldError(input) {
    if (!input) {
      return;
    }

    const field = input.closest(".account-form__field");

    const control = input.closest(".account-form__control");

    control?.classList.remove("is-invalid");

    input.removeAttribute("aria-invalid");

    input.removeAttribute("aria-describedby");

    field?.querySelector(".account-form__field-error")?.remove();
  }

  function clearFormErrors(form) {
    if (!form) {
      return;
    }

    form.querySelectorAll("input").forEach(function (input) {
      clearFieldError(input);
    });
  }

  /* ========================================
     Username Duplicate Check
     ======================================== */

  function usernameAlreadyExists(username) {
    return BijanStore.usernameExists(username);
  }

  /* ========================================
     Register Validation
     ======================================== */

  function validateRegisterName() {
    const value = cleanText(registerNameInput?.value);

    clearFieldError(registerNameInput);

    if (value.length < 2) {
      setFieldError(registerNameInput, "نام و نام خانوادگی را وارد کنید.");

      return false;
    }

    if (value.length > 50) {
      setFieldError(
        registerNameInput,
        "نام و نام خانوادگی نباید بیشتر از ۵۰ کاراکتر باشد.",
      );

      return false;
    }

    return true;
  }

  function validateRegisterUsername() {
    const value = cleanText(registerUsernameInput?.value);

    clearFieldError(registerUsernameInput);

    if (!value) {
      setFieldError(registerUsernameInput, "نام کاربری را وارد کنید.");

      return false;
    }

    if (!isValidUsername(value)) {
      setFieldError(
        registerUsernameInput,
        "نام کاربری باید ۳ تا ۲۴ کاراکتر، فقط شامل حروف انگلیسی، عدد، نقطه یا _ باشد و با حرف شروع شود.",
      );

      return false;
    }

    if (usernameAlreadyExists(value)) {
      setFieldError(registerUsernameInput, "این نام کاربری قبلاً ثبت شده است.");

      return false;
    }

    return true;
  }

  function validateRegisterPassword() {
    const value = String(registerPasswordInput?.value || "");

    clearFieldError(registerPasswordInput);

    if (!value) {
      setFieldError(registerPasswordInput, "رمز عبور را وارد کنید.");

      return false;
    }

    if (value.trim() !== value) {
      setFieldError(
        registerPasswordInput,
        "رمز عبور نباید با فاصله شروع یا تمام شود.",
      );

      return false;
    }

    if (value.length < 6) {
      setFieldError(
        registerPasswordInput,
        "رمز عبور باید حداقل ۶ کاراکتر باشد.",
      );

      return false;
    }

    return true;
  }

  function validateRegisterPasswordConfirm() {
    const password = String(registerPasswordInput?.value || "");

    const confirm = String(registerPasswordConfirmInput?.value || "");

    clearFieldError(registerPasswordConfirmInput);

    if (!confirm) {
      setFieldError(
        registerPasswordConfirmInput,
        "تکرار رمز عبور را وارد کنید.",
      );

      return false;
    }

    if (password !== confirm) {
      setFieldError(
        registerPasswordConfirmInput,
        "رمز عبور و تکرار آن یکسان نیستند.",
      );

      return false;
    }

    return true;
  }

  function validateRegisterForm() {
    const nameValid = validateRegisterName();

    const usernameValid = validateRegisterUsername();

    const passwordValid = validateRegisterPassword();

    const confirmValid = validateRegisterPasswordConfirm();

    return nameValid && usernameValid && passwordValid && confirmValid;
  }

  /* ========================================
     Header Account UI
     ======================================== */

  function updateAccountUI() {
    /*
     * Logged Out
     */

    if (!currentUser) {
      accountTextElements.forEach(function (element) {
        element.textContent = "ورود | عضویت";
      });

      accountButtons.forEach(function (button) {
        button.setAttribute("aria-label", "ورود یا عضویت");

        button.removeAttribute("data-account-authenticated");

        delete button.dataset.accountUserName;

        delete button.dataset.accountUsername;
      });

      return;
    }

    /*
     * Logged In
     */

    const firstName =
      cleanText(currentUser.name).split(" ")[0] || currentUser.username;

    accountTextElements.forEach(function (element) {
      element.textContent = `سلام، ${firstName}`;
    });

    accountButtons.forEach(function (button) {
      button.setAttribute("aria-label", `حساب کاربری ${currentUser.name}`);

      button.setAttribute("data-account-authenticated", "true");

      button.dataset.accountUserName = currentUser.name;

      button.dataset.accountUsername = currentUser.username;
    });
  }

  /* ========================================
     Modal Tabs
     ======================================== */

  function getFirstInput(panelName) {
    const panel = modal.querySelector(`[data-account-panel="${panelName}"]`);

    return panel?.querySelector("input:not([disabled])");
  }

  function activateTab(panelName, shouldFocus = false) {
    tabs.forEach(function (tab) {
      const isActive = tab.dataset.accountTab === panelName;

      tab.classList.toggle("is-active", isActive);

      tab.setAttribute("aria-selected", String(isActive));

      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.accountPanel !== panelName;
    });

    if (shouldFocus) {
      window.requestAnimationFrame(function () {
        getFirstInput(panelName)?.focus();
      });
    }
  }

  /* ========================================
     Password Visibility
     ======================================== */

  function resetPasswordVisibility() {
    modal
      .querySelectorAll('input[name="password"], input[name="passwordConfirm"]')
      .forEach(function (input) {
        /*
         * Default:
         * Password Hidden
         */

        input.type = "password";

        input.removeAttribute("data-password-visible");

        const control = input.closest(".account-form__control");

        const button = control?.querySelector("[data-password-toggle]");

        const icon = button?.querySelector("i");

        if (button) {
          button.setAttribute("aria-label", "نمایش رمز عبور");
        }

        /*
         * Hidden = Eye Slash
         */

        if (icon) {
          icon.classList.remove("fa-eye");

          icon.classList.add("fa-eye-slash");
        }
      });
  }

  passwordButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const control = button.closest(".account-form__control");

      const input = control?.querySelector(
        'input[name="password"], input[name="passwordConfirm"]',
      );

      if (!input) {
        return;
      }

      const nowVisible = input.type !== "text";

      input.type = nowVisible ? "text" : "password";

      if (nowVisible) {
        input.setAttribute("data-password-visible", "");
      } else {
        input.removeAttribute("data-password-visible");
      }

      button.setAttribute(
        "aria-label",
        nowVisible ? "مخفی کردن رمز عبور" : "نمایش رمز عبور",
      );

      const icon = button.querySelector("i");

      if (icon) {
        /*
         * Visible = Eye
         * Hidden = Eye Slash
         */

        icon.classList.toggle("fa-eye", nowVisible);

        icon.classList.toggle("fa-eye-slash", !nowVisible);
      }

      input.focus();
    });
  });

  /* ========================================
     Focusable Elements
     ======================================== */

  function getFocusableModalElements() {
    return Array.from(
      modal.querySelectorAll(
        [
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "a[href]",
          '[tabindex]:not([tabindex="-1"])',
        ].join(","),
      ),
    ).filter(function (element) {
      return !element.hidden && element.offsetParent !== null;
    });
  }

  /* ========================================
     Modal Open
     ======================================== */

  function openModal(panelName = "login") {
    window.clearTimeout(modalCloseTimer);

    closeAccountPopover();

    document.dispatchEvent(
      new CustomEvent("header-surface:open", {
        detail: {
          source: "account",
        },
      }),
    );

    previousActiveElement = document.activeElement;

    /*
     * Mobile Sidebar
     */

    const mobileMenuToggle = document.querySelector(
      "[data-mobile-menu-toggle]",
    );

    if (mobileMenuToggle?.getAttribute("aria-expanded") === "true") {
      mobileMenuToggle.click();
    }

    clearAllMessages();

    clearFormErrors(loginForm);

    clearFormErrors(registerForm);

    /*
     * هر بار Modal باز شد
     * Password مخفی شود
     */

    resetPasswordVisibility();

    activateTab(panelName, false);

    modal.hidden = false;

    document.body.classList.add("is-account-modal-open");

    window.requestAnimationFrame(function () {
      modal.classList.add("is-open");

      window.requestAnimationFrame(function () {
        getFirstInput(panelName)?.focus();
      });
    });
  }

  /* ========================================
     Modal Close
     ======================================== */

  function closeModal() {
    if (modal.hidden) {
      return;
    }

    modal.classList.remove("is-open");

    document.body.classList.remove("is-account-modal-open");

    const finishClose = function () {
      modal.hidden = true;

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus({
          preventScroll: true,
        });
      }
    };

    if (prefersReducedMotion.matches) {
      finishClose();

      return;
    }

    modalCloseTimer = window.setTimeout(finishClose, 240);
  }

  /* ========================================
     Close Buttons
     ======================================== */

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeModal);
  });

  /* ========================================
     Tabs
     ======================================== */

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab.dataset.accountTab, true);
    });

    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();

      const currentIndex = tabs.indexOf(tab);

      const direction = event.key === "ArrowLeft" ? 1 : -1;

      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;

      const nextTab = tabs[nextIndex];

      activateTab(nextTab.dataset.accountTab, false);

      nextTab.focus();
    });
  });

  /* ========================================
     Login / Register Switch
     ======================================== */

  switchButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activateTab(button.dataset.accountSwitch, true);
    });
  });

  /* ========================================
     Live Validation - Name
     ======================================== */

  registerNameInput?.addEventListener("blur", validateRegisterName);

  registerNameInput?.addEventListener("input", function () {
    if (registerNameInput.getAttribute("aria-invalid") === "true") {
      validateRegisterName();
    }
  });

  /* ========================================
     Live Validation - Username
     ======================================== */

  registerUsernameInput?.addEventListener("blur", validateRegisterUsername);

  registerUsernameInput?.addEventListener("input", function () {
    const value = registerUsernameInput.value;

    /*
     * Empty
     */

    if (!value) {
      clearFieldError(registerUsernameInput);

      return;
    }

    /*
     * فارسی، Space، @ و ...
     */

    const hasInvalidCharacters = /[^A-Za-z0-9._]/.test(value);

    /*
     * اولین کاراکتر
     * باید حرف انگلیسی باشد
     */

    const startsWrong = !/^[A-Za-z]/.test(value);

    /*
     * وقتی به حداقل 3 کاراکتر
     * رسید، Duplicate هم بررسی شود
     */

    if (hasInvalidCharacters || startsWrong || value.length >= 3) {
      validateRegisterUsername();
    }
  });

  /* ========================================
     Live Validation - Password
     ======================================== */

  registerPasswordInput?.addEventListener("blur", validateRegisterPassword);

  registerPasswordInput?.addEventListener("input", function () {
    if (registerPasswordInput.getAttribute("aria-invalid") === "true") {
      validateRegisterPassword();
    }

    /*
     * اگر Confirm نوشته شده،
     * دوباره تطبیق بده
     */

    if (registerPasswordConfirmInput?.value) {
      validateRegisterPasswordConfirm();
    }
  });

  /* ========================================
     Live Validation - Confirm Password
     ======================================== */

  registerPasswordConfirmInput?.addEventListener(
    "blur",
    validateRegisterPasswordConfirm,
  );

  registerPasswordConfirmInput?.addEventListener("input", function () {
    if (registerPasswordConfirmInput.value) {
      validateRegisterPasswordConfirm();
    } else {
      clearFieldError(registerPasswordConfirmInput);
    }
  });

  /* ========================================
     Login Input Cleanup
     ======================================== */

  loginUsernameInput?.addEventListener("input", function () {
    clearFieldError(loginUsernameInput);

    clearMessage(loginMessage);
  });

  loginPasswordInput?.addEventListener("input", function () {
    clearFieldError(loginPasswordInput);

    clearMessage(loginMessage);
  });

  /* ========================================
     Register Submit
     ======================================== */

  registerForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    clearMessage(registerMessage);

    /*
     * همه Fieldها Validation
     */

    if (!validateRegisterForm()) {
      return;
    }

    const name = cleanText(registerNameInput.value);

    const username = cleanText(registerUsernameInput.value);

    const password = String(registerPasswordInput.value || "");

    if (usernameAlreadyExists(username)) {
      setFieldError(registerUsernameInput, "این نام کاربری قبلاً ثبت شده است.");

      return;
    }

    const users = readUsers();

    /*
     * Create User
     */

    const newUser = {
      id: createUserId(),

      name: name,

      username: username,

      /*
       * فقط برای Demo Front-end.
       * در نسخه واقعی Password
       * باید سمت Server مدیریت شود.
       */

      password: password,

      cart: [],

      wishlist: [],

      orders: [],

      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    if (!saveUsers(users)) {
      showMessage(registerMessage, "ذخیره حساب کاربری انجام نشد.");

      return;
    }

    /*
     * Auto Login
     */

    setCurrentUser(newUser);

    registerForm.reset();

    clearFormErrors(registerForm);

    resetPasswordVisibility();

    showMessage(registerMessage, "حساب کاربری با موفقیت ساخته شد.", "success");

    window.setTimeout(closeModal, 350);
  });

  /* ========================================
   Login Submit
   ======================================== */

  loginForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    clearMessage(loginMessage);

    clearFieldError(loginUsernameInput);

    clearFieldError(loginPasswordInput);

    const username = normalizeUsername(loginUsernameInput?.value);

    const password = String(loginPasswordInput?.value || "");

    /*
     * Username Empty
     */

    if (!username) {
      setFieldError(loginUsernameInput, "نام کاربری را وارد کنید.");

      return;
    }

    /*
     * Username Format
     */

    if (!isValidUsername(username)) {
      setFieldError(loginUsernameInput, "نام کاربری واردشده معتبر نیست.");

      return;
    }

    /*
     * Password Empty
     */

    if (!password) {
      setFieldError(loginPasswordInput, "رمز عبور را وارد کنید.");

      return;
    }

    /*
     * Users
     */

    const user = BijanStore.findUserByUsername(username);

    /*
     * Username Does Not Exist
     */

    if (!user) {
      setFieldError(
        loginUsernameInput,
        "حساب کاربری با این نام کاربری وجود ندارد.",
      );

      return;
    }

    /*
     * Username Exists
     * But Password Is Wrong
     */

    if (user.password !== password) {
      setFieldError(loginPasswordInput, "رمز عبور اشتباه است.");

      return;
    }

    /*
     * Login Success
     */

    setCurrentUser(user);

    loginForm.reset();

    clearFormErrors(loginForm);

    resetPasswordVisibility();

    showMessage(loginMessage, "با موفقیت وارد حساب شدید.", "success");

    window.setTimeout(closeModal, 300);
  });

  /* ========================================
     Popover Position
     ======================================== */

  function positionAccountPopover(button) {
    if (!popover) {
      return;
    }

    const rect = button.getBoundingClientRect();

    const popoverWidth = popover.offsetWidth;

    const viewportWidth = window.innerWidth;

    let left = rect.right - popoverWidth;

    left = Math.max(12, Math.min(left, viewportWidth - popoverWidth - 12));

    popover.style.left = `${left}px`;

    popover.style.top = `${rect.bottom + 10}px`;
  }

  /* ========================================
     Popover Open
     ======================================== */

  function openAccountPopover(button) {
    if (!popover || !currentUser) {
      return;
    }

    document.dispatchEvent(
      new CustomEvent("header-surface:open", {
        detail: {
          source: "account",
        },
      }),
    );

    window.clearTimeout(popoverCloseTimer);

    activeAccountButton = button;

    if (popoverName) {
      popoverName.textContent = currentUser.name;
    }

    if (popoverUsername) {
      popoverUsername.textContent = `@${currentUser.username}`;
    }

    popover.hidden = false;

    positionAccountPopover(button);

    window.requestAnimationFrame(function () {
      popover.classList.add("is-open");
    });
  }

  /* ========================================
     Popover Close
     ======================================== */

  function closeAccountPopover(restoreFocus = false) {
    if (!popover || popover.hidden) {
      return;
    }

    const buttonToRestore = activeAccountButton;

    window.clearTimeout(popoverCloseTimer);

    popover.classList.remove("is-open");

    const finishClose = function () {
      popover.hidden = true;

      activeAccountButton = null;

      if (restoreFocus && buttonToRestore) {
        buttonToRestore.focus({
          preventScroll: true,
        });
      }
    };

    if (prefersReducedMotion.matches) {
      finishClose();

      return;
    }

    popoverCloseTimer = window.setTimeout(finishClose, 180);
  }

  /* ========================================
     Account Button
     ======================================== */

  accountButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      /*
       * Logged Out
       */

      if (!currentUser) {
        openModal("login");

        return;
      }

      /*
       * Logged In
       */

      if (!popover) {
        return;
      }

      const sameButtonIsOpen =
        activeAccountButton === button && !popover.hidden;

      if (sameButtonIsOpen) {
        closeAccountPopover();

        return;
      }

      if (!popover.hidden) {
        closeAccountPopover();
      }

      openAccountPopover(button);
    });
  });

  /* ========================================
     Logout
     ======================================== */

  logoutButton?.addEventListener("click", function () {
    closeAccountPopover();

    /*
     * فقط Session پاک می‌شود.
     * User حذف نمی‌شود.
     */

    setCurrentUser(null);

    loginForm?.reset();

    registerForm?.reset();

    clearFormErrors(loginForm);

    clearFormErrors(registerForm);

    clearAllMessages();

    resetPasswordVisibility();
  });

  /* ========================================
     Popover Click Outside
     ======================================== */

  document.addEventListener("pointerdown", function (event) {
    if (!popover || popover.hidden) {
      return;
    }

    const clickedAccountButton = accountButtons.some(function (button) {
      return button.contains(event.target);
    });

    if (popover.contains(event.target) || clickedAccountButton) {
      return;
    }

    closeAccountPopover();
  });

  /* ========================================
     Keyboard
     ======================================== */

  document.addEventListener("keydown", function (event) {
    /*
     * Popover Escape
     */

    if (event.key === "Escape" && popover && !popover.hidden) {
      event.preventDefault();

      closeAccountPopover(true);

      return;
    }

    /*
     * Modal Closed
     */

    if (modal.hidden) {
      return;
    }

    /*
     * Modal Escape
     */

    if (event.key === "Escape") {
      event.preventDefault();

      closeModal();

      return;
    }

    /*
     * Focus Trap
     */

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableModalElements();

    if (focusable.length === 0) {
      event.preventDefault();

      dialog?.focus();

      return;
    }

    const first = focusable[0];

    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();

      last.focus();

      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();

      first.focus();
    }
  });

  document.addEventListener("header-surface:open", function (event) {
    if (event.detail?.source === "account") {
      return;
    }

    closeAccountPopover();
  });

  /* ========================================
     Resize
     ======================================== */

  window.addEventListener("resize", function () {
    closeAccountPopover();
  });

  /* ========================================
     Scroll
     ======================================== */

  window.addEventListener(
    "scroll",
    function () {
      closeAccountPopover();
    },
    {
      passive: true,
    },
  );

  /* ========================================
     Initial State
     ======================================== */

  /*
   * Password Default:
   * Hidden + Eye Slash
   */

  resetPasswordVisibility();

  /*
   * Default Tab
   */

  activateTab("login", false);

  /*
   * Restore Login after Refresh
   */

  currentUser = restoreCurrentUser();

  updateAccountUI();
}
