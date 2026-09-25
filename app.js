/**
 * Athenaeum Booksellers - Floor Portal Script
 * Ticket ID: ENG-18072 | Core Infrastructure Overhaul
 * 
 * Features:
 * 1. Monochromatic rendering & dynamic event management
 * 2. Asynchronous 3G load simulation with loading spinner
 * 3. Empty state handling for zero search/filter matches
 * 4. Input validation with accessible red highlight and error feedback
 * 5. Input sanitization against Cross-Site Scripting (XSS)
 * 6. Telemetry simulation logging to browser console
 */

(function () {
  "use strict";

  // Storage key for persistent state
  const STORAGE_KEY = "ATHENAEUM_BOOKSTORE_EVENTS_DATA";

  // Default seed data for initial floor hydration
  const DEFAULT_EVENTS = [
    {
      id: 1,
      title: "The Architecture of Prose: An Evening with Arundhati",
      author: "Arundhati Roy",
      date: "2026-10-15",
      genre: "Author Signing",
      desc: "A live discussion and Q&A covering contemporary narrative structure and historical fiction."
    },
    {
      id: 2,
      title: "Modern Speculative Fiction Circle",
      author: "Elena Vance (Curator)",
      date: "2026-10-22",
      genre: "Book Club",
      desc: "Monthly community discussion exploring early 21st-century science fiction and dystopian themes."
    },
    {
      id: 3,
      title: "Midnight Verse Reading & Open Mic",
      author: "Local Poets Collective",
      date: "2026-11-05",
      genre: "Poetry Reading",
      desc: "A quiet reading circle and acoustics hosted in the historic bookstore courtyard."
    },
    {
      id: 4,
      title: "Illustrated Tales: Children's Morning Reading",
      author: "Marcus Thorne",
      date: "2026-11-12",
      genre: "Children's Storytime",
      desc: "Interactive reading session and character sketch workshop for ages 5-10."
    }
  ];

  // In-memory events state
  let bookstoreEvents = loadInitialEvents();

  // DOM Elements
  const eventsGrid = document.getElementById("events-grid");
  const eventsCount = document.getElementById("events-count");
  const emptyState = document.getElementById("empty-state");
  const loadingIndicator = document.getElementById("loading-indicator");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const categoryFilter = document.getElementById("category-filter");
  const resetSearchBtn = document.getElementById("reset-search-btn");
  const toggleFormBtn = document.getElementById("toggle-form-btn");
  const eventFormSection = document.getElementById("event-form-section");
  const createEventForm = document.getElementById("create-event-form");
  const cancelFormBtn = document.getElementById("cancel-form-btn");

  // Form Input Fields
  const titleInput = document.getElementById("event-title");
  const authorInput = document.getElementById("event-author");
  const dateInput = document.getElementById("event-date");
  const genreInput = document.getElementById("event-genre");
  const descInput = document.getElementById("event-desc");

  /**
   * Telemetry Simulation Logger
   * Satisfies NFR: Logs standardized telemetry pings to console on primary actions
   */
  function sendTelemetry(actionName, details = {}) {
    console.log(
      `[Analytics] User interacted with Independent Bookstore Events Page -> Action: ${actionName}`,
      {
        timestamp: new Date().toISOString(),
        ...details
      }
    );
  }

  /**
   * XSS Sanitization Utility
   * Satisfies NFR: Sanitizes string inputs against malicious script injection
   */
  function sanitizeString(str) {
    if (typeof str !== "string") return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * State Storage Helpers
   */
  function loadInitialEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Storage read error, using default dataset", err);
    }
    return [...DEFAULT_EVENTS];
  }

  function persistEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookstoreEvents));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }
  }

  /**
   * Asynchronous Load Simulator (3G / Spotty Connection simulation)
   * Satisfies Edge Case: Visual loading indicator during async operations
   */
  function simulateAsyncLoad(callback, duration = 400) {
    loadingIndicator.classList.remove("hidden");
    eventsGrid.classList.add("hidden");
    emptyState.classList.add("hidden");

    setTimeout(() => {
      loadingIndicator.classList.add("hidden");
      callback();
    }, duration);
  }

  /**
   * Render Engine: Injects event cards into DOM with ARIA accessibility
   */
  function renderEvents(items) {
    eventsGrid.innerHTML = "";

    const count = items ? items.length : 0;
    eventsCount.textContent = `Showing ${count} event${count === 1 ? "" : "s"}`;

    // Handle Unhappy Path: Empty State
    if (!items || items.length === 0) {
      emptyState.classList.remove("hidden");
      eventsGrid.classList.add("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    eventsGrid.classList.remove("hidden");

    items.forEach((event) => {
      const card = document.createElement("article");
      card.className = "event-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Event: ${event.title}, by ${event.author}`);

      // Build safe sanitized HTML
      const sanitizedTitle = sanitizeString(event.title);
      const sanitizedAuthor = sanitizeString(event.author);
      const sanitizedDate = sanitizeString(event.date);
      const sanitizedGenre = sanitizeString(event.genre);
      const sanitizedDesc = sanitizeString(event.desc || "No summary provided for this store session.");

      card.innerHTML = `
        <div>
          <div class="event-card-header">
            <span class="event-category-badge">${sanitizedGenre}</span>
            <h3 class="event-title">${sanitizedTitle}</h3>
            <div class="event-meta">
              <div class="event-meta-item">
                <span class="meta-label">Guest:</span>
                <span>${sanitizedAuthor}</span>
              </div>
              <div class="event-meta-item">
                <span class="meta-label">Date:</span>
                <time datetime="${sanitizedDate}">${sanitizedDate}</time>
              </div>
            </div>
          </div>
          <p class="event-desc">${sanitizedDesc}</p>
        </div>
        <div class="event-card-footer">
          <span class="event-id-tag">REF-#${event.id}</span>
          <button
            type="button"
            class="btn btn-danger-outline delete-btn"
            data-id="${event.id}"
            aria-label="Remove event ${sanitizedTitle}"
          >
            Remove
          </button>
        </div>
      `;

      eventsGrid.appendChild(card);
    });

    // Attach click listeners for event removal
    const deleteButtons = eventsGrid.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", handleRemoveEvent);
    });
  }

  /**
   * Search and Filter Handler
   */
  function executeSearchAndFilter() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    sendTelemetry("SEARCH_FILTER_TRIGGERED", { query, category: selectedCategory });

    simulateAsyncLoad(() => {
      const filtered = bookstoreEvents.filter((item) => {
        const matchesQuery =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query) ||
          (item.desc && item.desc.toLowerCase().includes(query));

        const matchesCategory =
          selectedCategory === "ALL" ||
          item.genre.toLowerCase() === selectedCategory.toLowerCase();

        return matchesQuery && matchesCategory;
      });

      renderEvents(filtered);
    });
  }

  /**
   * Remove Event Handler
   */
  function handleRemoveEvent(e) {
    const eventId = parseInt(e.currentTarget.dataset.id, 10);
    const targetEvent = bookstoreEvents.find((ev) => ev.id === eventId);
    const title = targetEvent ? targetEvent.title : "Unknown";

    bookstoreEvents = bookstoreEvents.filter((ev) => ev.id !== eventId);
    persistEvents();

    sendTelemetry("EVENT_REMOVED", { id: eventId, title });
    executeSearchAndFilter();
  }

  /**
   * Form Validation & Error State Helpers
   * Satisfies Edge Case: Invalid inputs highlighted in red with descriptive messages
   */
  function clearValidationErrors() {
    const inputs = createEventForm.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.classList.remove("input-invalid");
      const errorMsg = document.getElementById(`${input.name}-error`);
      if (errorMsg) {
        errorMsg.textContent = "";
      }
    });
  }

  function setFieldError(inputEl, errorElId, message) {
    inputEl.classList.add("input-invalid");
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  // Clear single field validation state on user input
  [titleInput, authorInput, dateInput, genreInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.classList.contains("input-invalid")) {
        input.classList.remove("input-invalid");
        const errorEl = document.getElementById(`${input.name}-error`);
        if (errorEl) errorEl.textContent = "";
      }
    });
  });

  /**
   * Form Toggle Behavior
   */
  function openForm() {
    eventFormSection.classList.remove("hidden");
    toggleFormBtn.setAttribute("aria-expanded", "true");
    titleInput.focus();
    sendTelemetry("FORM_OPENED");
  }

  function closeForm() {
    eventFormSection.classList.add("hidden");
    toggleFormBtn.setAttribute("aria-expanded", "false");
    createEventForm.reset();
    clearValidationErrors();
    toggleFormBtn.focus();
    sendTelemetry("FORM_CLOSED");
  }

  toggleFormBtn.addEventListener("click", () => {
    const isHidden = eventFormSection.classList.contains("hidden");
    if (isHidden) {
      openForm();
    } else {
      closeForm();
    }
  });

  cancelFormBtn.addEventListener("click", closeForm);

  // Close form on Escape key for keyboard accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !eventFormSection.classList.contains("hidden")) {
      closeForm();
    }
  });

  /**
   * Form Submission & Sanitization
   */
  createEventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearValidationErrors();

    let hasErrors = false;

    // Validate Title
    const rawTitle = titleInput.value.trim();
    if (!rawTitle) {
      setFieldError(titleInput, "title-error", "Event title is mandatory.");
      hasErrors = true;
    } else if (rawTitle.length < 3) {
      setFieldError(titleInput, "title-error", "Title must be at least 3 characters.");
      hasErrors = true;
    }

    // Validate Author
    const rawAuthor = authorInput.value.trim();
    if (!rawAuthor) {
      setFieldError(authorInput, "author-error", "Author or speaker name is required.");
      hasErrors = true;
    }

    // Validate Date
    const rawDate = dateInput.value;
    if (!rawDate) {
      setFieldError(dateInput, "date-error", "Please select a valid event date.");
      hasErrors = true;
    }

    // Validate Category
    const rawGenre = genreInput.value;
    if (!rawGenre) {
      setFieldError(genreInput, "genre-error", "Please select a category.");
      hasErrors = true;
    }

    if (hasErrors) {
      sendTelemetry("FORM_VALIDATION_FAILED", {
        hasTitle: !!rawTitle,
        hasAuthor: !!rawAuthor,
        hasDate: !!rawDate,
        hasGenre: !!rawGenre
      });
      // Focus the first invalid element
      const firstInvalid = createEventForm.querySelector(".input-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Sanitize values
    const newEvent = {
      id: Date.now(),
      title: sanitizeString(rawTitle),
      author: sanitizeString(rawAuthor),
      date: sanitizeString(rawDate),
      genre: sanitizeString(rawGenre),
      desc: sanitizeString(descInput.value.trim())
    };

    // Prepend to list
    bookstoreEvents.unshift(newEvent);
    persistEvents();

    sendTelemetry("EVENT_CREATED", {
      id: newEvent.id,
      title: newEvent.title,
      genre: newEvent.genre
    });

    // Reset & close form
    createEventForm.reset();
    eventFormSection.classList.add("hidden");
    toggleFormBtn.setAttribute("aria-expanded", "false");

    // Refresh view
    executeSearchAndFilter();
  });

  // Search trigger bindings
  searchBtn.addEventListener("click", executeSearchAndFilter);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      executeSearchAndFilter();
    }
  });
  categoryFilter.addEventListener("change", executeSearchAndFilter);

  // Reset search button (Empty state action)
  resetSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "ALL";
    executeSearchAndFilter();
  });

  /**
   * Initial Application Hydration
   */
  simulateAsyncLoad(() => {
    renderEvents(bookstoreEvents);
    sendTelemetry("PORTAL_INITIALIZED", { totalEvents: bookstoreEvents.length });
  }, 400);

})();
