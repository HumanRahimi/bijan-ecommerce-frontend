"use strict";

// Preview bar and responsive device switching.
function initPreviewBar() {
  const previewBar = document.querySelector("[data-preview-bar]");

  const closeButton = document.querySelector("[data-preview-bar-close]");

  const openButton = document.querySelector("[data-preview-bar-open]");

  if (!previewBar || !closeButton || !openButton) {
    return;
  }

// Preview bar controls
  function closePreviewBar() {
    document.body.classList.add("is-preview-bar-hidden");

    previewBar.setAttribute("aria-hidden", "true");

    openButton.hidden = false;

    openButton.focus({
      preventScroll: true,
    });
  }

  function openPreviewBar() {
    document.body.classList.remove("is-preview-bar-hidden");

    previewBar.setAttribute("aria-hidden", "false");

    openButton.hidden = true;

    closeButton.focus({
      preventScroll: true,
    });
  }

  closeButton.addEventListener("click", closePreviewBar);

  openButton.addEventListener("click", openPreviewBar);
}

// Device switcher
function initDeviceSwitcher() {
  const buttons = Array.from(
    document.querySelectorAll(".device-switcher__button"),
  );

  if (buttons.length === 0) return;

  function selectDevice(selectedButton) {
    buttons.forEach(function (button) {
      const isSelected = button === selectedButton;

      button.setAttribute("aria-pressed", String(isSelected));
    });

    document.body.dataset.previewDevice =
      selectedButton.dataset.device || "desktop";
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectDevice(button);
    });
  });
}
