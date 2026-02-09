let cartDrawerTimer = null;

function openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.add('cart-drawer--active');

    // Clear previous timer if exists
    if (cartDrawerTimer) {
        clearTimeout(cartDrawerTimer);
    }

    // Start new 5s timer
    cartDrawerTimer = setTimeout(() => {
        closeCartDrawer();
    }, 5000);
}

function closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer');
    if (!drawer) return;

    drawer.classList.remove('cart-drawer--active');

    // Clear timer when closed manually
    if (cartDrawerTimer) {
        clearTimeout(cartDrawerTimer);
        cartDrawerTimer = null;
    }
}

async function updateCartDrawer() {
    const res = await fetch('/?section_id=cart-drawer');
    const html = await res.text();
    const div = document.createElement('div');
    div.innerHTML = html;
    document.querySelector('.cart-drawer').innerHTML = div.querySelector('.cart-drawer').innerHTML;
}

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



document.querySelectorAll('form[action*="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let variantId = null;

        // Try standard Shopify input first
        const input = form.querySelector('input[name="id"]');
        if (input) {
            variantId = input.value;
        } else {
            // Fallback to button data attribute
            const button = form.querySelector('[data-variant-id]');
            if (button) {
                variantId = button.dataset.variantId;
            }
        }
        
        await fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(variantId ? { id: variantId, quantity: 1 } : {})
        }).then(async(res) => {
            const respose = await res.json();
            await updateCartDrawer();
            await updateCartIcon();
            openCartDrawer();
            console.log(respose, "this is respose time");
        }).catch((error) => {
            console.error(error);
        })
    });
});





document.querySelectorAll(".cart-drawer-header-right-close").forEach((item) => {
  item.addEventListener('click', closeCartDrawer);
});

document.querySelector(".cart-drawer").addEventListener('click', closeCartDrawer);

document.querySelector(".cart-drawer-box").addEventListener('click', (e) => {
  e.stopPropagation();
});