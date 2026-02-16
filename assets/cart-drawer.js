

// --- Open / Close Drawer ---
function openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.add('cart-drawer--active');
}

function closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.remove('cart-drawer--active');
}

// --- Update Cart Drawer via AJAX ---
async function updateCartDrawer() {
    try {
        const res = await fetch('/?section_id=cart-drawer');
        const html = await res.text();
        const div = document.createElement('div');
        div.innerHTML = html;
        const newDrawer = div.querySelector('.cart-drawer');
        if (newDrawer) {
            document.querySelector('.cart-drawer').innerHTML = newDrawer.innerHTML;
        }
    } catch (err) {
        console.error("Error updating cart drawer:", err);
    }
}

// --- Update Cart Icon via AJAX ---
async function updateCartIcon() {
    try {
        const res = await fetch('/?sections=header');
        const data = await res.json();
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data['header'], 'text/html');
        const newIcon = htmlDoc.querySelector('#cart-icon-bubble');
        const currentIcon = document.querySelector('#cart-icon-bubble');
        if (newIcon && currentIcon) {
            currentIcon.innerHTML = newIcon.innerHTML;
        }
    } catch (err) {
        console.error("Error updating cart icon:", err);
    }
}

// --- Event Delegation for Drawer ---
document.addEventListener('click', async (e) => {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    // Quantity plus/minus
    const qtyBtn = e.target.closest('.cart-drawer-quantity-selector button');
    if (qtyBtn) {
        e.stopPropagation();
        const item = qtyBtn.closest('[data-line-item-key]');
        const key = item.dataset.lineItemKey;
        const input = item.querySelector('input');
        let qty = parseInt(input.value);
        qty = qtyBtn.classList.contains('cart-drawer-quantity-selector-plus') ? qty + 1 : qty - 1;
        if (qty < 0) qty = 0;

        try {
            await fetch(window.Shopify.routes.root + 'cart/update.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: { [key]: qty } })
            });
            await updateCartDrawer();
            await updateCartIcon();
        } catch (err) {
            console.error("Error updating quantity:", err);
        }
        return;
    }

    // Remove item via AJAX
    const removeBtn = e.target.closest('.cart-drawer-item a[href*="/cart/change"]') || e.target.closest('.cart-drawer-item a[href*="/cart"]');
    if (removeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const item = removeBtn.closest('[data-line-item-key]');
        const key = item.dataset.lineItemKey;

        try {
            await fetch(window.Shopify.routes.root + 'cart/update.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: { [key]: 0 } }) // quantity 0 = remove
            });
            await updateCartDrawer();
            await updateCartIcon();
        } catch (err) {
            console.error("Error removing item:", err);
        }
        return;
    }

    // Cart icon click → open drawer
    if (e.target.closest('.header__icon--cart')) {
        openCartDrawer();
    }
});

// --- Add-to-Cart via AJAX ---
document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[action*="/cart/add"]');
    if (!form) return;
    e.preventDefault();

    let variantId = null;
    const input = form.querySelector('input[name="id"]');
    if (input) variantId = parseInt(input.value);
    else {
        const button = form.querySelector('[data-variant-id]');
        if (button) variantId = parseInt(button.dataset.variantId);
    }

    // Get quantity
    let quantity = 1;
    const qtyInput = form.querySelector('input[name="quantity"]');
    if (qtyInput) {
        quantity = parseInt(qtyInput.value) || 1;
    }
    // --- Inventory check ---
    if (window.productVariants && variantId) {
        const variant = window.productVariants.find(v => v.id === variantId);
        
        console.log(variant)
        if (
    variant &&
    variant.inventory_management &&
    variant.inventory_policy === "deny"
) {
    const availableQty = variant.inventory_quantity;
    console.log(availableQty);

    if (quantity > availableQty) {
        alert(`Only ${availableQty} items available in stock.`);
        qtyInput.value = availableQty > 0 ? availableQty : 1;
        return;
    }
}
    }

    try {
        await fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity })
        });
        await updateCartDrawer();
        await updateCartIcon();
        openCartDrawer();
    } catch (err) {
        console.error("Error adding to cart:", err);
    }
});


// Close drawer when clicking the "X" button inside drawer
document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.cart-drawer-header-right-close');
    if (closeBtn) {
        e.preventDefault();
        closeCartDrawer();
    }

    // Close drawer when clicking outside the drawer box (overlay)
    if (e.target.classList.contains('cart-drawer-overlay')) {
        closeCartDrawer();
    }
});
