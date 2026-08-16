"use strict";

function initNewProductsFilters() {
  const sections = document.querySelectorAll("[data-new-products]");

  if (sections.length === 0) {
    return;
  }

  sections.forEach(function (section) {
    const filterButtons = Array.from(
      section.querySelectorAll("[data-product-filter]"),
    );

    const productCards = Array.from(
      section.querySelectorAll("[data-product-card]"),
    );

    if (filterButtons.length === 0 || productCards.length === 0) {
      return;
    }

    function applyFilter(selectedFilter) {
      filterButtons.forEach(function (button) {
        const isActive = button.dataset.productFilter === selectedFilter;

        button.classList.toggle("is-active", isActive);

        button.setAttribute("aria-pressed", String(isActive));
      });

      productCards.forEach(function (card) {
        const category = card.dataset.productCategory || "";

        const shouldShow =
          selectedFilter === "all" || category === selectedFilter;

        card.hidden = !shouldShow;
      });

      section.dispatchEvent(new CustomEvent("new-products:updated"));
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const selectedFilter = button.dataset.productFilter || "all";

        applyFilter(selectedFilter);
      });
    });

    const initialButton =
      filterButtons.find(function (button) {
        return button.classList.contains("is-active");
      }) || filterButtons[0];

    applyFilter(initialButton.dataset.productFilter || "all");
  });
}

function initNewProductsSlider() {
  const sections = document.querySelectorAll("[data-new-products]");

  if (sections.length === 0) {
    return;
  }

  sections.forEach(function (section) {
    const viewport = section.querySelector(".new-products__viewport");

    const track = section.querySelector(".new-products__track");

    const previousButton = section.querySelector("[data-new-products-prev]");

    const nextButton = section.querySelector("[data-new-products-next]");

    const cards = Array.from(section.querySelectorAll("[data-product-card]"));

    if (
      !viewport ||
      !track ||
      !previousButton ||
      !nextButton ||
      cards.length === 0
    ) {
      return;
    }

    let currentIndex = 0;

    let resizeTimer = null;

    function getVisibleCards() {
      return cards.filter(function (card) {
        return !card.hidden;
      });
    }

    function getProductsPerView() {
      const rawValue = window
        .getComputedStyle(track)
        .getPropertyValue("--products-per-view")
        .trim();

      const parsedValue = Number.parseInt(rawValue, 10);

      return Number.isFinite(parsedValue) ? parsedValue : 4;
    }

    function getMaximumIndex() {
      const visibleCards = getVisibleCards();

      const productsPerView = getProductsPerView();

      return Math.max(0, visibleCards.length - productsPerView);
    }

    function getCardStep() {
      const visibleCards = getVisibleCards();

      const firstCard = visibleCards[0];

      if (!firstCard) {
        return 0;
      }

      const cardWidth = firstCard.getBoundingClientRect().width;

      const trackStyles = window.getComputedStyle(track);

      const gap = Number.parseFloat(
        trackStyles.columnGap || trackStyles.gap || "0",
      );

      return cardWidth + (Number.isFinite(gap) ? gap : 0);
    }

    function updateButtons() {
      const maximumIndex = getMaximumIndex();

      previousButton.disabled = currentIndex <= 0;

      nextButton.disabled = currentIndex >= maximumIndex;
    }

    function setTrackPosition(shouldAnimate) {
      const maximumIndex = getMaximumIndex();

      currentIndex = Math.min(Math.max(currentIndex, 0), maximumIndex);

      const cardStep = getCardStep();

      const offset = currentIndex * cardStep;

      if (!shouldAnimate) {
        track.classList.add("is-positioning");
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      if (!shouldAnimate) {
        void track.offsetWidth;

        window.requestAnimationFrame(function () {
          track.classList.remove("is-positioning");
        });
      }

      updateButtons();
    }

    nextButton.addEventListener("click", function () {
      const maximumIndex = getMaximumIndex();

      if (currentIndex >= maximumIndex) {
        return;
      }

      currentIndex += 1;

      setTrackPosition(true);
    });

    previousButton.addEventListener("click", function () {
      if (currentIndex <= 0) {
        return;
      }

      currentIndex -= 1;

      setTrackPosition(true);
    });

    section.addEventListener("new-products:updated", function () {
      currentIndex = 0;

      setTrackPosition(false);
    });

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        setTrackPosition(false);
      }, 120);
    });

    setTrackPosition(false);
  });
}
