/*
  ==========================
  Cybersecurity Portfolio JS
  ==========================
  - Mobile menu toggle + close on navigation
  - Theme toggle (saved in localStorage)
  - Scroll reveal animations (IntersectionObserver)
  - Scrollspy active nav links (IntersectionObserver)
  - Skill bars animate on view
  - Counters in hero stats
  - FAQ accordion
  - Testimonials slider
  - Contact form validation + friendly errors
*/

(function () {
  "use strict";

  // Helpers
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  // Elements
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  const navLinks = $$(".nav-link");
  const themeToggle = $("#themeToggle");
  const yearEl = $("#year");
  const toTop = $("#toTop");

  // Footer year
  yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------
  // Theme (dark/light)
  // ---------------------------
  const THEME_KEY = "portfolio_theme";

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    // Default: dark (cyber look)
    setTheme("dark");
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });

  initTheme();

  // ---------------------------
  // Mobile menu
  // ---------------------------
  function openMenu() {
    navMenu.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    // Animate hamburger into X
    $(".hamburger").style.background = "transparent";
    $(".hamburger").style.setProperty("--x", "1");
    $(".hamburger").classList.add("x");
  }

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    $(".hamburger").style.background = "";
    $(".hamburger").classList.remove("x");
  }

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });

  // Close menu when clicking a link (mobile UX)
  navLinks.forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (!navMenu.classList.contains("open")) return;
    const isInside = navMenu.contains(e.target) || navToggle.contains(e.target);
    if (!isInside) closeMenu();
  });

  // ---------------------------
  // Back to top
  // ---------------------------
  function updateToTop() {
    if (window.scrollY > 600) toTop.classList.add("show");
    else toTop.classList.remove("show");
  }
  updateToTop();
  window.addEventListener("scroll", updateToTop, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------------------------
  // Scroll reveal (IntersectionObserver)
  // ---------------------------
  const revealEls = $$(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // ---------------------------
  // Scrollspy (active nav link)
  // ---------------------------
  const sectionIds = navLinks.map((a) => a.getAttribute("href")).filter(Boolean);
  const sections = sectionIds.map((id) => $(id)).filter(Boolean);

  const spyObserver = new IntersectionObserver(
    (entries) => {
      // Pick the most visible intersecting section
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const activeId = "#" + visible.target.id;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === activeId));
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: [0.08, 0.12, 0.2, 0.35] }
  );

  sections.forEach((sec) => spyObserver.observe(sec));

  // ---------------------------
  // Skill bars animate on view
  // ---------------------------
  const bars = $$(".bar-fill");
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const level = Number(e.target.dataset.level || 0);
        e.target.style.width = `${Math.max(0, Math.min(100, level))}%`;
        barObserver.unobserve(e.target);
      });
    },
    { threshold: 0.3 }
  );
  bars.forEach((b) => barObserver.observe(b));

  // ---------------------------
  // Counters (hero mini stats)
  // ---------------------------
  const counters = $$(".stat-num");
  let countersStarted = false;

  function animateCounter(el, to) {
    const duration = 900;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic-ish
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((e) => e.isIntersecting);
      if (!visible || countersStarted) return;
      countersStarted = true;
      counters.forEach((el) => animateCounter(el, Number(el.dataset.counter || 0)));
      counterObserver.disconnect();
    },
    { threshold: 0.25 }
  );

  // Observe the hero card to trigger counters
  const heroCard = $(".hero-card");
  if (heroCard) counterObserver.observe(heroCard);

  // ---------------------------
  // FAQ accordion
  // ---------------------------
  const faqButtons = $$(".faq-q");
  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // Close all
      faqButtons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const p = b.nextElementSibling;
        if (p) p.hidden = true;
      });

      // Open selected if it was closed
      if (!expanded && panel) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  // ---------------------------
  // Testimonials (simple slider)
  // ---------------------------
  const testimonials = [
  {
    quote: "“Demonstrated exceptional leadership guiding team 'ShadowArmy' to the Top 9 out of 52 teams. Cleared 5 rigorous rounds including HOD assessment with a functional MVP under intense time pressure.”",
    who: "— Vedic Vision Evaluation Panel, SRKR Engineering College",
  },
  {
    quote: "“A consistent topper and district-level science competitor. He balances academic excellence with sports championships, making him a true all-rounder and a favorite student among faculty.”",
    who: "— School Faculty & District Science Committee",
  },
  {
    quote: "“One of the most energetic and enthusiastic individuals. His ability to connect with peers and his positive attitude make him a natural leader in any community.”",
    who: "— Physical Training Instructor & Peers",
  },
];

  let tIndex = 0;
  const quoteText = $("#quoteText");
  const quoteWho = $("#quoteWho");
  const prevBtn = $("#prevTestimonial");
  const nextBtn = $("#nextTestimonial");

  function renderTestimonial() {
    const t = testimonials[tIndex];
    quoteText.textContent = t.quote;
    quoteWho.textContent = t.who;
  }

  function nextTestimonial() {
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial();
  }

  function prevTestimonial() {
    tIndex = (tIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial();
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", prevTestimonial);
    nextBtn.addEventListener("click", nextTestimonial);
  }

  // Auto-rotate, pause on hover
  const testimonialBox = $("#testimonials");
  let tTimer = null;

  function startAuto() {
    stopAuto();
    tTimer = setInterval(nextTestimonial, 7000);
  }
  function stopAuto() {
    if (tTimer) clearInterval(tTimer);
    tTimer = null;
  }

  if (testimonialBox) {
    testimonialBox.addEventListener("mouseenter", stopAuto);
    testimonialBox.addEventListener("mouseleave", startAuto);
    startAuto();
  }

  // ---------------------------
  // Contact form validation (client-side)
  // ---------------------------
  const form = $("#contactForm");
  const status = $("#formStatus");

  function setError(fieldId, msg) {
    const el = $(`[data-for="${fieldId}"]`);
    if (el) el.textContent = msg || "";
  }

  function clearErrors() {
    ["name", "email", "message"].forEach((id) => setError(id, ""));
  }

  function validateField(input) {
    // Simple custom messages + HTML validity constraints
    if (input.validity.valid) {
      setError(input.id, "");
      return true;
    }

    if (input.validity.valueMissing) {
      setError(input.id, "This field is required.");
      return false;
    }
    if (input.validity.typeMismatch) {
      setError(input.id, "Please enter a valid email address.");
      return false;
    }
    if (input.validity.tooShort) {
      setError(input.id, `Please enter at least ${input.getAttribute("minlength")} characters.`);
      return false;
    }

    setError(input.id, "Please check this field.");
    return false;
  }

  if (form) {
    const inputs = $$("input, textarea", form);

    inputs.forEach((inp) => {
      inp.addEventListener("input", () => validateField(inp));
      inp.addEventListener("blur", () => validateField(inp));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors();
      status.textContent = "";

      let ok = true;
      inputs.forEach((inp) => {
        if (!validateField(inp)) ok = false;
      });

      // Use browser constraint validation (built-in API), then show a custom status message
      if (!ok) {
        status.textContent = "Please fix the highlighted fields and try again.";
        return;
      }

      // Demo success (no backend)
      status.textContent = "Message sent (demo). Add backend/email service to make it real.";
      form.reset();
    });
  }

  // ---------------------------
  // Hamburger -> X animation (CSS-less approach)
  // ---------------------------
  // Small enhancement: morph lines using pseudo-elements if present
  const burger = $(".hamburger");
  if (burger) {
    const style = document.createElement("style");
    style.textContent = `
      .hamburger.x::before{ top: 0 !important; transform: rotate(45deg) !important; }
      .hamburger.x::after{ top: 0 !important; transform: rotate(-45deg) !important; }
      .hamburger.x{ background: transparent !important; }
    `;
    document.head.appendChild(style);
  }
})();
