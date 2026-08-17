"use strict";

// Mobile blog slider, dots, and swipe gestures.

function initBlogNewsSlider() {
  const sliders = document.querySelectorAll("[data-blog-slider]");

  if (sliders.length === 0) {
    return;
  }

  sliders.forEach(function (slider) {
    const viewport = slider.querySelector(".blog-news__mobile-viewport");

    const track = slider.querySelector("[data-blog-track]");

    const dotsContainer = slider.querySelector("[data-blog-dots]");

    if (!viewport || !track || !dotsContainer) {
      return;
    }

    const slides = Array.from(
      track.querySelectorAll(".blog-news__mobile-slide"),
    );

    if (slides.length === 0) {
      return;
    }

    dotsContainer.replaceChildren();

    let currentIndex = 0;

    let startX = 0;

    let deltaX = 0;

    let activePointerId = null;

    let resizeTimer = null;

    slides.forEach(function (slide, index) {
      const dot = document.createElement("button");

      dot.type = "button";

      dot.className = "blog-news__mobile-dot";

      dot.setAttribute("aria-label", `نمایش اسلاید ${index + 1}`);

      dot.addEventListener("click", function () {
        currentIndex = index;

        renderSlider();
      });

      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(
      dotsContainer.querySelectorAll(".blog-news__mobile-dot"),
    );

    function updateDots() {
      dots.forEach(function (dot, index) {
        const isActive = index === currentIndex;

        dot.classList.toggle("is-active", isActive);

        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function renderSlider(animate = true) {
      currentIndex = Math.min(Math.max(currentIndex, 0), slides.length - 1);

      const trackStyle = window.getComputedStyle(track);

      const gap = Number.parseFloat(trackStyle.columnGap) || 0;

      const slideWidth = viewport.clientWidth;

      const offset = currentIndex * (slideWidth + gap);

      if (!animate) {
        track.style.transition = "none";
      } else {
        track.style.removeProperty("transition");
      }

      track.style.transform = `translate3d(${offset}px, 0, 0)`;

      updateDots();

      if (!animate) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            track.style.removeProperty("transition");
          });
        });
      }
    }

    viewport.addEventListener("pointerdown", function (event) {
      if (activePointerId !== null) {
        return;
      }

      activePointerId = event.pointerId;

      startX = event.clientX;

      deltaX = 0;

      if (typeof viewport.setPointerCapture === "function") {
        viewport.setPointerCapture(event.pointerId);
      }
    });

    viewport.addEventListener("pointermove", function (event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      deltaX = event.clientX - startX;
    });

    viewport.addEventListener("pointerup", function (event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      if (Math.abs(deltaX) > 45) {
        if (deltaX > 0 && currentIndex < slides.length - 1) {
          currentIndex += 1;
        }

        if (deltaX < 0 && currentIndex > 0) {
          currentIndex -= 1;
        }
      }

      if (
        typeof viewport.hasPointerCapture === "function" &&
        viewport.hasPointerCapture(event.pointerId)
      ) {
        viewport.releasePointerCapture(event.pointerId);
      }

      startX = 0;

      deltaX = 0;

      activePointerId = null;

      renderSlider();
    });

    viewport.addEventListener("pointercancel", function (event) {
      if (event.pointerId !== activePointerId) {
        return;
      }

      startX = 0;

      deltaX = 0;

      activePointerId = null;
    });

    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        renderSlider(false);
      }, 100);
    });

    renderSlider(false);
  });
}
