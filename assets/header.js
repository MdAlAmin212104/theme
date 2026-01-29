
// header menu toggle script for mobile navigation
document.addEventListener('DOMContentLoaded', () => {
const toggleBtn = document.querySelector('.menu-toggle');
console.log('Toggle button:', toggleBtn);
const menu = document.querySelector('.header__menu');

if (!toggleBtn || !menu) return;

toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('is-open');
});
});
