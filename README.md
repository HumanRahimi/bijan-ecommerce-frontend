# Bijan E-commerce Frontend

A responsive, pixel-perfect e-commerce frontend built from scratch using **HTML, CSS, and Vanilla JavaScript**.

This project focuses on responsive UI engineering, reusable frontend architecture, client-side state management, accessibility, and interactive shopping features without using a frontend framework.

---

## 🌐 Live Demo

### Store

[View Live Store](https://humanrahimi.github.io/bijan-ecommerce-frontend/demo.html)

### Responsive Device Preview

[Open Responsive Preview](https://humanrahimi.github.io/bijan-ecommerce-frontend/)

### GitHub Repository

[View Source Code](https://github.com/HumanRahimi/bijan-ecommerce-frontend)

---

## 📸 Preview

### Desktop

![Bijan E-commerce Desktop Preview](docs/desktop-preview.png)

### Mobile

![Bijan E-commerce Mobile Preview](docs/mobile-preview.png)

---

## ✨ Features

### Shopping Experience

- Add products to cart
- Increase and decrease product quantity
- Remove products from cart
- Persistent cart state using Local Storage
- Wishlist management
- Persistent wishlist state
- Cart and wishlist counters
- User-specific cart and wishlist data

### Product System

- Centralized product registry
- Shared product data across different UI sections
- Product detection across repeated product cards
- Featured product integration
- Reusable product lookup logic

### Search

- Desktop product search
- Mobile sidebar search
- Search result rendering
- Product navigation
- Product highlighting

### User Account

- Login interface
- Registration interface
- Logout
- Persistent user session
- User-specific data
- Account popover
- Login protection for shopping actions

### Navigation

- Multi-level desktop navigation
- Hover dropdown menus
- Responsive mobile sidebar
- Mobile accordion submenus
- Responsive compact header
- Click-outside behavior
- Escape-key support

### Cart & Wishlist Popovers

- Responsive floating popovers
- Dynamic positioning relative to header buttons
- Automatic synchronization while scrolling
- Automatic closing when trigger elements leave the viewport
- Only one header surface can remain open at a time

### Interactive Components

- Hero slider
- Product sliders
- Category sliders
- Promotional slider
- Best sellers section
- Testimonials slider
- Blog slider
- Brand slider
- Countdown timer
- Account modal
- Cart popover
- Wishlist popover
- Mobile sidebar

---

## 📱 Responsive Design

The interface is optimized for desktop, tablet, and mobile layouts.

The project has been tested across important viewport widths including:

```text
1440px
1200px
1024px
768px
740px
560px
425px
414px
390px
```

The responsive implementation focuses on maintaining typography and adjusting layout, spacing, wrapping, card dimensions, and interaction patterns according to the available viewport.

---

## 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- CSS Custom Properties
- Local Storage
- Custom DOM Events
- Font Awesome
- Responsive Design
- RTL Layout

No frontend framework or UI component library is used for the main application architecture.

---

## 🧠 Frontend Architecture

The project separates product data, application state, and interface behavior.

```text
               Product Cards
                    │
                    ▼
              BijanProducts
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
      Search       Cart      Wishlist
                    │           │
                    └─────┬─────┘
                          ▼
                     BijanStore
                          │
                          ▼
                     LocalStorage
```

### Product Registry

`BijanProducts` acts as a shared product layer.

Instead of implementing separate product-detection logic for Search, Cart, Wishlist, and Featured Products, these features consume the same centralized product information.

This reduces duplicated logic and keeps product behavior consistent across the application.

### Application Store

Client-side state is handled through a shared store architecture.

User-related data such as:

```text
Cart
Wishlist
User session
```

can persist between page refreshes using browser storage.

---

## 🎯 UX Decisions

Several interaction decisions were intentionally implemented to improve usability.

Cart and Wishlist behave as interactive shopping surfaces and remain positioned relative to their header triggers while scrolling.

The Account popover behaves as a temporary navigation surface and closes when the page is scrolled.

Only one major header surface can remain open at a time.

For example, opening Wishlist automatically closes Cart or Account.

Desktop navigation uses hover dropdowns, while mobile navigation uses expandable accordion submenus.

On smaller screens, Search is available inside the navigation sidebar while Cart, Wishlist, and Account remain directly accessible from the compact header.

---

## ♿ Accessibility

The project includes accessibility-focused behaviors such as:

- Semantic HTML controls
- Keyboard-accessible buttons
- `aria-expanded`
- `aria-controls`
- Escape-key handling
- Focus management for interactive surfaces
- Click-outside closing behavior
- Reduced-motion support
- Responsive interaction patterns

A deeper accessibility audit is planned as part of the next optimization phase.

---

## ⚡ Performance Considerations

Several optimizations are already included in the project:

- Visibility-aware countdown timers
- Reduced background JavaScript activity
- Shared CSS design tokens
- Responsive layouts
- Reduced-motion support
- Modular CSS and JavaScript organization

A dedicated Lighthouse and Core Web Vitals optimization pass is planned.

---

## 📂 Project Structure

```text
bijan-ecommerce-frontend/
│
├── assets/
│   │
│   ├── css/
│   │   ├── components/
│   │   ├── sections/
│   │   └── ...
│   │
│   ├── js/
│   │   ├── account/
│   │   ├── core/
│   │   ├── sections/
│   │   ├── shop/
│   │   ├── store/
│   │   └── ...
│   │
│   ├── images/
│   └── fonts/
│
├── docs/
│   ├── desktop-preview.png
│   └── mobile-preview.png
│
├── index.html
├── demo.html
├── README.md
└── .gitignore
```

---

## 🚀 Running Locally

No build process or package installation is required.

Clone the repository:

```bash
git clone https://github.com/HumanRahimi/bijan-ecommerce-frontend.git
```

Enter the project directory:

```bash
cd bijan-ecommerce-frontend
```

Then open the project using a local development server.

For example, you can use **Live Server** in Visual Studio Code.

### Responsive Preview

Open:

```text
index.html
```

### Storefront Directly

Open:

```text
demo.html
```

---

## 🖥 Responsive Preview Tool

The project contains a dedicated preview interface for testing the storefront at different viewport sizes.

```text
index.html
        │
        ▼
Responsive Preview
        │
        ▼
      iframe
        │
        ▼
    demo.html
```

This allows the main storefront to be tested quickly across different responsive layouts.

---

## 📚 What I Learned

This project helped strengthen my understanding of:

- Responsive frontend architecture
- Pixel-perfect UI implementation
- Complex CSS layouts
- Vanilla JavaScript architecture
- State management without frameworks
- Local Storage
- Reusable JavaScript modules
- DOM event coordination
- Custom events
- Product data normalization
- Responsive debugging
- Accessibility
- UI interaction design
- Shopping interface architecture

---

## 🗺 Roadmap

Planned improvements:

- [ ] Product details page
- [ ] Dedicated cart page
- [ ] Checkout flow
- [ ] Accessibility audit
- [ ] Lighthouse optimization
- [ ] Core Web Vitals optimization
- [ ] Automated UI testing
- [ ] GitHub Actions CI
- [ ] Further performance improvements

---

## 📌 Project Purpose

This project was developed as a frontend engineering and UI implementation exercise with a strong focus on responsive behavior and pixel-accurate implementation.

The goal was not only to recreate the visual interface, but also to implement realistic frontend interactions and reusable application logic using Vanilla JavaScript.

---

## ⚠️ Disclaimer

This project was created for educational and portfolio purposes.

Any third-party brand names, visual references, fonts, images, or other assets remain the property of their respective owners.

This repository demonstrates frontend development and UI implementation skills and is not presented as the official website of any referenced brand.

---

## 👨‍💻 Developer

**Human Rahimi**

GitHub:  
[github.com/HumanRahimi](https://github.com/HumanRahimi)

---

⭐ If you found this project useful, consider giving the repository a star.
