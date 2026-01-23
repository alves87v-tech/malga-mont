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

// --- GENERIC SLIDER (riusabile) --------------------------------
function initSlider({
  slideSelector,
  dotSelector,
  prevSelector,
  nextSelector,
  activeClass = "is-active",
  intervalMs = 7000
}) {
  const slides = document.querySelectorAll(slideSelector);
  if (!slides.length) return; // se non c'è, esci

  const dots = document.querySelectorAll(dotSelector);
  const prev = document.querySelector(prevSelector);
  const next = document.querySelector(nextSelector);

  let current = 0;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach((s, i) => s.classList.toggle(activeClass, i === current));
    dots.forEach((d, i) => d.classList.toggle(activeClass, i === current));
  }

  if (prev) prev.addEventListener("click", () => showSlide(current - 1));
  if (next) next.addEventListener("click", () => showSlide(current + 1));

  // pallini: se manca data-index uso l'ordine dei bottoni
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const idxAttr = dot.getAttribute("data-index");
      const idx = (idxAttr !== null) ? Number(idxAttr) : i;
      showSlide(isNaN(idx) ? i : idx);
    });
  });

  // autoplay (solo se ha senso)
  let auto = setInterval(() => showSlide(current + 1), intervalMs);

  const resetAuto = () => {
    clearInterval(auto);
    auto = setInterval(() => showSlide(current + 1), intervalMs);
  };

  [prev, next, ...dots].forEach(el => el && el.addEventListener("click", resetAuto));

  showSlide(0);
}

// --- CONTESTO: slideshow territorio ----------------------------
initSlider({
  slideSelector: ".context-slide",
  dotSelector: ".context-dot",
  prevSelector: ".context-prev",
  nextSelector: ".context-next",
  intervalMs: 6000
});
    
// --- VIDEO HERO: loop “morbido” per evitare lo scatto ----------------
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

function initHeroSlideshow() {
  const mq = window.matchMedia('(min-width: 1024px)');
  const wrap = document.querySelector('.hero-bg-slideshow');
  if (!wrap) return;

  const slides = Array.from(wrap.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  let i = 0;
  let timer = null;

  function show(idx) {
    slides.forEach((el, k) => el.classList.toggle('is-active', k === idx));
  }

  function start() {
    if (!mq.matches || timer) return;
    timer = setInterval(() => {
      i = (i + 1) % slides.length;
      show(i);
    }, 4500);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function sync() {
    if (mq.matches) start();
    else { stop(); i = 0; show(0); }
  }

  show(0);
  sync();

  // breakpoint change
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else mq.addListener(sync);

  // pausa quando tab non visibile
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
}

document.addEventListener('DOMContentLoaded', initHeroSlideshow);
