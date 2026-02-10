document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.getElementById('sliderContainer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sliderImages = document.querySelectorAll('.slider-image');
    const mainImage = document.querySelector('.product-main-image');

    if (sliderContainer && sliderImages.length > 0) {
      let currentIndex = 0;

      function updateSlider() {
        sliderImages.forEach((img, index) => {
          img.classList.toggle('active', index === currentIndex);
        });
        const scrollAmount = currentIndex * 105; // 100px width + 5px margin
        sliderContainer.scrollLeft = scrollAmount;
      }

      function changeImage(index) {
        currentIndex = index;
        const newImageSrc = sliderImages[index].querySelector('img').src;
        mainImage.src = newImageSrc;
        updateSlider();
      }

      sliderImages.forEach((img, index) => {
        img.addEventListener('click', () => changeImage(index));
      });

      prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : sliderImages.length - 1;
        changeImage(currentIndex);
      });

      nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < sliderImages.length - 1 ? currentIndex + 1 : 0;
        changeImage(currentIndex);
      });

      updateSlider();
    }
});


document.querySelectorAll('.product-options input[type="radio"]').forEach(radio => {
  radio.addEventListener('change', () => {

    let selectedOptions = [];

    // collect options in correct order
    document.querySelectorAll('.product-options fieldset').forEach(fieldset => {
      const checked = fieldset.querySelector('input[type="radio"]:checked');
      if (checked) {
        selectedOptions.push(checked.value);
      }
    });


    // find matching variant
    let matchVariant = product.variants.find(variant => {
      for (let i = 0; i < selectedOptions.length; i++) {
        if (variant.options[i] !== selectedOptions[i]) {
          return false;
        }
      }
      return true;
    });

    if (matchVariant) {
      document.querySelector('#product-id').value = matchVariant.id;
    }

    var url = new URL(window.location.href);
    url.searchParams.set('variant', matchVariant.id);
    window.history.pushState({}, '', url);


    if (matchVariant) {
  document.querySelector('#product-id').value = matchVariant.id;

  document.querySelector('#product-price').textContent =
    Shopify.formatMoney(matchVariant.price);

  if (matchVariant.compare_at_price > matchVariant.price) {
    document.querySelector('#product-compare-price').textContent =
      Shopify.formatMoney(matchVariant.compare_at_price);
  }
}

  });
});
