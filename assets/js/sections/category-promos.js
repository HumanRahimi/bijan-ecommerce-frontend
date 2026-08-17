"use strict";

// Responsive category promo autoplay slider.

function initCategoryPromosSlider() {
  const section = document.querySelector(".category-promos");

  const track = section?.querySelector(".category-promos__grid");

  const slides = track
    ? Array.from(track.querySelectorAll(".category-promo"))
    : [];

  if (!section || !track || slides.length < 2) {
    return;
  }

  const sliderMedia = window.matchMedia("(max-width: 1200px)");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const autoplayDelay = 5000;

  let activeIndex = 0;

  let autoplayId = null;

  let resizeId = null;

  let isPaused = false;

  function renderSlider(animate = true) {
    if (!sliderMedia.matches) {
      track.style.removeProperty("transform");

      track.style.removeProperty("transition");

      activeIndex = 0;

      return;
    }

    const activeSlide = slides[activeIndex];

    if (!activeSlide) {
      return;
    }

    if (!animate) {
      track.style.transition = "none";
    } else {
      track.style.removeProperty("transition");
    }

    const slideOffset = activeSlide.offsetLeft;

    track.style.transform = `translate3d(${-slideOffset}px, 0, 0)`;

    if (!animate) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          track.style.removeProperty("transition");
        });
      });
    }
  }

  function showNextSlide() {
    activeIndex = (activeIndex + 1) % slides.length;

    renderSlider(true);
  }

  function stopAutoplay() {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);

      autoplayId = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (
      !sliderMedia.matches ||
      isPaused ||
      document.hidden ||
      prefersReducedMotion.matches
    ) {
      return;
    }

    autoplayId = window.setInterval(showNextSlide, autoplayDelay);
  }

  function updateSliderMode() {
    stopAutoplay();

    if (sliderMedia.matches) {
      activeIndex = 0;

      renderSlider(false);

      startAutoplay();

      return;
    }

    activeIndex = 0;

    track.style.removeProperty("transform");

    track.style.removeProperty("transition");
  }

  section.addEventListener("mouseenter", function () {
    isPaused = true;

    stopAutoplay();
  });

  section.addEventListener("mouseleave", function () {
    isPaused = false;

    startAutoplay();
  });

  section.addEventListener("focusin", function () {
    isPaused = true;

    stopAutoplay();
  });

  section.addEventListener("focusout", function (event) {
    if (section.contains(event.relatedTarget)) {
      return;
    }

    isPaused = false;

    startAutoplay();
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  window.addEventListener("resize", function () {
    window.clearTimeout(resizeId);

    resizeId = window.setTimeout(function () {
      renderSlider(false);
    }, 120);
  });

  if (typeof sliderMedia.addEventListener === "function") {
    sliderMedia.addEventListener("change", updateSliderMode);
  } else if (typeof sliderMedia.addListener === "function") {
    sliderMedia.addListener(updateSliderMode);
  }

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", startAutoplay);
  }

  updateSliderMode();
}
