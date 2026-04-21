'use strict';

// Add event listener on multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}

// Theme toggle
const themeToggleBtn = document.querySelector('[data-theme-toggle]');
const htmlEl = document.documentElement;
const themeStorageKey = 'theme';

const getPreferredTheme = function () {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const readStoredTheme = function () {
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch (error) {
    return null;
  }
}

const applyTheme = function (theme, persist = false) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', nextTheme);
  htmlEl.style.colorScheme = nextTheme;

  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', nextTheme === 'light' ? 'true' : 'false');
  }

  if (persist) {
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      // Ignore storage failures in restricted browsing modes.
    }
  }
}

if (themeToggleBtn) {
  const savedTheme = readStoredTheme();
  const initialTheme = savedTheme || getPreferredTheme();
  applyTheme(initialTheme);

  const toggleTheme = () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  };
  themeToggleBtn.addEventListener('click', toggleTheme);

  if (!savedTheme) {
    const themeMedia = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = () => applyTheme(getPreferredTheme());

    if (typeof themeMedia.addEventListener === 'function') {
      themeMedia.addEventListener('change', handleSystemThemeChange);
    } else if (typeof themeMedia.addListener === 'function') {
      themeMedia.addListener(handleSystemThemeChange);
    }
  }
}

// PRELOADING
const loadingElement = document.querySelector("[data-loading]");
if (loadingElement) {
  window.addEventListener("load", function () {
    loadingElement.classList.add("loaded");
    document.body.classList.remove("active");
  });
}

// MOBILE NAV TOGGLE
const [navTogglers, navLinks, navbar, overlay] = [
  document.querySelectorAll("[data-nav-toggler]"),
  document.querySelectorAll("[data-nav-link]"),
  document.querySelector("[data-navbar]"),
  document.querySelector("[data-overlay]")
];

if (navbar) {
  const toggleNav = function () {
    navbar.classList.toggle("active");
    if (overlay) overlay.classList.toggle("active"); // guard overlay
    document.body.classList.toggle("active");
  }
  addEventOnElements(navTogglers, "click", toggleNav);

  const closeNav = function () {
    navbar.classList.remove("active");
    if (overlay) overlay.classList.remove("active"); // guard overlay
    document.body.classList.remove("active");
  }
  addEventOnElements(navLinks, "click", closeNav);
}

// HEADER
const header = document.querySelector("[data-header]");
if (header) {
  const activeElementOnScroll = function () {
    if (window.scrollY > 50) {
      header.classList.add("active");
    } else {
      header.classList.remove("active");
    }
  }
  window.addEventListener("scroll", activeElementOnScroll, { passive: true });
  activeElementOnScroll();
}

// TEXT ANIMATION EFFECT FOR HERO SECTION
// Make animation robust to empty items
const letterBoxesAll = document.querySelectorAll("[data-letter-effect]");
const letterBoxes = Array.from(letterBoxesAll).filter(el => el.textContent.trim().length > 0);

if (letterBoxes.length > 0) {
  let activeLetterBoxIndex = 0;
  let lastActiveLetterBoxIndex = 0;
  let totalLetterBoxDelay = 0;

  const setLetterEffect = function () {
    for (let i = 0; i < letterBoxes.length; i++) {
      let letterAnimationDelay = 0;
      const letters = letterBoxes[i].textContent.trim();
      letterBoxes[i].textContent = "";

      for (let j = 0; j < letters.length; j++) {
        const span = document.createElement("span");
        span.style.animationDelay = `${letterAnimationDelay}s`;
        span.classList.add(i === activeLetterBoxIndex ? "in" : "out");
        span.textContent = letters[j];
        if (letters[j] === " ") span.classList.add("space");
        letterBoxes[i].appendChild(span);
        if (j < letters.length - 1) {
          letterAnimationDelay += 0.05;
        }
      }

      if (i === activeLetterBoxIndex) {
        totalLetterBoxDelay = Number(letterAnimationDelay.toFixed(2));
      }

      letterBoxes[i].classList.toggle("active", i === lastActiveLetterBoxIndex);
    }

    setTimeout(function () {
      lastActiveLetterBoxIndex = activeLetterBoxIndex;
      activeLetterBoxIndex = (activeLetterBoxIndex + 1) % letterBoxes.length;
      setLetterEffect();
    }, (totalLetterBoxDelay * 1000) + 3000);
  };

  window.addEventListener("load", setLetterEffect);
}

// BACK TO TOP BUTTON
const backTopBtn = document.querySelector("[data-back-top-btn]");
if (backTopBtn) {
  const onScrollBackTop = function () {
    const bodyHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollEndPos = Math.max(1, bodyHeight - windowHeight); // avoid divide-by-zero
    let totalScrollPercent = (window.scrollY / scrollEndPos) * 100;
    totalScrollPercent = Math.min(100, Math.max(0, totalScrollPercent)); // clamp 0-100

    backTopBtn.textContent = `${totalScrollPercent.toFixed(0)}%`;

    if (totalScrollPercent > 5) {
      backTopBtn.classList.add("show");
    } else {
      backTopBtn.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScrollBackTop, { passive: true });
  onScrollBackTop();
}

// SCROLL REVEAL
const revealElements = document.querySelectorAll("[data-reveal]");
if (revealElements.length > 0) {
  const scrollReveal = function () {
    for (let i = 0; i < revealElements.length; i++) {
      const elementIsInScreen = revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15;
      if (elementIsInScreen) {
        revealElements[i].classList.add("revealed");
      } else {
        revealElements[i].classList.remove("revealed");
      }
    }
  }
  window.addEventListener("scroll", scrollReveal, { passive: true });
  scrollReveal();
}

// CUSTOM CURSOR
const cursor = document.querySelector("[data-cursor]");
if (cursor) {
  const anchorElements = document.querySelectorAll("a");
  const buttons = document.querySelectorAll("button");

  document.body.addEventListener("mousemove", function (event) {
    setTimeout(function () {
      cursor.style.top = `${event.clientY}px`;
      cursor.style.left = `${event.clientX}px`;
    }, 100);
  }, { passive: true });

  const hoverActive = () => cursor.classList.add("hovered");
  const hoverDeactive = () => cursor.classList.remove("hovered");

  addEventOnElements(anchorElements, "mouseover", hoverActive);
  addEventOnElements(anchorElements, "mouseout", hoverDeactive);
  addEventOnElements(buttons, "mouseover", hoverActive);
  addEventOnElements(buttons, "mouseout", hoverDeactive);

  // Disable/enable only when window focus changes to avoid flicker
  window.addEventListener("blur", () => cursor.classList.add("disabled"));
  window.addEventListener("focus", () => cursor.classList.remove("disabled"));
}

// SKILLS & EDUCATION SECTIONS TOGGLE
const initializeToggleSection = (section, options = {}) => {
  const toggleBox = section.querySelector('[data-toggle-box]');
  if (!toggleBox) { return; }

  const toggleBtns = Array.from(toggleBox.querySelectorAll('[data-toggle-btn]'));
  if (!toggleBtns.length) { return; }

  const {
    defaultIndex = 0,
    onToggle,
    toggleContainerActiveClass = null,
    toggleContainerActiveIndex = 1
  } = options;

  const setActiveState = (activeIndex) => {
    toggleBtns.forEach((btn, index) => {
      const isActive = index === activeIndex;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (toggleContainerActiveClass) {
      toggleBox.classList.toggle(toggleContainerActiveClass, activeIndex === toggleContainerActiveIndex);
    }

    if (typeof onToggle === 'function') {
      onToggle(activeIndex);
    }
  };

  toggleBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => setActiveState(index));
    btn.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActiveState(index);
      }
    });
  });

  setActiveState(defaultIndex);
};

// Initialize Skills Section
const skillsSection = document.querySelector('#skills');
if (skillsSection) {
  const skillsBox = skillsSection.querySelector('[data-skills-box]');
  const skillsList = skillsBox?.querySelector('.skills-list');
  const toolsList = skillsBox?.querySelector('.tools-list');

  initializeToggleSection(skillsSection, {
    defaultIndex: 0,
    toggleContainerActiveClass: 'active',
    toggleContainerActiveIndex: 1,
    onToggle: (activeIndex) => {
      const showTools = activeIndex === 1;

      if (skillsBox) {
        skillsBox.classList.toggle('active', showTools);
      }

      if (skillsList) {
        skillsList.setAttribute('aria-hidden', showTools ? 'true' : 'false');
      }

      if (toolsList) {
        toolsList.setAttribute('aria-hidden', showTools ? 'false' : 'true');
      }
    }
  });
}

// Initialize Education Section
const educationSection = document.querySelector('#education');
if (educationSection) {
  const qualificationList = educationSection.querySelector('.qualification-list');
  const certificationList = educationSection.querySelector('.certification-list');
  const loadMoreBtn = educationSection.querySelector('[data-load-more-certs]');

  initializeToggleSection(educationSection, {
    defaultIndex: 0,
    onToggle: (activeIndex) => {
      const showCerts = activeIndex === 1;

      if (qualificationList) {
        qualificationList.classList.toggle('active', !showCerts);
        qualificationList.setAttribute('aria-hidden', showCerts ? 'true' : 'false');
      }

      if (certificationList) {
        certificationList.classList.toggle('active', showCerts);
        certificationList.setAttribute('aria-hidden', showCerts ? 'false' : 'true');
      }

      if (loadMoreBtn) {
        loadMoreBtn.style.display = showCerts ? 'inline-flex' : 'none';
      }
    }
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      educationSection
        .querySelectorAll('.certification-list .hidden-cert')
        .forEach((item) => item.classList.remove('hidden-cert'));
      loadMoreBtn.style.display = 'none';
    });
  }
}

// SOCIAL ICON LABEL ON TOUCH: first tap shows label, second tap opens link
document.addEventListener('DOMContentLoaded', () => {
  const socialLinks = document.querySelectorAll('.social-list .social-link');
  socialLinks.forEach((a) => {
    let armed = false;
    a.addEventListener('touchend', (e) => {
      // if not armed, show label and block navigation once
      if (!armed) {
        armed = true;
        a.classList.add('show-label');
        e.preventDefault();
        setTimeout(() => {
          armed = false;
          a.classList.remove('show-label');
        }, 1500);
      }
    }, { passive: false });
  });
});

// NEWS & EVENTS: Load more (2 at a time)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-load-more-projects]');
  if (!btn) return;

  const list = btn.closest('.project-list');
  if (!list) return;

  const getHidden = () => Array.from(list.querySelectorAll('li.is-hidden'));

  // Show the button only if there are hidden items
  if (getHidden().length === 0) {
    btn.textContent = 'All loaded';
    btn.disabled = true;
  }

  btn.addEventListener('click', () => {
    const toShow = getHidden().slice(0, 2);
    toShow.forEach(li => li.classList.remove('is-hidden'));

    const left = getHidden().length;
    if (left === 0) {
      btn.textContent = 'All loaded';
      btn.disabled = true;
    }
  });
});

// Prevent dummy settings link from jumping to top
const toolsBtnLink = document.querySelector('.tools-btn[href="#"]');
if (toolsBtnLink) {
  toolsBtnLink.addEventListener('click', (e) => e.preventDefault());
}

// Full-body binary rain background (Matrix-style)
(() => {
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.className = 'binary-rain-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let fontSize = 18;
  let columns = 0;
  let drops = [];
  let speeds = [];
  let frameId = 0;
  let lastTick = 0;

  const FPS = 26; // intentionally slow to match requested rain style
  const FRAME_MS = 1000 / FPS;

  const setupCanvas = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = window.innerWidth;
    height = Math.max(window.innerHeight, document.documentElement.clientHeight);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = width < 575 ? 12 : width < 992 ? 14 : 16;
    columns = Math.max(1, Math.floor(width / fontSize));

    drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
    speeds = Array.from({ length: columns }, () => 0.45 + Math.random() * 0.35);
  };

  const getCssVar = (name, fallback) => {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  };

  const draw = (time) => {
    if (time - lastTick < FRAME_MS) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    lastTick = time;

    const trail = getCssVar('--binary-rain-trail', 'rgba(2, 12, 8, 0.18)');
    const bright = getCssVar('--binary-rain-char-bright', 'rgba(96, 255, 154, 0.9)');
    const dim = getCssVar('--binary-rain-char-dim', 'rgba(62, 255, 126, 0.6)');

    ctx.fillStyle = trail;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `500 ${fontSize}px ${getCssVar('--ff-gordita', 'monospace')}`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < columns; i++) {
      const value = Math.random() > 0.5 ? '1' : '0';
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillStyle = Math.random() > 0.14 ? bright : dim;
      ctx.fillText(value, x, y);

      drops[i] += speeds[i];
      if (y > height + Math.random() * 220) {
        drops[i] = -Math.random() * 24;
        speeds[i] = 0.45 + Math.random() * 0.35;
      }
    }

    frameId = requestAnimationFrame(draw);
  };

  const start = () => {
    if (!document.body.contains(canvas)) {
      document.body.prepend(canvas);
    }
    setupCanvas();
    if (frameId) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(draw);
  };

  const stop = () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  window.addEventListener('resize', setupCanvas, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      lastTick = 0;
      frameId = requestAnimationFrame(draw);
    }
  });

  // Keep colors synced when theme switches.
  const observer = new MutationObserver(() => {
    // no-op: colors are read from CSS each frame; forcing a clear avoids ghosting
    ctx.clearRect(0, 0, width, height);
  });

  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
