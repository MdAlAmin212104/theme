window.Shopify = window.Shopify || {};

// Default money format
Shopify.money_format = "${{amount}}";

// Safe money formatter
Shopify.formatMoney = function (cents, format) {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }

  var value = "";
  var formatString = format || Shopify.money_format;

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = precision || 2;
    thousands = thousands || ",";
    decimal = decimal || ".";

    if (isNaN(number) || number == null) {
      return "0";
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split(".");
    var dollars = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      "$1" + thousands
    );
    var centsPart = parts[1] ? decimal + parts[1] : "";

    return dollars + centsPart;
  }

  value = formatWithDelimiters(cents, 2);
  return formatString.replace(/\{\{\s*amount[^}]*\}\}/, value);
};

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------- IMAGE SLIDER ---------------- */
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
      sliderContainer.scrollLeft = currentIndex * 105;
    }

    function changeImage(index) {
      currentIndex = index;
      const newImageSrc = sliderImages[index].querySelector('img').src;
      if (mainImage) mainImage.src = newImageSrc;
      updateSlider();
    }

    sliderImages.forEach((img, index) => {
      img.addEventListener('click', () => changeImage(index));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex =
          currentIndex > 0 ? currentIndex - 1 : sliderImages.length - 1;
        changeImage(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex =
          currentIndex < sliderImages.length - 1 ? currentIndex + 1 : 0;
        changeImage(currentIndex);
      });
    }

    updateSlider();
  }

  /* ---------------- VARIANT CHANGE ---------------- */
  const radios = document.querySelectorAll(
    '.product-options input[type="radio"]'
  );

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      let selectedOptions = [];

      document
        .querySelectorAll('.product-options fieldset')
        .forEach((fieldset) => {
          const checked = fieldset.querySelector(
            'input[type="radio"]:checked'
          );
          if (checked) selectedOptions.push(checked.value);
        });

      let matchVariant = product.variants.find((variant) => {
        return variant.options.every(
          (opt, i) => opt === selectedOptions[i]
        );
      });

      if (!matchVariant) return;

      // update hidden input
      const idInput = document.querySelector('#product-id');
      if (idInput) idInput.value = matchVariant.id;

      // update URL
      const url = new URL(window.location.href);
      url.searchParams.set('variant', matchVariant.id);
      window.history.pushState({}, '', url);

      // update prices
      const priceEl = document.querySelector('.product-price');
      const comparePriceEl = document.querySelector(
        '.product-compare-price'
      );

      if (priceEl) {
        priceEl.textContent = Shopify.formatMoney(
          matchVariant.price
        );
      }

      if (comparePriceEl) {
        if (
          matchVariant.compare_at_price &&
          matchVariant.compare_at_price > matchVariant.price
        ) {
          comparePriceEl.textContent = Shopify.formatMoney(
            matchVariant.compare_at_price
          );
          comparePriceEl.style.display = 'block';
        } else {
          comparePriceEl.style.display = 'none';
        }
      }

      // change main image if variant has featured image
      if (matchVariant.featured_image) {
        const newSrc = matchVariant.featured_image.src.replace(/\.\w+$/, '_800x800$&');

        if (mainImage) {
          mainImage.src = newSrc;
        }

        // Update selected thumbnail
        document.querySelectorAll('.product-image-thumbnails li').forEach(li => {
          const thumbImg = li.querySelector('img');
          if (!thumbImg) return;

          const largeSrc = thumbImg.dataset.large;

          if (largeSrc && largeSrc.includes(matchVariant.featured_image.src)) {
            // Remove selected from all
            document.querySelectorAll('.product-image-thumbnails li.selected')
              .forEach(el => el.classList.remove('selected'));

            // Add selected to matched thumbnail
            li.classList.add('selected');
          }
        });
      }
    });
  });
});


document.querySelectorAll('.product-image-thumbnails li').forEach(li => {
  li.addEventListener('click', () => {
    const newSrc = li.querySelector('img').dataset.large;
    document.querySelector('.product-main-image').src = newSrc;
    document.querySelectorAll('.product-image-thumbnails li.selected').forEach(thumbnail => {
      thumbnail.classList.remove('selected');
    });
    li.classList.add('selected');
  });
});