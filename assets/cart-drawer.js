let cartDrawerTimer = null;

// --- Open / Close Drawer ---
function openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.add('cart-drawer--active');

    // Clear previous timer
    if (cartDrawerTimer) clearTimeout(cartDrawerTimer);

    // Auto close after 5s
    cartDrawerTimer = setTimeout(() => {
        closeCartDrawer();
    }, 5000);
}

function closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.remove('cart-drawer--active');

    if (cartDrawerTimer) {
        clearTimeout(cartDrawerTimer);
        cartDrawerTimer = null;
    }
}

// --- Update Cart Drawer via AJAX ---
async function updateCartDrawer() {
    const res = await fetch('/?section_id=cart-drawer');
    const html = await res.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    const newDrawer = div.querySelector('.cart-drawer');
    if (newDrawer) {
        const currentDrawer = document.querySelector('.cart-drawer');
        currentDrawer.innerHTML = newDrawer.innerHTML;
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
    } catch (error) {
        console.error('Cart icon update failed:', error);
    }
}

// --- Event Delegation for Cart Drawer ---
document.addEventListener('click', async (e) => {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    // Click overlay → close drawer
    if (e.target.classList.contains('cart-drawer')) {
        closeCartDrawer();
    }

    // Click plus/minus buttons
    const quantityButton = e.target.closest('.cart-drawer-quantity-selector button');
    if (quantityButton) {
        e.stopPropagation(); // Prevent closing drawer

        const rootItem = quantityButton.closest('[data-line-item-key]');
        const key = rootItem.dataset.lineItemKey;
        const input = rootItem.querySelector('input');
        let currentQuantity = parseInt(input.value);

        const isPlus = quantityButton.classList.contains('cart-drawer-quantity-selector-plus');
        let newQuantity = isPlus ? currentQuantity + 1 : currentQuantity - 1;
        if (newQuantity < 0) newQuantity = 0;

        // Update quantity via AJAX
        try {
            const res = await fetch(window.Shopify.routes.root + 'cart/update.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: { [key]: newQuantity } })
            });
            await res.json();

            // Refresh drawer and icon
            await updateCartDrawer();
            await updateCartIcon();

        } catch (error) {
            console.error("Error updating cart:", error);
        }
        return;
    }

    // Click cart icon → open drawer
    const cartIcon = e.target.closest('.header__icon--cart');
    if (cartIcon) {
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
    if (input) variantId = input.value;
    else {
        const button = form.querySelector('[data-variant-id]');
        if (button) variantId = button.dataset.variantId;
    }

    try {
        const res = await fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(variantId ? { id: variantId, quantity: 1 } : {})
        });
        await res.json();

        // Refresh drawer and icon, then open
        await updateCartDrawer();
        await updateCartIcon();
        openCartDrawer();

    } catch (error) {
        console.error("Error adding to cart:", error);
    }
});
