# Bijan E-commerce Frontend

A pixel-perfect, responsive e-commerce frontend built from scratch using **HTML, CSS, and Vanilla JavaScript**.

This project focuses on modern frontend engineering concepts including responsive UI development, reusable components, client-side state management, accessibility, and performance optimization without using any frontend framework.

---

## 🌐 Live Demo

### Store

https://humanrahimi.github.io/bijan-ecommerce-frontend/demo.html

### Responsive Preview

https://humanrahimi.github.io/bijan-ecommerce-frontend/

### Repository

https://github.com/HumanRahimi/bijan-ecommerce-frontend

---

# 📸 Preview

## Desktop

![Desktop Preview](docs/desktop-preview.png)

## Mobile

![Mobile Preview](docs/mobile-preview.png)

---

# ✨ Features

## 🛒 E-commerce Functionality

- Shopping cart system
- Add / remove products
- Product quantity management
- Wishlist system
- Cart and wishlist counters
- LocalStorage persistence
- User-based shopping data
- Dynamic product updates

---

## 🔍 Product & Search System

- Centralized product registry
- Product data management
- Search functionality
- Product filtering
- Shared product data between:
  - Product cards
  - Cart
  - Wishlist
  - Search results

---

## 👤 User Account

- Login interface
- Register interface
- Account popover
- User session management
- Protected shopping actions
- Persistent user data

---

## 🧭 Navigation

- Responsive desktop navigation
- Hover dropdown menus
- Mobile sidebar navigation
- Accordion submenus
- Mobile-friendly interactions
- Click outside closing behavior
- Escape key support

---

## 🎞 Interactive Components

Implemented components:

- Hero slider
- Product sliders
- Category sliders
- Brand slider
- Testimonials slider
- Blog slider
- Countdown timers
- Modal dialogs
- Popovers
- Mobile navigation

---

# 📱 Responsive Design

The project is optimized for multiple screen sizes:

```
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

The responsive approach focuses on:

- Maintaining typography quality
- Flexible layouts
- Proper spacing
- Mobile-first interaction patterns
- Pixel-perfect implementation

---

# 🛠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- CSS Custom Properties
- LocalStorage API
- DOM Events
- Responsive Design
- RTL Layout

No frontend framework or UI library was used.

---

# 🧠 Architecture

The project separates:

- Product data
- Application state
- UI behavior

Architecture overview:

```
                Product Data
                     │
                     ▼
              BijanProducts
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Search        Cart      Wishlist
                     │
                     ▼
               BijanStore
                     │
                     ▼
              LocalStorage
```

---

# ⚡ Performance Optimization

Implemented optimizations:

- Lazy loading images
- Optimized image loading strategy
- Font loading optimization
- Reduced unnecessary resource loading
- Responsive asset usage
- Improved initial page rendering

---

# ♿ Accessibility

Accessibility improvements include:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Escape key handling
- Accessible modals and popovers
- Improved color contrast
- Proper touch targets

Lighthouse Accessibility score:

```
100
```

---

# 📊 Lighthouse Results

Approximate results:

| Category       | Score |
| -------------- | ----: |
| Performance    |   90+ |
| Accessibility  |    96 |
| Best Practices |    77 |
| SEO            |   100 |

---

# 📂 Project Structure

```
bijan-ecommerce-frontend/

│
├── assets/
│   │
│   ├── css/
│   │
│   ├── js/
│   │
│   ├── images/
│   │
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

# 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/HumanRahimi/bijan-ecommerce-frontend.git
```

Open the project folder:

```bash
cd bijan-ecommerce-frontend
```

Run the project using:

- VS Code Live Server
- Any local development server

---

# 📚 What I Learned

This project helped improve my understanding of:

- Responsive frontend architecture
- Pixel-perfect implementation
- Vanilla JavaScript application structure
- State management without frameworks
- DOM event handling
- LocalStorage
- UI interaction design
- Accessibility
- Performance optimization
- Real-world e-commerce workflows

---

# 🗺 Future Improvements

Planned features:

- [ ] Product details page
- [ ] Dedicated cart page
- [ ] Checkout flow
- [ ] Advanced filtering
- [ ] Automated UI testing
- [ ] GitHub Actions CI
- [ ] Further performance improvements

---

# 👨‍💻 Author

**Hooman Rahimi**

GitHub:

https://github.com/HumanRahimi

Telegram:

https://t.me/HumanRahimi

---

# 📌 Disclaimer

This project was created for educational and portfolio purposes.

Any third-party brand names, images, fonts, or visual references belong to their respective owners.
