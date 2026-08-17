"use strict";

// Infinite popular-brands slider.

function initPopularBrandsSlider() {
  const slider = document.querySelector(".brands-slider");

  if (!slider) {
    return;
  }

  const section = slider.closest(".brands-section");

  const track = slider.querySelector(".brands-slider__track");

  const nextButton = section?.querySelector(".brands-section__arrow--next");

  const prevButton = section?.querySelector(".brands-section__arrow--prev");

  if (!section || !track || !nextButton || !prevButton) {
    return;
  }

  let isMoving = false;

  let transitionFallbackId = null;

  function getStep() {
    const firstItem = track.querySelector(".brand-item");

    return firstItem ? firstItem.getBoundingClientRect().width : 0;
  }

  nextButton.addEventListener("click", function () {
    if (isMoving) {
      return;
    }

    isMoving = true;

    const step = getStep();

    if (step <= 0) {
      isMoving = false;

      return;
    }

    track.style.transition = "transform 400ms cubic-bezier(.22,.61,.36,1)";

    track.style.transform = `translate3d(${step}px, 0, 0)`;

    let isFinished = false;

    const done = function (event) {
      if (
        isFinished ||
        (event &&
          (event.target !== track || event.propertyName !== "transform"))
      ) {
        return;
      }

      isFinished = true;

      window.clearTimeout(transitionFallbackId);

      transitionFallbackId = null;

      track.removeEventListener("transitionend", done);

      const firstItem = track.firstElementChild;

      if (firstItem) {
        track.appendChild(firstItem);
      }

      track.style.transition = "none";

      track.style.transform = "translate3d(0, 0, 0)";

      void track.offsetHeight;

      track.style.transition = "transform 400ms cubic-bezier(.22,.61,.36,1)";

      isMoving = false;
    };

    track.addEventListener("transitionend", done);

    transitionFallbackId = window.setTimeout(function () {
      done();
    }, 500);
  });

  prevButton.addEventListener("click", function () {
    if (isMoving) {
      return;
    }

    isMoving = true;

    const step = getStep();

    if (step <= 0) {
      isMoving = false;

      return;
    }

    const lastItem = track.lastElementChild;

    if (!lastItem || !track.firstElementChild) {
      isMoving = false;

      return;
    }

    track.insertBefore(lastItem, track.firstElementChild);

    track.style.transition = "none";

    track.style.transform = `translate3d(${step}px, 0, 0)`;

    void track.offsetHeight;

    window.requestAnimationFrame(function () {
      track.style.transition = "transform 400ms cubic-bezier(.22,.61,.36,1)";

      track.style.transform = "translate3d(0, 0, 0)";
    });

    let isFinished = false;

    const done = function (event) {
      if (
        isFinished ||
        (event &&
          (event.target !== track || event.propertyName !== "transform"))
      ) {
        return;
      }

      isFinished = true;

      window.clearTimeout(transitionFallbackId);

      transitionFallbackId = null;

      track.removeEventListener("transitionend", done);

      isMoving = false;
    };

    track.addEventListener("transitionend", done);

    transitionFallbackId = window.setTimeout(function () {
      done();
    }, 500);
  });
}
