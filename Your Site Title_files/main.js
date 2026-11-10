/* ═══════════════════════════════════════════════════
   INTEGRATED PROPERTY SOLUTIONS — main.js
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── Sticky header ── */
const header = document.querySelector('.site-header');

function updateHeader() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* ── 3D Scroll hint — fades & shrinks as user scrolls, bounces back at top ── */
const scrollHint = document.getElementById('scrollHint');

function updateScrollHint() {
  if (!scrollHint) return;
  const y       = window.scrollY;
  const heroH   = document.querySelector('.hero')?.offsetHeight || window.innerHeight;
  const prog    = Math.min(y / (heroH * 0.4), 1);          // fully gone at 40% of hero height
  const opacity = 1 - prog;
  const scale   = 1 - prog * 0.25;
  const translateY = prog * 20;

  scrollHint.style.opacity   = opacity;
  scrollHint.style.transform = `scale(${scale}) translateY(${translateY}px)`;
  scrollHint.style.pointerEvents = prog > 0.9 ? 'none' : 'auto';
}

window.addEventListener('scroll', updateScrollHint, { passive: true });
updateScrollHint();


/* ── Mobile nav toggle ── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));

    // Animate hamburger → X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ── Scroll-reveal ── */
function addRevealClasses() {
  const targets = [
    { selector: '.trust-list li',     base: 'reveal' },
    { selector: '.about-visual',      base: 'reveal' },
    { selector: '.about-text',        base: 'reveal reveal-delay-2' },
    { selector: '.service-card',      base: 'reveal' },
    { selector: '.step',              base: 'reveal' },
    { selector: '.approach-card',     base: 'reveal reveal-delay-2' },
    { selector: '.contact-info',      base: 'reveal' },
    { selector: '.contact-form',      base: 'reveal reveal-delay-2' },
    { selector: '.section-header',    base: 'reveal' },
  ];

  targets.forEach(({ selector, base }) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      base.split(' ').forEach(cls => el.classList.add(cls));
      // Stagger siblings
      if (selector === '.service-card' || selector === '.trust-list li' || selector === '.step') {
        el.style.transitionDelay = `${i * 0.1}s`;
      }
    });
  });
}

function observeReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

addRevealClasses();
observeReveal();


/* ── Contact form ── */
const form = document.querySelector('.contact-form');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e05252';
        valid = false;
      }
    });

    if (!valid) {
      btn.textContent = 'Please fill in all required fields';
      setTimeout(() => { btn.textContent = originalText; }, 2500);
      return;
    }

    // Simulate submission
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Message Sent — We\'ll be in touch soon';
      btn.style.background = '#1a7a8a';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1400);
  });
}


/* ── Smooth active nav highlight ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = '#fff';
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));
