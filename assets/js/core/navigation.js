"use strict";

function initMobileNavigation() {
  const toggleButton = document.querySelector("[data-mobile-menu-toggle]");
  const navigationLayer = document.querySelector("[data-mobile-nav]");

  if (!toggleButton || !navigationLayer) return;

  const sidebar = navigationLayer.querySelector(".mobile-sidebar");

  const closeButton = navigationLayer.querySelector("[data-mobile-menu-close]");

  const navigationLinks = navigationLayer.querySelectorAll(
    ".mobile-sidebar__link:not([data-mobile-submenu-toggle])",
  );

  const submenuButtons = navigationLayer.querySelectorAll(
    "[data-mobile-submenu-toggle]",
  );

  if (!sidebar || !closeButton) return;

  const transitionDuration = 250;

  let closeTimer = null;
  let lastFocusedElement = null;

  function openMenu() {
    window.clearTimeout(closeTimer);

    lastFocusedElement = document.activeElement;

    navigationLayer.hidden = false;

    navigationLayer.setAttribute("aria-hidden", "false");

    toggleButton.setAttribute("aria-expanded", "true");

    toggleButton.setAttribute("aria-label", "بستن منوی سایت");

    document.body.classList.add("is-mobile-menu-open");

    window.requestAnimationFrame(function () {
      navigationLayer.classList.add("is-open");

      sidebar.focus({
        preventScroll: true,
      });
    });
  }

  function closeMenu(options) {
    const settings = options || {};

    const restoreFocus = settings.restoreFocus !== false;

    window.clearTimeout(closeTimer);

    navigationLayer.classList.remove("is-open");

    navigationLayer.setAttribute("aria-hidden", "true");

    toggleButton.setAttribute("aria-expanded", "false");

    toggleButton.setAttribute("aria-label", "باز کردن منوی سایت");

    document.body.classList.remove("is-mobile-menu-open");

    submenuButtons.forEach(function (button) {
      closeSubmenu(button);
    });

    closeTimer = window.setTimeout(function () {
      navigationLayer.hidden = true;

      if (
        restoreFocus &&
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        lastFocusedElement.focus({
          preventScroll: true,
        });
      }
    }, transitionDuration);
  }

  function toggleMenu() {
    const isOpen = navigationLayer.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function closeSubmenu(button) {
    const submenuId = button.getAttribute("aria-controls");

    const submenu = submenuId ? document.getElementById(submenuId) : null;

    if (!submenu) {
      return;
    }

    button.setAttribute("aria-expanded", "false");

    submenu.hidden = true;
  }

  function openSubmenu(button) {
    const submenuId = button.getAttribute("aria-controls");

    const submenu = submenuId ? document.getElementById(submenuId) : null;

    if (!submenu) {
      return;
    }

    submenuButtons.forEach(function (otherButton) {
      if (otherButton !== button) {
        closeSubmenu(otherButton);
      }
    });

    button.setAttribute("aria-expanded", "true");

    submenu.hidden = false;
  }

  function toggleSubmenu(button) {
    const isOpen = button.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeSubmenu(button);

      return;
    }

    openSubmenu(button);
  }

  submenuButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleSubmenu(button);
    });
  });

  toggleButton.addEventListener("click", toggleMenu);

  closeButton.addEventListener("click", function () {
    closeMenu();
  });

  navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu({
        restoreFocus: false,
      });
    });
  });

  document.addEventListener("keydown", function (event) {
    const isOpen = navigationLayer.classList.contains("is-open");

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();

      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    const isOpen = navigationLayer.classList.contains("is-open");

    if (window.innerWidth > 1024 && isOpen) {
      closeMenu({
        restoreFocus: false,
      });
    }
  });
}
