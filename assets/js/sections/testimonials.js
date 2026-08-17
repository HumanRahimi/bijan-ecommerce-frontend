"use strict";

// Responsive testimonials slider.

function initTestimonialsSlider() {
  const sections = document.querySelectorAll("[data-testimonials]");

  if (sections.length === 0) {
    return;
  }

  sections.forEach(function (section) {
    const viewport = section.querySelector(".testimonials__viewport");

    const track = section.querySelector("[data-testimonials-track]");

    const slides = track
      ? Array.from(track.querySelectorAll(".testimonial-card"))
      : [];

    const nextButton = section.querySelector("[data-testimonials-next]");

    const prevButton = section.querySelector("[data-testimonials-prev]");

    if (
      !viewport ||
      !track ||
      slides.length === 0 ||
      !nextButton ||
      !prevButton
    ) {
      return;
    }

    let currentIndex = 0;

    let maximumIndex = 0;

    let resizeTimer = null;

    function getSliderMeasurements() {
      const trackStyles = window.getComputedStyle(track);

      const gap = Number.parseFloat(trackStyles.columnGap) || 0;

      const slideWidth = slides[0].getBoundingClientRect().width;

      const visibleCount = Math.max(
        1,
        Math.round((viewport.clientWidth + gap) / (slideWidth + gap)),
      );

      return {
        gap: gap,

        slideWidth: slideWidth,

        visibleCount: visibleCount,
      };
    }

    function updateArrowStates() {
      prevButton.disabled = currentIndex <= 0;

      nextButton.disabled = currentIndex >= maximumIndex;

      prevButton.setAttribute("aria-disabled", String(prevButton.disabled));

      nextButton.setAttribute("aria-disabled", String(nextButton.disabled));
    }

    function renderSlider(animate = true) {
      const measurements = getSliderMeasurements();

      const gap = measurements.gap;

      const slideWidth = measurements.slideWidth;

      const visibleCount = measurements.visibleCount;

      maximumIndex = Math.max(0, slides.length - visibleCount);

      currentIndex = Math.min(currentIndex, maximumIndex);

      const offset = currentIndex * (slideWidth + gap);

      if (!animate) {
        track.style.transition = "none";
      } else {
        track.style.removeProperty("transition");
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      updateArrowStates();

      if (!animate) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            track.style.removeProperty("transition");
          });
        });
      }
    }

    nextButton.addEventListener("click", function () {
      if (currentIndex >= maximumIndex) {
        return;
      }

      currentIndex += 1;

      renderSlider(true);
    });

    prevButton.addEventListener("click", function () {
      if (currentIndex <= 0) {
        return;
      }

      currentIndex -= 1;

      renderSlider(true);
    });

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        renderSlider(false);
      }, 120);
    });

    renderSlider(false);
  });
}
