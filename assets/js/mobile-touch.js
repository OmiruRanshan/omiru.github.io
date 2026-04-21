(() => {
  // Touch helpers: enable tap-to-toggle tooltips on skill cards and dismiss on outside tap
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  const cards = Array.from(document.querySelectorAll('.skill-card'));
  if (!cards.length) return;

  // Always add accessible labels so tool names are available for mouse + keyboard too.
  cards.forEach((card) => {
    const tooltip = card.querySelector('.tooltip');
    const label = tooltip?.textContent?.trim();

    if (label) {
      card.setAttribute('aria-label', label);
      card.setAttribute('title', label);
    }

    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
  });

  if (!isTouch) return;

  document.documentElement.classList.add('is-touch');

  const clearAll = () => cards.forEach((card) => card.classList.remove('touched'));

  cards.forEach((card) => {
    let startX = 0;
    let startY = 0;
    let moved = false;

    card.addEventListener('touchstart', (event) => {
      const touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      moved = false;
    }, { passive: true });

    card.addEventListener('touchmove', (event) => {
      const touch = event.changedTouches[0];
      const dx = Math.abs(touch.clientX - startX);
      const dy = Math.abs(touch.clientY - startY);

      if (dx > 8 || dy > 8) {
        moved = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', (event) => {
      if (moved) return;

      event.preventDefault();
      const isActive = card.classList.contains('touched');
      clearAll();

      if (!isActive) {
        card.classList.add('touched');
      }
    }, { passive: false });

    // Fallback for hybrid devices where click fires but touchend is inconsistent.
    card.addEventListener('click', (event) => {
      if (!event.pointerType || event.pointerType === 'mouse') return;

      event.preventDefault();
      const isActive = card.classList.contains('touched');
      clearAll();

      if (!isActive) {
        card.classList.add('touched');
      }
    });
  });

  // Dismiss on outside tap/click
  document.addEventListener('touchstart', (event) => {
    if (!event.target.closest('.skill-card')) {
      clearAll();
    }
  }, { passive: true });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.skill-card')) {
      clearAll();
    }
  });
})();