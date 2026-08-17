"use strict";

// Application bootstrap and module initialization.

document.addEventListener("DOMContentLoaded", function () {
  const initializers = [
    [
      "initMobileNavigation",
      typeof initMobileNavigation === "function" ? initMobileNavigation : null,
    ],

    [
      "initGoBackButton",
      typeof initGoBackButton === "function" ? initGoBackButton : null,
    ],

    [
      "initStickyHeader",
      typeof initStickyHeader === "function" ? initStickyHeader : null,
    ],

    [
      "initAccountSystem",
      typeof initAccountSystem === "function" ? initAccountSystem : null,
    ],

    [
      "initProductSearch",
      typeof initProductSearch === "function" ? initProductSearch : null,
    ],

    ["initWishlist", typeof initWishlist === "function" ? initWishlist : null],

    ["initCart", typeof initCart === "function" ? initCart : null],

    [
      "initHeroSlider",
      typeof initHeroSlider === "function" ? initHeroSlider : null,
    ],

    [
      "initDealCountdowns",
      typeof initDealCountdowns === "function" ? initDealCountdowns : null,
    ],

    [
      "initNewProductsFilters",
      typeof initNewProductsFilters === "function"
        ? initNewProductsFilters
        : null,
    ],

    [
      "initNewProductsSlider",
      typeof initNewProductsSlider === "function"
        ? initNewProductsSlider
        : null,
    ],

    [
      "initBestSellersFeatured",
      typeof initBestSellersFeatured === "function"
        ? initBestSellersFeatured
        : null,
    ],

    [
      "initCategoryPromosSlider",
      typeof initCategoryPromosSlider === "function"
        ? initCategoryPromosSlider
        : null,
    ],

    [
      "initTestimonialsSlider",
      typeof initTestimonialsSlider === "function"
        ? initTestimonialsSlider
        : null,
    ],

    [
      "initBlogNewsSlider",
      typeof initBlogNewsSlider === "function" ? initBlogNewsSlider : null,
    ],

    [
      "initPopularBrandsSlider",
      typeof initPopularBrandsSlider === "function"
        ? initPopularBrandsSlider
        : null,
    ],

    [
      "initFooterBackToTop",
      typeof initFooterBackToTop === "function" ? initFooterBackToTop : null,
    ],
  ];

  initializers.forEach(function ([name, initializer]) {
    if (!initializer) {
      console.error(`[Bijan] ${name} is not loaded.`);

      return;
    }

    try {
      initializer();

      console.log(`[Bijan] ${name} OK`);
    } catch (error) {
      console.error(`[Bijan] ${name} FAILED:`, error);
    }
  });
});
