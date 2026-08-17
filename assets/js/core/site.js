"use strict";

function initGoBackButton() {
  const button = document.querySelector("[data-go-back]");

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    if (window.history.length > 1) {
      window.history.back();
    }
  });
}

// Shared site-level browser and header behavior.

function initFooterBackToTop() {
  const button = document.querySelector("[data-footer-top]");

  if (!button) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  button.addEventListener("click", function () {
    window.scrollTo({
      top: 0,

      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });
  });
}

// Sticky and compact header

function initStickyHeader() {
  const siteHeader = document.querySelector(".site-header");

  if (!siteHeader) {
    return;
  }

  const siteNav = siteHeader.querySelector(".site-nav");

  const toolbar = siteHeader.querySelector(".toolbar");

  const mobileNavLayer = document.querySelector("[data-mobile-nav]");

  const desktopMedia = window.matchMedia("(min-width: 1025px)");

  let stickyStart = 0;

  let ticking = false;

  function measureStickyStart() {
    stickyStart = siteHeader.offsetTop + (toolbar ? toolbar.offsetHeight : 0);
  }

  function updateMobileMenuPosition() {
    if (!mobileNavLayer) {
      return;
    }

    const headerRect = siteHeader.getBoundingClientRect();

    const headerBottom = Math.max(0, Math.round(headerRect.bottom));

    mobileNavLayer.style.setProperty("--mobile-nav-top", `${headerBottom}px`);
  }

  function updateHeader() {
    if (desktopMedia.matches) {
      if (siteNav) {
        siteHeader.classList.toggle(
          "is-nav-sticky",
          window.scrollY >= stickyStart,
        );
      }

      if (mobileNavLayer) {
        mobileNavLayer.style.removeProperty("--mobile-nav-top");
      }

      return;
    }

    siteHeader.classList.remove("is-nav-sticky");

    updateMobileMenuPosition();
  }

  function requestUpdate() {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(function () {
      updateHeader();

      ticking = false;
    });
  }

  measureStickyStart();

  updateHeader();

  window.addEventListener("scroll", requestUpdate, {
    passive: true,
  });

  window.addEventListener(
    "resize",
    function () {
      measureStickyStart();

      requestUpdate();
    },
    {
      passive: true,
    },
  );

  function handleBreakpointChange() {
    measureStickyStart();

    updateHeader();
  }

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleBreakpointChange);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(handleBreakpointChange);
  }
}
