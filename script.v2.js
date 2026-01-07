// --- FOOD: slideshow piatti ------------------------------------
(function(){
  const slides = document.querySelectorAll('.food-slide');
  const dots   = document.querySelectorAll('.food-dot');
  const prev   = document.querySelector('.food-arrow-prev');
  const next   = document.querySelector('.food-arrow-next');

  // se non c'è la sezione esco
  if (!slides.length) return;

  let current = 0;

  function showSlide(index){
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  }

  // frecce
  if (prev) prev.addEventListener('click', () => showSlide(current - 1));
  if (next) next.addEventListener('click', () => showSlide(current + 1));

  // pallini
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.getAttribute('data-index')) || 0;
      showSlide(idx);
    });
  });

  // autoplay
  let auto = setInterval(() => {
    showSlide(current + 1);
  }, 7000);

  const resetAuto = () => {
    clearInterval(auto);
    auto = setInterval(() => showSlide(current + 1), 7000);
  };

  [prev, next, ...dots].forEach(el => {
    if (!el) return;
    el.addEventListener('click', resetAuto);
  });

  // prima slide
  showSlide(0);
})();

// --- VIDEO: loop “morbido” per evitare lo scatto ----------------
document.addEventListener("DOMContentLoaded", () => {
  const v = document.getElementById("heroVideo");
  const poster = document.getElementById("heroPoster");
  if (!v || !poster) return;

  const showVideo = () => {
    v.style.opacity = "1";
    poster.style.opacity = "0";
    poster.style.transition = "opacity .35s ease";
  };

  v.addEventListener("canplay", showVideo, { once: true });
  v.addEventListener("loadeddata", showVideo, { once: true });

  // fallback: se il browser fa il difficile, dopo 1.5s mostra comunque
  setTimeout(showVideo, 1500);
});