# Athenaeum Booksellers - Independent Bookstore Events Portal

> **Ticket ID:** ENG-18072  
> **Epic:** Core Infrastructure Overhaul  
> **Priority:** P1 (High)  
> **Module Lead:** Neha Gupta  
> **Assigned Engineer:** Abhishek Kumar [PDIT-FTE-11456]

---

## 📖 Executive Summary
Floor staff at Athenaeum Booksellers previously relied on manual paper logs and disparate spreadsheets to manage in-store book launches, author signings, poetry readings, and book club sessions. This legacy approach introduced operational bottlenecks and scheduling conflicts.

This repository delivers a lightweight, zero-dependency, semantic web application allowing bookstore staff to browse, search, filter, and schedule events with instant reactivity, resilient edge-case handling, and strict corporate accessibility compliance.

---

## 🛠️ Technology Stack & Constraints
- **Markup:** Pure Semantic HTML5 (`<header role="banner">`, `<main id="main-content">`, `<section>`, `<article>`, `<footer role="contentinfo">`)
- **Styling:** Vanilla CSS (Strict monochromatic corporate design system, 16px/32px spacing steps, high-contrast palette)
- **Logic:** Vanilla JavaScript (ES6+, DOM API, LocalStorage persistence)
- **Zero External Dependencies:** No React, Bootstrap, Tailwind, or external runtime libraries.

---

## ✨ Features & Requirements Matrix

### 1. Agile User Stories (Happy Path)
- **Unified Floor Directory:** Instant visual access to all scheduled literary events, guests, dates, and categories.
- **Fast Search & Filter:** Filter in real-time by keyword (title, author, floor notes) and category (Author Signing, Book Club, Poetry Reading, Storytime, Workshop).
- **Event Scheduling:** Quick modal form allowing floor staff to add new bookstore sessions.
- **Data Persistence:** Events are automatically synchronized to browser `localStorage`.

### 2. Edge Case Handling (The "Unhappy Path")
- **Empty States:** When a query yields 0 results, a dedicated accessible message is displayed (`"No data found"`) alongside a quick `"Clear Search Filter"` action.
- **3G Connection Simulator:** Displays a non-blocking spinning loading state during any simulated asynchronous data queries and page mounting.
- **Form Validation & Malformed Input Handling:** All mandatory inputs (`title`, `author`, `date`, `genre`) are checked on submission. Invalid fields receive a bold red border (`.input-invalid` with `--error-color: #b00020`) and announce error text via `aria-live="polite"`.

### 3. Non-Functional Requirements (NFRs)
- **100% Lighthouse Accessibility (a11y):** Full keyboard navigation (Tab navigation, Escape key modal dismissal, Skip to Main Content link), descriptive ARIA landmarks (`role`, `aria-label`, `aria-required`, `aria-live`, `aria-expanded`).
- **Telemetry Simulation:** Logs telemetry pings on every primary action:
  ```text
  [Analytics] User interacted with Independent Bookstore Events Page -> Action: <ACTION_NAME> { ...details }
  ```
- **XSS Security Sanitization:** Text inputs are safely encoded and sanitized before being placed into DOM trees to prevent Cross-Site Scripting.

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhishek-5407/bookstore-events-page.git
   cd bookstore-events-page
   ```

2. **Run locally:**
   Open `index.html` directly in any modern web browser:
   - On Windows: Double click `index.html` or run in terminal:
     ```powershell
     Start-Process "index.html"
     ```
   - Or serve with any lightweight static server:
     ```bash
     npx serve .
     ```

---

## 🧪 Self-QA Verification Checklist

- [x] **Happy Path Testing:**
  - [x] Verified initial load renders default bookstore events.
  - [x] Tested search input by title ("Arundhati") and author name.
  - [x] Tested category dropdown filtering.
  - [x] Created new event and confirmed it renders at the top of the schedule.
  - [x] Removed an event and verified list update.
- [x] **Unhappy Path (Edge Case) Testing:**
  - [x] Entered non-matching query ("xyz999") and verified `"No data found"` empty state.
  - [x] Submitted empty creation form and verified red highlights and error captions.
  - [x] Verified async loading indicator appears briefly before results render.
- [x] **NFR & Compliance Testing:**
  - [x] Opened Browser DevTools (F12) > Console to verify telemetry pings.
  - [x] Tested full keyboard accessibility (`Tab`, `Shift+Tab`, `Enter`, `Esc`).
  - [x] Inputted `<script>alert('xss')</script>` into form fields and verified safe sanitization.

---

## 📄 License & Governance
Confidential internal software built for Athenaeum Booksellers. Unauthorized distribution prohibited.
