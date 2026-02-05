

document.querySelectorAll('form[action*="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        await fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form)
        }).then((res) => {
            const respose = res.json();
            document.querySelector('.cart-drawer').classList.add('cart-drawer--active');

            console.log('Cart drawer opened');
        }).catch((error) => {
            console.error(error);
        })
    });
});



function closeCartDrawer() {
  document.querySelector('.cart-drawer').classList.remove('cart-drawer--active');
}

document.querySelectorAll(".cart-drawer-header-right-close").forEach((item) => {
  item.addEventListener('click', closeCartDrawer);
});

document.querySelector(".cart-drawer").addEventListener('click', closeCartDrawer);

document.querySelector(".cart-drawer-box").addEventListener('click', (e) => {
  e.stopPropagation();
});