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
        var selectedOption = [];
        // find selected opitons
        document.querySelectorAll('.product-options input[type="radio"]:checked').forEach(radio => {
            selectedOption.push(radio.value);
        });

        // find matching variant
        var matchVariant = product.variants.find(variant => {
            for(var i = 0; i < selectedOption.length; i++) {
                if(variant.options[i] !== selectedOption[i]) {
                    return false;
                }
            }
            return true;
        });

        document.querySelector('#product-id').value = matchVariant.id;
        


    })
  })