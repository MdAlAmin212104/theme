// Header Menu collapse and extends javascription code start
class HeaderMenu {
    constructor() {
        this.header = document.querySelector('[data-section-type="header"]');
        if (!this.header) return;

        this.menuToggle = this.header.querySelector('[data-menu-toggle]');
        this.menu = this.header.querySelector('[data-menu]');
        this.overlay = document.querySelector('[data-menu-overlay]');
        this.searchToggle = this.header.querySelector('[data-search-toggle]');
        this.searchMobile = this.header.querySelector('[data-search-mobile]');
        this.dropdownTriggers = this.header.querySelectorAll('[data-dropdown-trigger]');

        this.isMobile = window.innerWidth <= 768;

        this.init();
    }

    init() {
        // Menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMenu());
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMenu());
        }

        // Search toggle
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => this.toggleSearch());
        }

        // Dropdown triggers
        this.initDropdowns();

        // Window resize
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (this.isMobile !== wasMobile) {
                this.closeAllDropdowns();
                this.closeMenu();
                this.closeSearch();
                this.initDropdowns();
            }

            if (!this.isMobile) {
                this.closeMenu();
                this.closeSearch();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.isMobile && !e.target.closest('.header__nav-item')) {
                this.closeAllDropdowns();
            }
        });
    }

    initDropdowns() {
        this.dropdownTriggers.forEach((trigger) => {
            // Remove existing listeners
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);

            if (this.isMobile) {
                // Mobile: click to toggle
                newTrigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const parent = newTrigger.closest('.header__nav-item, .dropdown__item');
                    this.toggleDropdown(parent);
                });
            } else {
                // Desktop: hover
                const parent = newTrigger.closest('.header__nav-item, .dropdown__item');

                parent.addEventListener('mouseenter', () => {
                    this.openDropdown(parent);
                });

                parent.addEventListener('mouseleave', () => {
                    this.closeDropdown(parent);
                });

                // Also handle click for accessibility
                newTrigger.addEventListener('click', (e) => {
                    if (parent.classList.contains('is-active')) {
                        e.preventDefault();
                    }
                });
            }
        });

        // Update the triggers reference
        this.dropdownTriggers = this.header.querySelectorAll('[data-dropdown-trigger]');
    }

    toggleMenu() {
        const isActive = this.menu.classList.toggle('is-active');
        this.overlay.classList.toggle('is-active', isActive);
        this.menuToggle.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    closeMenu() {
        this.menu.classList.remove('is-active');
        this.overlay.classList.remove('is-active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        this.closeAllDropdowns();
    }

    toggleSearch() {
        const isActive = this.searchMobile.classList.toggle('is-active');
        if (isActive) {
            this.searchMobile.querySelector('input').focus();
        }
    }

    closeSearch() {
        if (this.searchMobile) {
            this.searchMobile.classList.remove('is-active');
        }
    }

    toggleDropdown(parent) {
        const isActive = parent.classList.contains('is-active');

        // Close siblings
        const siblings = Array.from(parent.parentElement.children).filter((el) => el !== parent);
        siblings.forEach((sibling) => this.closeDropdown(sibling));

        if (isActive) {
            this.closeDropdown(parent);
        } else {
            this.openDropdown(parent);
        }
    }

    openDropdown(parent) {
        parent.classList.add('is-active');
        const trigger = parent.querySelector('[data-dropdown-trigger]');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown(parent) {
        parent.classList.remove('is-active');
        const trigger = parent.querySelector('[data-dropdown-trigger]');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }

        // Close all child dropdowns
        const childDropdowns = parent.querySelectorAll('.dropdown__item.is-active');
        childDropdowns.forEach((child) => this.closeDropdown(child));
    }

    closeAllDropdowns() {
        const activeItems = this.header.querySelectorAll('.header__nav-item.is-active, .dropdown__item.is-active');
        activeItems.forEach((item) => this.closeDropdown(item));
    }
}


// Header Menu collapse and extends javascription code end



// Header Search suggestion code start

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new HeaderMenu());
} else {
  new HeaderMenu();
}

(() => {
  const forms = document.querySelectorAll('.header__search-form');
  if (!forms.length) return;

  forms.forEach((form) => {
    const input = form.querySelector('.header__search-input');
    const suggestionsBox = form.querySelector('.header__search-suggestions');

    if (!input || !suggestionsBox) return;

    let controller;
    let lastQuery = '';

    function renderSuggestions(products, query) {
      if (!products.length || !query.trim()) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.hidden = true;
        return;
      }

      suggestionsBox.innerHTML = products
        .map((product) => {
          const title = product.title;
          const url = product.url;

          const image =
            product.image ||
            (product.featured_image && product.featured_image.url) ||
            '';

          const price = product.price
            ? (product.price / 100).toLocaleString(undefined, {
                style: 'currency',
                currency: Shopify?.currency?.active || 'USD',
              })
            : '';

          return `
            <a class="header__search-suggestion" href="${url}" role="option">
              ${image ? `<img src="${image}" alt="${title}" class="header__search-suggestion-image">` : ''}
              <span class="header__search-suggestion-text">
                <span class="header__search-suggestion-title">${title}</span>
                ${price ? `<span class="header__search-suggestion-price">${price}</span>` : ''}
              </span>
            </a>
          `;
        })
        .join('');

      suggestionsBox.hidden = false;
    }

    async function fetchSuggestions(query) {
      const trimmed = query.trim();
      if (!trimmed) {
        renderSuggestions([], '');
        return;
      }

      if (controller) controller.abort();
      controller = new AbortController();

      const params = new URLSearchParams({
        q: trimmed,
        'resources[type]': 'product',
        'resources[options][unavailable_products]': 'hide',
      });

      try {
        const res = await fetch(
          `${Shopify.routes.root}search/suggest.json?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) return renderSuggestions([], '');

        const data = await res.json();
        const products = data?.resources?.results?.products || [];
        renderSuggestions(products, trimmed);
      } catch (e) {
        if (e.name !== 'AbortError') renderSuggestions([], '');
      }
    }

    const debounce = (fn, delay = 250) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
      };
    };

    const debouncedFetch = debounce((value) => {
      if (value === lastQuery) return;
      lastQuery = value;
      fetchSuggestions(value);
    });

    input.addEventListener('input', (e) => {
      debouncedFetch(e.target.value);
    });

    document.addEventListener('click', (e) => {
      if (!form.contains(e.target)) {
        suggestionsBox.hidden = true;
      }
    });
  });
})();
