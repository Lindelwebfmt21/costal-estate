/* ═══════════════════════════════════════════════════
   INTEGRATED PROPERTY SOLUTIONS — main.js
   ═══════════════════════════════════════════════════ */

"use strict";

const header = document.querySelector(".site-header");
const scrollProgress = document.getElementById("scrollProgress");
const depthFog = document.getElementById("depthFog");
const scrollHint = document.getElementById("scrollHint");
const hero = document.querySelector(".hero");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

function closeNav() {
  if (!navToggle || !navLinks) return;
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
}

function updateScrollChrome() {
  const y = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docH > 0 ? Math.min(Math.max(y / docH, 0), 1) : 0;

  if (header) {
    header.classList.toggle("scrolled", y > 60);
  }

  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  if (depthFog && !reduceMotion) {
    depthFog.style.opacity = String(Math.min(progress * 0.5, 0.4));
  }

  if (scrollHint && hero) {
    const fade = Math.min(y / (hero.offsetHeight * 0.4), 1);
    scrollHint.style.opacity = String(1 - fade);
    if (!reduceMotion) {
      scrollHint.style.transform = `scale(${1 - fade * 0.25}) translateY(${fade * 20}px)`;
    }
    scrollHint.style.pointerEvents = fade > 0.9 ? "none" : "auto";
  }
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateScrollChrome();
      ticking = false;
    });
  },
  { passive: true },
);
updateScrollChrome();

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (event) => {
    if (header && !header.contains(event.target)) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

function addRevealClasses() {
  const targets = [
    { selector: ".trust-list li", base: "reveal" },
    { selector: ".about-visual", base: "reveal" },
    { selector: ".about-text", base: "reveal reveal-delay-2" },
    { selector: ".service-card", base: "reveal" },
    { selector: ".step", base: "reveal" },
    { selector: ".approach-card", base: "reveal reveal-delay-2" },
    { selector: ".contact-info", base: "reveal" },
    { selector: ".contact-form", base: "reveal reveal-delay-2" },
    { selector: ".section-header", base: "reveal" },
  ];

  targets.forEach(({ selector, base }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      base.split(" ").forEach((cls) => el.classList.add(cls));
      if (
        selector === ".service-card" ||
        selector === ".trust-list li" ||
        selector === ".step"
      ) {
        el.style.transitionDelay = `${i * 0.1}s`;
      }
    });
  });
}

function observeReveal() {
  if (reduceMotion) {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

addRevealClasses();
observeReveal();

const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    const required = form.querySelectorAll("[required]");
    let valid = true;

    required.forEach((field) => {
      field.classList.remove("is-invalid");
      const empty = !field.value.trim();
      const badEmail =
        field.type === "email" && !isValidEmail(field.value.trim());
      if (empty || badEmail) {
        field.classList.add("is-invalid");
        valid = false;
      }
    });

    if (!valid) {
      if (formStatus)
        formStatus.textContent = "Please complete all required fields.";
      btn.textContent = "Please fill in all required fields";
      window.setTimeout(() => {
        btn.textContent = originalText;
      }, 2500);
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim() || "General Inquiry";
    const message = form.message.value.trim();
    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");

    btn.textContent = "Opening email…";
    btn.disabled = true;
    if (formStatus)
      formStatus.textContent = "Your email app will open with this message.";

    window.location.href = `mailto:sales@coastalpropminder.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1800);
  });
}

const sections = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navAnchors.forEach((anchor) => {
        const active = anchor.getAttribute("href") === `#${id}`;
        anchor.classList.toggle("is-active", active);
      });
    });
  },
  { threshold: 0.4 },
);

sections.forEach((section) => sectionObserver.observe(section));
