# Bijan E-commerce Frontend

A responsive, pixel-perfect e-commerce frontend built from scratch using **HTML, CSS, and Vanilla JavaScript**.

The project focuses on responsive UI engineering, reusable frontend architecture, state management, accessibility, and interactive shopping features without using a frontend framework.

---

## Preview

### Desktop

![Desktop Preview](docs/desktop-preview.png)

### Mobile

![Mobile Preview](docs/mobile-preview.png)

---

## Live Demo

- **Store:** [View Live Store](YOUR_LIVE_DEMO_URL/demo.html)
- **Responsive Preview:** [Open Device Preview](YOUR_LIVE_DEMO_URL/)

---

## Features

### Shopping

- Add to cart
- Product quantity controls
- Remove products from cart
- Persistent cart state
- Wishlist management
- Per-user cart and wishlist data
- Cart and wishlist badges

### Product System

- Centralized product registry
- Shared product data between:
  - Search
  - Cart
  - Wishlist
  - Featured products
- Duplicate product detection across multiple sections

### Search

- Product search
- Desktop search interface
- Mobile sidebar search
- Search result navigation
- Product highlighting

### Account

- Login interface
- Registration interface
- User-specific data
- Persistent session state
- Account popover

### Navigation

- Desktop navigation
- Hover dropdown menus
- Mobile sidebar
- Mobile accordion submenus
- Responsive header

### Interactive Components

- Hero slider
- Product sliders
- Category sliders
- Testimonials slider
- Blog slider
- Brand slider
- Countdown timers
- Popovers
- Modals

### Responsive Design

Optimized for a wide range of viewport sizes, including:

- 1440px
- 1200px
- 1024px
- 768px
- 740px
- 560px
- 425px
- 414px
- 390px

---

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome
- Local Storage
- Responsive CSS
- CSS Custom Properties
- Custom DOM events

No frontend framework or UI library is used for the application architecture.

---

## Architecture

The application separates product data, application state, and UI behavior.

```text
HTML Product Cards
        │
        ▼
  BijanProducts
        │
 ┌──────┼──────────┐
 ▼      ▼          ▼
Search  Cart    Wishlist
        │
        ▼
   BijanStore
        │
        ▼
   LocalStorage