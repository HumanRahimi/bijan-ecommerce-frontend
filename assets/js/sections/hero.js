"use strict";

// Hero slider transitions, controls, and autoplay.
function initHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");

  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));

  const thumbs = Array.from(slider.querySelectorAll("[data-hero-thumb]"));

  const previousButton = slider.querySelector("[data-hero-prev]");

  const nextButton = slider.querySelector("[data-hero-next]");

  const status = slider.querySelector("[data-hero-status]");

  if (
    slides.length === 0 ||
    slides.length !== thumbs.length ||
    !previousButton ||
    !nextButton
  ) {
    console.warn("Hero slider: تعداد اسلایدها و Thumbnailها هماهنگ نیست.");

    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const autoplayDelay = 5000;

  const transitionDuration = 460;

  const motionClasses = [
    "is-leaving-next",
    "is-entering-next",
    "is-leaving-previous",
    "is-entering-previous",
    "is-animating-in",
  ];

  let activeIndex = slides.findIndex(function (slide) {
    return slide.classList.contains("is-active");
  });

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  let autoplayId = null;

  let transitionId = null;

  let animationFrameId = null;

  let isAnimating = false;

// Slider helpers
  function normalizeIndex(index) {
    return (index + slides.length) % slides.length;
  }

  function removeMotionClasses(slide) {
    slide.classList.remove.apply(slide.classList, motionClasses);
  }

  function updateThumbs(index) {
    thumbs.forEach(function (thumb, thumbIndex) {
      const isActive = thumbIndex === index;

      thumb.classList.toggle("is-active", isActive);

      thumb.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateAccessibility(index) {
    slides.forEach(function (slide, slideIndex) {
      const isActive = slideIndex === index;

      slide.setAttribute("aria-hidden", String(!isActive));

      if (isActive) {
        slide.removeAttribute("tabindex");
      } else {
        slide.setAttribute("tabindex", "-1");
      }
    });
  }

  function announceSlide(index, shouldAnnounce) {
    if (!status || !shouldAnnounce) return;

    status.textContent = "پیشنهاد " + (index + 1) + " از " + slides.length;
  }

// Rendering
  function renderImmediately(index, shouldAnnounce) {
    const targetIndex = normalizeIndex(index);

    window.clearTimeout(transitionId);

    window.cancelAnimationFrame(animationFrameId);

    slides.forEach(function (slide, slideIndex) {
      removeMotionClasses(slide);

      slide.classList.toggle("is-active", slideIndex === targetIndex);
    });

    activeIndex = targetIndex;

    isAnimating = false;

    updateThumbs(activeIndex);

    updateAccessibility(activeIndex);

    announceSlide(activeIndex, shouldAnnounce);
  }

  function render(index, options) {
    const settings = options || {};

    const targetIndex = normalizeIndex(index);

    const direction = settings.direction || "next";

    const shouldAnnounce = settings.announce !== false;

    if (targetIndex === activeIndex || isAnimating) {
      return false;
    }

    if (prefersReducedMotion.matches) {
      renderImmediately(targetIndex, shouldAnnounce);

      return true;
    }

    isAnimating = true;

    window.clearTimeout(transitionId);

    window.cancelAnimationFrame(animationFrameId);

    const currentSlide = slides[activeIndex];

    const targetSlide = slides[targetIndex];

    const leavingClass =
      direction === "previous" ? "is-leaving-previous" : "is-leaving-next";

    const enteringClass =
      direction === "previous" ? "is-entering-previous" : "is-entering-next";

    removeMotionClasses(currentSlide);

    removeMotionClasses(targetSlide);

    targetSlide.classList.add(enteringClass);

    void targetSlide.offsetWidth;

    updateThumbs(targetIndex);

    animationFrameId = window.requestAnimationFrame(function () {
      currentSlide.classList.remove("is-active");

      currentSlide.classList.add(leavingClass);

      targetSlide.classList.remove(enteringClass);

      targetSlide.classList.add("is-animating-in");

      transitionId = window.setTimeout(function () {
        removeMotionClasses(currentSlide);

        removeMotionClasses(targetSlide);

        targetSlide.classList.add("is-active");

        activeIndex = targetIndex;

        isAnimating = false;

        updateAccessibility(activeIndex);

        announceSlide(activeIndex, shouldAnnounce);
      }, transitionDuration);
    });

    return true;
  }

// Autoplay controls
  function stopAutoplay() {
    if (autoplayId === null) return;

    window.clearInterval(autoplayId);

    autoplayId = null;
  }

  function startAutoplay() {
    stopAutoplay();

    if (document.hidden || prefersReducedMotion.matches) {
      return;
    }

    autoplayId = window.setInterval(function () {
      render(activeIndex + 1, {
        direction: "next",
        announce: false,
      });
    }, autoplayDelay);
  }

  function goTo(index, direction) {
    render(index, {
      direction: direction,
      announce: true,
    });

    startAutoplay();
  }

// Event bindings
  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener("click", function () {
      if (index === activeIndex) {
        startAutoplay();

        return;
      }

      const forwardDistance =
        (index - activeIndex + slides.length) % slides.length;

      const backwardDistance =
        (activeIndex - index + slides.length) % slides.length;

      const direction =
        forwardDistance <= backwardDistance ? "next" : "previous";

      goTo(index, direction);
    });
  });

  previousButton.addEventListener("click", function () {
    goTo(activeIndex - 1, "previous");
  });

  nextButton.addEventListener("click", function () {
    goTo(activeIndex + 1, "next");
  });

  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();

      goTo(activeIndex - 1, "previous");
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      goTo(activeIndex + 1, "next");
    }
  });

  slider.addEventListener("mouseenter", stopAutoplay);

  slider.addEventListener("mouseleave", startAutoplay);

  slider.addEventListener("focusin", stopAutoplay);

  slider.addEventListener("focusout", function (event) {
    if (!slider.contains(event.relatedTarget)) {
      startAutoplay();
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  renderImmediately(activeIndex, false);

  startAutoplay();
}
