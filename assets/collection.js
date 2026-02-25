(function () {
  'use strict';

  /* ── Selectors ── */
  const filterToggle  = document.getElementById('js-filter-toggle');
  const filterSidebar = document.getElementById('js-filter-sidebar');
  const filterClose   = document.getElementById('js-filter-close');
  const filterOverlay = document.getElementById('js-filter-overlay');
  const filterBadge   = document.getElementById('js-filter-badge');
  const sortSelect    = document.getElementById('js-sort-select');
  const sortHidden    = document.getElementById('js-sort-hidden');
  const filterForm    = document.getElementById('js-filter-form');
  const productGrid   = document.getElementById('js-product-grid');

  const isMobile = () => window.innerWidth <= 768;

  /* ═══════════════════════════════════════════
     1. SIDEBAR OPEN / CLOSE
  ═══════════════════════════════════════════ */
  let sidebarOpen = !filterSidebar.classList.contains('is-collapsed');

  function openSidebar() {
    if (isMobile()) {
      filterSidebar.classList.add('is-open-mobile');
      filterOverlay.classList.add('is-open');
      filterOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      filterSidebar.classList.remove('is-collapsed');
    }
    filterToggle.setAttribute('aria-expanded', 'true');
    filterToggle.classList.add('is-active');
    sidebarOpen = true;
  }

  function closeSidebar() {
    if (isMobile()) {
      filterSidebar.classList.remove('is-open-mobile');
      filterOverlay.classList.remove('is-open');
      filterOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    } else {
      filterSidebar.classList.add('is-collapsed');
    }
    filterToggle.setAttribute('aria-expanded', 'false');
    filterToggle.classList.remove('is-active');
    sidebarOpen = false;
  }

  function toggleSidebar() { sidebarOpen ? closeSidebar() : openSidebar(); }

  filterToggle?.addEventListener('click', toggleSidebar);
  filterClose?.addEventListener('click', closeSidebar);
  filterOverlay?.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && sidebarOpen) closeSidebar(); });

  /* ═══════════════════════════════════════════
     2. FILTER GROUP ACCORDION
  ═══════════════════════════════════════════ */
  document.querySelectorAll('[data-filter-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const bodyId   = btn.getAttribute('aria-controls');
      const body     = document.getElementById(bodyId);

      btn.setAttribute('aria-expanded', String(!expanded));
      body?.classList.toggle('is-open', !expanded);
    });
  });

  /* ═══════════════════════════════════════════
     3. CHECKBOX VISUAL SYNC
     (Keep .is-checked class in sync with native
      checkbox so CSS transitions fire properly)
  ═══════════════════════════════════════════ */
  document.querySelectorAll('[data-filter-input]').forEach(input => {
    input.addEventListener('change', () => {
      const label = input.closest('[data-filter-check]');
      label?.classList.toggle('is-checked', input.checked);
      updateGroupBadge(input);
    });
  });

  function updateGroupBadge(input) {
    const group   = input.closest('.filter-group');
    const badge   = group?.querySelector('[data-badge]');
    if (!badge) return;
    const checked = group.querySelectorAll('[data-filter-input]:checked').length;
    badge.textContent = checked;
    badge.classList.toggle('is-visible', checked > 0);
  }

  /* ═══════════════════════════════════════════
     4. SHOW MORE / LESS VALUES
  ═══════════════════════════════════════════ */
  document.querySelectorAll('[data-showmore]').forEach(btn => {
    btn.addEventListener('click', () => {
      const list     = btn.previousElementSibling;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const hidden   = list.querySelectorAll('.filter-list__item--hidden');
      const label    = btn.querySelector('[data-showmore-label]');

      hidden.forEach(item => {
        item.style.display = expanded ? '' : 'flex';
      });

      btn.setAttribute('aria-expanded', String(!expanded));

      if (expanded) {
        label.textContent = 'Show ' + hidden.length + ' more';
        btn.querySelector('path').setAttribute('d', 'M5 1v8M1 5h8');
      } else {
        label.textContent = 'Show less';
        btn.querySelector('path').setAttribute('d', 'M1 5h8');
      }
    });
  });

  /* ═══════════════════════════════════════════
     5. SORT SELECT — preserve filters in URL
     Strategy: update sort_by hidden input then
     submit the filter form. This keeps all active
     filter params intact while changing sort.
  ═══════════════════════════════════════════ */
  sortSelect?.addEventListener('change', () => {
    if (sortHidden) sortHidden.value = sortSelect.value;

    if (filterForm) {
      // Submit form so filters are preserved
      filterForm.submit();
    } else {
      // Fallback: update URL param only
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortSelect.value);
      window.location.href = url.toString();
    }
  });

  /* ═══════════════════════════════════════════
     6. PRICE RANGE — prevent empty submission
  ═══════════════════════════════════════════ */
  filterForm?.addEventListener('submit', e => {
    const minInput = filterForm.querySelector('#filter-price-min');
    const maxInput = filterForm.querySelector('#filter-price-max');

    if (minInput && !minInput.value) minInput.removeAttribute('name');
    if (maxInput && !maxInput.value) maxInput.removeAttribute('name');
  });

  /* ═══════════════════════════════════════════
     7. GRID COLUMN TOGGLE
  ═══════════════════════════════════════════ */
  document.querySelectorAll('[data-cols]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cols = btn.dataset.cols;
      document.querySelectorAll('[data-cols]').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (productGrid) {
        productGrid.className = 'col-grid cols-' + cols;
      }
    });
  });

  /* ═══════════════════════════════════════════
     8. CARD SCROLL FADE-IN (IntersectionObserver)
  ═══════════════════════════════════════════ */
  if ('IntersectionObserver' in window && productGrid) {
    const cards = productGrid.querySelectorAll('.product-card, [class*="card"]');
    if (cards.length) {
      cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = `opacity 0.4s ${i * 0.05}s var(--ease), transform 0.4s ${i * 0.05}s var(--ease)`;
      });

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      cards.forEach(card => observer.observe(card));
    }
  }

  /* ═══════════════════════════════════════════
     9. RESPONSIVE: reset sidebar state on resize
  ═══════════════════════════════════════════ */
  let lastMobile = isMobile();
  window.addEventListener('resize', () => {
    const nowMobile = isMobile();
    if (nowMobile !== lastMobile) {
      filterSidebar.classList.remove('is-open-mobile', 'is-collapsed');
      filterOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
      sidebarOpen = true;
      filterToggle.setAttribute('aria-expanded', 'true');
      filterToggle.classList.add('is-active');
      lastMobile = nowMobile;
    }
  });

})();