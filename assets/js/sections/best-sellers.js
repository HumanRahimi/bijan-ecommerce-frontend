"use strict";

/* =========================================
   Best Sellers Featured Slider
========================================= */

function initBestSellersFeatured() {
  const root = document.querySelector("[data-best-sellers-featured]");

  if (!root) {
    return;
  }

  const image = root.querySelector("[data-featured-image]");

  const title = root.querySelector("[data-featured-title]");

  const price = root.querySelector("[data-featured-price]");

  const previousButton = root.querySelector("[data-featured-previous]");

  const nextButton = root.querySelector("[data-featured-next]");

  const cartButton = root.querySelector("[data-featured-cart]");

  const status = root.querySelector("[data-featured-status]");

  if (!image || !title || !price || !previousButton || !nextButton) {
    return;
  }

  const products = [
    {
      title:
        "ادو پرفیوم مردانه اسکلاره مدل DUNHILL LONDON DESIRE حجم ۱۰۰ میلی‌لیتر",

      image: "assets/images/deal-product-1.webp",

      alt: "ادو پرفیوم مردانه اسکلاره مدل دانهیل لندن دیزایر",

      priceType: "sale",

      oldPrice: "۱٬۵۰۰٬۰۰۰ تومان",

      currentPrice: "۱٬۱۰۰٬۰۰۰ تومان",
    },

    {
      title: "دستمال مرطوب ناژه مدل ۰۱ بسته ۲۷ و ۴۰ عددی",

      image: "assets/images/deal-product-6.webp",

      alt: "دستمال مرطوب ناژه مدل ۰۱",

      priceType: "range",

      fromPrice: "۸۰٬۰۰۰",

      toPrice: "۱۲۰٬۰۰۰",
    },

    {
      title:
        "ادو پرفیوم مردانه ایفوریا مدل آلفرد دانهیل دیزایر با رایحه گرم حجم ۱۰۰ میلی‌لیتر",

      image: "assets/images/deal-product-5.webp",

      alt: "ادو پرفیوم مردانه ایفوریا مدل آلفرد دانهیل دیزایر",

      priceType: "sale",

      oldPrice: "۴٬۰۰۰٬۰۰۰ تومان",

      currentPrice: "۲٬۰۰۰٬۰۰۰ تومان",
    },

    {
      title: "کرم روشن‌کننده و ضد لک روبو بیوتی مدل ۰۰۱",

      image: "assets/images/deal-product-4.webp",

      alt: "کرم روشن‌کننده و ضد لک روبو بیوتی",

      priceType: "range",

      fromPrice: "۶۰۰٬۰۰۰",

      toPrice: "۱٬۰۰۰٬۰۰۰",
    },

    {
      title: "اسپری روشن‌کننده صورت و بدن ایمجز مدل ۰۱ حجم ۱۵۰ میلی‌لیتر",

      image: "assets/images/deal-product-3.webp",

      alt: "اسپری روشن‌کننده صورت و بدن ایمجز",

      priceType: "sale",

      oldPrice: "۴۰۰٬۰۰۰ تومان",

      currentPrice: "۳۰۰٬۰۰۰ تومان",
    },

    {
      title: "ادو پرفیوم مردانه هارلینگن مدل تام فورد توباکو وانیل",

      image: "assets/images/deal-product-2.webp",

      alt: "ادو پرفیوم مردانه هارلینگن مدل تام فورد توباکو وانیل",

      priceType: "range",

      fromPrice: "۴۵۰٬۰۰۰",

      toPrice: "۸۰۰٬۰۰۰",
    },
  ];

  let activeIndex = 0;

  let changeTimer = null;

  function createPriceMarkup(product) {
    if (product.priceType === "sale") {
      return `
        <del>${product.oldPrice}</del>
        <strong>${product.currentPrice}</strong>
      `;
    }

    if (product.priceType === "range") {
      return `
        <div class="best-sellers-featured__range">
          <div class="best-sellers-featured__range-line">
            <span class="best-sellers-featured__range-label">
              از
            </span>

            <strong class="best-sellers-featured__range-value">
              ${product.fromPrice} تومان
            </strong>
          </div>

          <div class="best-sellers-featured__range-line">
            <span class="best-sellers-featured__range-label">
              تا
            </span>

            <strong class="best-sellers-featured__range-value">
              ${product.toPrice} تومان
            </strong>
          </div>
        </div>
      `;
    }

    return "";
  }

  function updateProduct() {
    const product = products[activeIndex];

    image.src = product.image;

    image.alt = product.alt;

    title.textContent = product.title;

    price.innerHTML = createPriceMarkup(product);

    if (cartButton) {
      cartButton.setAttribute(
        "aria-label",
        `افزودن ${product.title} به سبد خرید`,
      );

      const registryProduct = window.BijanProducts?.findProduct({
        title: product.title,
        image: product.image,
      });

      if (registryProduct) {
        cartButton.dataset.productId = registryProduct.id;
      } else {
        delete cartButton.dataset.productId;

        console.warn(
          "Featured product was not found in BijanProducts.",
          product,
        );
      }
    }

    if (status) {
      status.textContent = `محصول ${activeIndex + 1} از ${products.length}: ${product.title}`;
    }
  }

  function goToProduct(index) {
    const totalProducts = products.length;

    activeIndex = (index + totalProducts) % totalProducts;

    window.clearTimeout(changeTimer);

    root.classList.add("is-changing");

    changeTimer = window.setTimeout(function () {
      updateProduct();

      window.requestAnimationFrame(function () {
        root.classList.remove("is-changing");
      });
    }, 130);
  }

  previousButton.addEventListener("click", function () {
    goToProduct(activeIndex - 1);
  });

  nextButton.addEventListener("click", function () {
    goToProduct(activeIndex + 1);
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      goToProduct(activeIndex - 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      goToProduct(activeIndex + 1);
    }
  });

  products.forEach(function (product) {
    const preloadImage = new Image();

    preloadImage.src = product.image;
  });

  updateProduct();
}
