/* custom-cart.js */

/**
 * Reusable JS Functions for Quick Shop and Custom Cart
 * using standard Shopify AJAX API
 */

// Format money helper
if (typeof Shopify === 'undefined') window.Shopify = {};
if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.','');
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || window.shopMoneyFormat || '${{amount}}';
    function formatWithDelimiters(number, precision, thousands, decimal) {
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var cents = parts[1] ? (decimal + parts[1]) : '';
      return dollars + cents;
    }
    var match = formatString.match(placeholderRegex);
    if (!match) return '$' + (cents/100).toFixed(2);
    
    switch(match[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2, ',', '.');
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      default:
        value = formatWithDelimiters(cents, 2, ',', '.');
        break;
    }
    return formatString.replace(placeholderRegex, value);
  };
}

// ---- QUICK SHOP ----
window.openQuickShop = function(handle) {
  const modal = document.getElementById('QuickShopModal');
  const modalBody = document.getElementById('QuickShopBody');
  modal.classList.add('is-open');
  modalBody.innerHTML = '<div class="qs-loading"><div class="spinner"></div></div>';

  fetch(`/products/${handle}.js`)
    .then(res => res.json())
    .then(product => {
      let variantOptions = '';
      if (product.variants.length > 1) {
        variantOptions = `<div class="qs-variants"><label>Variant</label><select id="qs-variant-id" class="qs-select">` + 
          product.variants.map(v => `<option value="${v.id}" ${v.available ? '' : 'disabled'}>${v.title} - ${Shopify.formatMoney(v.price)}</option>`).join('') +
        `</select></div>`;
      } else {
        variantOptions = `<input type="hidden" id="qs-variant-id" value="${product.variants[0].id}">`;
      }

      modalBody.innerHTML = `
        <div class="qs-grid">
          <div class="qs-image">
            <img src="${product.featured_image}" alt="${product.title}">
          </div>
          <div class="qs-info">
            <h2 class="qs-title">${product.title}</h2>
            <p class="qs-price">${Shopify.formatMoney(product.price)}</p>
            <div class="qs-desc">${product.description.replace(/(<([^>]+)>)/gi, "").substring(0, 150)}...</div>
            <div class="qs-form">
              ${variantOptions}
              <div class="qs-qty-wrapper">
                <label>Quantity</label>
                <div class="qs-qty">
                  <button type="button" onclick="decrementQsQty()">-</button>
                  <input type="number" id="qs-qty" value="1" min="1" readonly>
                  <button type="button" onclick="incrementQsQty()">+</button>
                </div>
              </div>
              <button class="qs-add-btn" type="button" onclick="addToCartAjax(document.getElementById('qs-variant-id').value, document.getElementById('qs-qty').value, this)">
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .catch(err => {
      modalBody.innerHTML = `<p>Error loading product.</p>`;
    });
};

window.closeQuickShop = function() {
  document.getElementById('QuickShopModal').classList.remove('is-open');
};

window.decrementQsQty = function() {
  const input = document.getElementById('qs-qty');
  if(input.value > 1) input.value--;
};

window.incrementQsQty = function() {
  const input = document.getElementById('qs-qty');
  input.value++;
};

window.addToCartAjax = function(id, quantity, btn) {
  if (btn) btn.classList.add('is-loading');

  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: id,
      quantity: quantity
    })
  })
  .then(res => res.json())
  .then(data => {
    if (btn) btn.classList.remove('is-loading');
    closeQuickShop();
    updateCart();
    
    // Attempt to open the drawer if available (optional)
    const cartDrawer = document.querySelector('.cart-drawer-overlay');
    if (cartDrawer) {
       cartDrawer.style.display = 'block'; 
       // Need to re-init drawer JS or reload page, but we'll just update it
       if(window.updateDrawer) window.updateDrawer();
    }
  })
  .catch(err => {
    if (btn) btn.classList.remove('is-loading');
    alert('Error adding to cart.');
  });
};

// ---- CUSTOM CART ----
window.updateCart = function() {
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      updateCartCount(cart.item_count);
      renderCartItems(cart);
    });
};

window.updateCartCount = function(count) {
  // Update badges across the site
  const bubbles = document.querySelectorAll('.header__cart-count');
  bubbles.forEach(bubble => bubble.textContent = count);
  
  // If count bubble didn't exist but count > 0, we might need to recreate it.
  const cartIconContainer = document.querySelector('.header__icon--cart');
  if (cartIconContainer && count > 0 && !cartIconContainer.querySelector('.header__cart-count')) {
    const bubble = document.createElement('span');
    bubble.className = 'header__cart-count';
    bubble.textContent = count;
    cartIconContainer.appendChild(bubble);
  } else if (count === 0 && cartIconContainer && cartIconContainer.querySelector('.header__cart-count')) {
    cartIconContainer.querySelector('.header__cart-count').remove();
  }
};

window.changeItemQuantity = function(key, qty) {
  const cartContainer = document.getElementById('custom-cart-items');
  if(cartContainer) cartContainer.classList.add('loading-overlay');

  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: key,
      quantity: qty
    })
  })
  .then(res => res.json())
  .then(cart => {
    if(cartContainer) cartContainer.classList.remove('loading-overlay');
    updateCartCount(cart.item_count);
    renderCartItems(cart);
  });
};

window.removeCartItem = function(key) {
  changeItemQuantity(key, 0);
};

window.updateCartNote = function() {
  const note = document.getElementById('custom-cart-note').value;
  const btn = document.getElementById('save-note-btn');
  if(btn) btn.textContent = 'Saving...';
  
  fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: note })
  }).then(() => {
    if(btn) {
      btn.textContent = 'Saved!';
      setTimeout(() => btn.textContent = 'Save Note', 2000);
    }
  });
};

window.renderCartItems = function(cart) {
  const container = document.getElementById('custom-cart-items');
  if (!container) return; // not on cart page

  const countEl = document.getElementById('custom-cart-count');
  const subtotalEl = document.getElementById('custom-cart-subtotal');
  
  if (countEl) countEl.textContent = cart.item_count;
  if (subtotalEl) subtotalEl.textContent = Shopify.formatMoney(cart.total_price);

  if (cart.item_count === 0) {
    document.getElementById('custom-cart-form').style.display = 'none';
    document.getElementById('custom-cart-empty').style.display = 'block';
    return;
  } else {
    document.getElementById('custom-cart-form').style.display = 'block';
    document.getElementById('custom-cart-empty').style.display = 'none';
  }

  container.innerHTML = cart.items.map(item => `
    <div class="custom-cart-item">
      <div class="custom-cart-item__image">
        <a href="${item.url}">
          <img src="${item.image}" alt="${item.title}">
        </a>
      </div>
      <div class="custom-cart-item__details">
        <h3 class="custom-cart-item__title"><a href="${item.url}">${item.product_title}</a></h3>
        ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="custom-cart-item__variant">${item.variant_title}</p>` : ''}
        <div class="custom-cart-item__price-mobile">${Shopify.formatMoney(item.price)}</div>
        <button class="custom-cart-item__remove" type="button" onclick="removeCartItem('${item.key}')">Remove</button>
      </div>
      <div class="custom-cart-item__price">
        ${Shopify.formatMoney(item.price)}
      </div>
      <div class="custom-cart-item__quantity">
        <div class="qs-qty">
          <button type="button" onclick="changeItemQuantity('${item.key}', ${item.quantity - 1})">-</button>
          <input type="number" readonly value="${item.quantity}">
          <button type="button" onclick="changeItemQuantity('${item.key}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <div class="custom-cart-item__total">
        ${Shopify.formatMoney(item.line_price)}
      </div>
    </div>
  `).join('');
};

document.addEventListener('DOMContentLoaded', () => {
  // initial load of cart page items
  const cartContainer = document.getElementById('custom-cart-items');
  if (cartContainer) {
    updateCart();
  }
});

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('QuickShopModal');
  if (e.target === modal) {
    closeQuickShop();
  }
});
