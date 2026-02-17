
(function () {
  /* ── Filter Panel Toggle ── */
  const filterToggle  = document.getElementById('filterToggle');
  const filterPanel   = document.getElementById('filterPanel');
  const filterClose   = document.getElementById('filterClose');
  const filterOverlay = document.getElementById('filterOverlay');

  function openFilter() {
    filterPanel.classList.add('is-open');
    filterOverlay.classList.add('is-open');
    filterToggle.setAttribute('aria-expanded', 'true');
    filterPanel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeFilter() {
    filterPanel.classList.remove('is-open');
    filterOverlay.classList.remove('is-open');
    filterToggle.setAttribute('aria-expanded', 'false');
    filterPanel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  filterToggle?.addEventListener('click', openFilter);
  filterClose?.addEventListener('click', closeFilter);
  filterOverlay?.addEventListener('click', closeFilter);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFilter(); });

  /* ── Filter Group Accordion ── */
  document.querySelectorAll('.filter-group__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const body = btn.nextElementSibling;
      if (body) {
        body.style.display = expanded ? 'none' : '';
      }
    });
  });

  /* ── Intersection Observer: fade-in cards ── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => {
      card.style.animationPlayState = 'paused';
      observer.observe(card);
    });
  }
})();