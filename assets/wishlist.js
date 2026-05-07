/* assets/wishlist.js */

/**
 * Reusable JS Functions for Wishlist using LocalStorage
 * No app or backend required.
 */

// Wishlist storage key
const WISHLIST_KEY = 'shopify_wishlist_data';

// Initialize wishlist
function getWishlist() {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

function saveWishlist(wishlist) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  updateWishlistCount();
  updateWishlistButtons();
}

// Global functions
window.addToWishlist = function(product) {
  let wishlist = getWishlist();
  const exists = wishlist.find(item => item.handle === product.handle);
  
  if (!exists) {
    wishlist.push(product);
    saveWishlist(wishlist);
  }
};

window.removeFromWishlist = function(productHandle) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(item => item.handle !== productHandle);
  saveWishlist(wishlist);
  
  // If on wishlist page, re-render
  if (document.getElementById('wishlist-grid')) {
    window.renderWishlistItems();
  }
};

window.toggleWishlist = function(button) {
  const product = {
    handle: button.getAttribute('data-product-handle'),
    title: button.getAttribute('data-product-title'),
    price: button.getAttribute('data-product-price'),
    url: button.getAttribute('data-product-url'),
    image: button.getAttribute('data-product-image'),
  };

  let wishlist = getWishlist();
  const exists = wishlist.find(item => item.handle === product.handle);

  if (exists) {
    window.removeFromWishlist(product.handle);
  } else {
    window.addToWishlist(product);
  }
};

window.updateWishlistCount = function() {
  const wishlist = getWishlist();
  const countEls = document.querySelectorAll('#wishlist-count, .wishlist-count-badge');
  countEls.forEach(el => {
    el.textContent = wishlist.length;
    el.style.display = wishlist.length > 0 ? 'inline-flex' : 'none';
  });
};

window.updateWishlistButtons = function() {
  const wishlist = getWishlist();
  const buttons = document.querySelectorAll('.wishlist-btn');
  
  buttons.forEach(button => {
    const handle = button.getAttribute('data-product-handle');
    const exists = wishlist.find(item => item.handle === handle);
    
    if (exists) {
      button.classList.add('active');
      // Fill the SVG heart
      button.querySelector('.wishlist-icon path').setAttribute('fill', 'currentColor');
    } else {
      button.classList.remove('active');
      // Empty the SVG heart
      button.querySelector('.wishlist-icon path').setAttribute('fill', 'none');
    }
  });
};

window.renderWishlistItems = function() {
  const grid = document.getElementById('wishlist-grid');
  const emptyState = document.getElementById('wishlist-empty');
  
  if (!grid || !emptyState) return;

  const wishlist = getWishlist();

  if (wishlist.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = wishlist.map(product => `
      <div class="product-card product-card--wishlist">
        <a href="${product.url}" class="product-card__link__a">
          <div class="product-card__img-wrap">
            <img src="${product.image}" alt="${product.title}" class="product-card__img">
            <button class="product-card__remove-wishlist" onclick="event.preventDefault(); window.removeFromWishlist('${product.handle}')" aria-label="Remove">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="product-card__info">
            <h3 class="product-card__title">${product.title}</h3>
            <div class="product-card__price-row">
              <span class="product-card__price">${product.price}</span>
            </div>
          </div>
        </a>
      </div>
    `).join('');
  }
};

// Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistCount();
  updateWishlistButtons();
  renderWishlistItems();
});
