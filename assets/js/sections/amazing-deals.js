"use strict";

// Deal countdown timers and visibility-aware updates.
function initDealCountdowns() {
  const countdowns = Array.from(
    document.querySelectorAll("[data-deal-countdown]"),
  );

  if (countdowns.length === 0) {
    return;
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  // Formatting helpers
  function toPersianDigits(value) {
    return String(value).replace(/\d/g, function (digit) {
      return persianDigits[Number(digit)];
    });
  }

  function formatTimeValue(value) {
    return toPersianDigits(String(Math.max(0, value)).padStart(2, "0"));
  }

  function renderDigits(element, value) {
    const formattedValue = formatTimeValue(value);

    if (element.dataset.currentValue === formattedValue) {
      return;
    }

    const fragment = document.createDocumentFragment();

    Array.from(formattedValue).forEach(function (digit) {
      const digitElement = document.createElement("span");

      digitElement.className = "deal-card__digit";

      digitElement.textContent = digit;

      fragment.appendChild(digitElement);
    });

    element.replaceChildren(fragment);

    element.dataset.currentValue = formattedValue;
  }

  // Timer state
  const timers = countdowns
    .map(function (countdown) {
      const duration = Number.parseInt(countdown.dataset.duration, 10);

      const daysElement = countdown.querySelector("[data-time-days]");

      const hoursElement = countdown.querySelector("[data-time-hours]");

      const minutesElement = countdown.querySelector("[data-time-minutes]");

      const secondsElement = countdown.querySelector("[data-time-seconds]");

      if (
        !Number.isFinite(duration) ||
        duration < 0 ||
        !daysElement ||
        !hoursElement ||
        !minutesElement ||
        !secondsElement
      ) {
        return null;
      }

      return {
        countdown: countdown,

        endTime: Date.now() + duration * 1000,

        daysElement: daysElement,

        hoursElement: hoursElement,

        minutesElement: minutesElement,

        secondsElement: secondsElement,

        isExpired: false,
      };
    })
    .filter(Boolean);

  if (timers.length === 0) {
    return;
  }

  let intervalId = null;

  // Countdown updates
  function updateTimer(timer) {
    const remainingSeconds = Math.max(
      0,
      Math.ceil((timer.endTime - Date.now()) / 1000),
    );

    const days = Math.floor(remainingSeconds / 86400);

    const hours = Math.floor((remainingSeconds % 86400) / 3600);

    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    const seconds = remainingSeconds % 60;

    renderDigits(timer.daysElement, days);

    renderDigits(timer.hoursElement, hours);

    renderDigits(timer.minutesElement, minutes);

    renderDigits(timer.secondsElement, seconds);

    timer.countdown.setAttribute(
      "aria-label",
      days +
        " روز، " +
        hours +
        " ساعت، " +
        minutes +
        " دقیقه و " +
        seconds +
        " ثانیه باقی‌مانده",
    );

    if (remainingSeconds === 0 && !timer.isExpired) {
      timer.isExpired = true;

      timer.countdown.classList.add("is-expired");
    }

    return remainingSeconds > 0;
  }

  function updateAllTimers() {
    let hasActiveTimer = false;

    timers.forEach(function (timer) {
      const isActive = updateTimer(timer);

      if (isActive) {
        hasActiveTimer = true;
      }
    });

    if (!hasActiveTimer && intervalId !== null) {
      window.clearInterval(intervalId);

      intervalId = null;
    }

    return hasActiveTimer;
  }

  // Ticker controls
  function stopTicker() {
    if (intervalId === null) {
      return;
    }

    window.clearInterval(intervalId);

    intervalId = null;
  }

  function startTicker() {
    stopTicker();

    if (document.hidden) {
      return;
    }

    const hasActiveTimer = updateAllTimers();

    if (hasActiveTimer) {
      intervalId = window.setInterval(updateAllTimers, 1000);
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopTicker();

      return;
    }

    startTicker();
  });

  startTicker();
}
