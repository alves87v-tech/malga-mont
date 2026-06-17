console.log("✅ script.v2.js caricato");
// --- FOOD: scrollbar reale (thumb + drag) -----------------------
(() => {
  const rail = document.getElementById("foodRail");
  const track = document.getElementById("foodScrollbar");
  const thumb = document.getElementById("foodThumb");

  if (!rail || !track || !thumb) return;

  let dragging = false;
  let dragStartX = 0;
  let thumbStartLeft = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const metrics = () => {
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const trackW = track.clientWidth;

    // rapporto visibile -> thumb come scrollbar vera
    const ratioVisible = rail.scrollWidth > 0 ? (rail.clientWidth / rail.scrollWidth) : 1;
    const thumbW = clamp(trackW * ratioVisible, 36, trackW);
    const maxThumbLeft = Math.max(0, trackW - thumbW);

    return { maxScroll, thumbW, maxThumbLeft };
  };

  const render = () => {
    const { maxScroll, thumbW, maxThumbLeft } = metrics();

    thumb.style.width = `${thumbW}px`;

    const p = (maxScroll > 0) ? (rail.scrollLeft / maxScroll) : 0;
    thumb.style.left = `${Math.round(p * maxThumbLeft)}px`;

    // se non c'è overflow, nascondi barra (optional ma bello)
    const hasOverflow = maxScroll > 2;
    track.style.opacity = hasOverflow ? "1" : "0";
    track.style.pointerEvents = hasOverflow ? "auto" : "none";
  };

  const setScrollFromThumbLeft = (leftPx) => {
    const { maxScroll, maxThumbLeft } = metrics();
    const p = (maxThumbLeft > 0) ? (leftPx / maxThumbLeft) : 0;
    rail.scrollLeft = p * maxScroll;
  };

  // click sul track -> vai a quel punto
  track.addEventListener("pointerdown", (e) => {
    const rect = track.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const { thumbW, maxThumbLeft } = metrics();
    const targetLeft = clamp(x - thumbW / 2, 0, maxThumbLeft);
    setScrollFromThumbLeft(targetLeft);
  });

  // drag thumb
  thumb.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    dragging = true;
    thumb.setPointerCapture(e.pointerId);

    dragStartX = e.clientX;
    thumbStartLeft = parseFloat(getComputedStyle(thumb).left) || 0;
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const { maxThumbLeft } = metrics();
    const dx = e.clientX - dragStartX;
    const newLeft = clamp(thumbStartLeft + dx, 0, maxThumbLeft);

    setScrollFromThumbLeft(newLeft);
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  rail.addEventListener("scroll", render, { passive: true });
  window.addEventListener("resize", render);

  render();
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

/* ============================
   MAPS – Percorsi interattivi
============================ */

document.addEventListener("DOMContentLoaded", () => {
  const svgWrap = document.getElementById("svgWrap");
  if (!svgWrap) return;

  const svg = svgWrap.querySelector("svg");
  if (!svg) return;

  const tracciati = svg.querySelector("#tracciati");
  if (!tracciati) return;

  const routeGroups = [...svg.querySelectorAll('g[id^="route-"]')];
  const cards = [...document.querySelectorAll('.route-card[data-route]')];

   // 👉 QUI
  function openCard(card) {
    const head = card.querySelector(".route-head");
    const body = card.querySelector(".route-body");

    cards.forEach(c => {
      c.classList.remove("is-open", "is-active");
      const b = c.querySelector(".route-body");
      if (b) b.hidden = true;
      const h = c.querySelector(".route-head");
      if (h) h.setAttribute("aria-expanded", "false");
    });

    card.classList.add("is-open", "is-active");
    if (body) body.hidden = false;
    if (head) head.setAttribute("aria-expanded", "true");
  }
  
  function setNeutral() {
    tracciati.classList.add("is-filtering"); // tutti grigi
    routeGroups.forEach(g => g.classList.remove("is-active"));
    cards.forEach(c => c.classList.remove("is-active", "is-open"));
  }
  
  function highlightRoute(routeId) {
  if (!routeId) { 
    setNeutral(); 
    return; 
  }



  const normalized = routeId.startsWith("route-")
    ? routeId
    : `route-${routeId}`;

  tracciati.classList.add("is-filtering");

  routeGroups.forEach(g => {
    const isActive = g.id === normalized;
    g.classList.toggle("is-active", isActive);

    // 🔥 PORTA SOPRA IL TRACCIATO ATTIVO
    if (isActive) {
      tracciati.appendChild(g);
    }
  });

  cards.forEach(c => {
    const cId = c.dataset.route.startsWith("route-")
      ? c.dataset.route
      : `route-${c.dataset.route}`;
    c.classList.toggle("is-active", cId === normalized);
  });
}

/* ====== INIZIO: funzione highlightVariant (NUOVA) ====== */
function highlightVariant(routeId) {

  // 1) spengo tutte le varianti
  routeGroups.forEach(g => g.classList.remove("is-variant-active"));

  // 2) se routeId è nullo/vuoto, fine (serve per spegnere variante)
  if (!routeId) return;

  // 3) normalizzo il nome (accetto "route-1a" oppure "1a")
  const normalized = routeId.startsWith("route-")
    ? routeId
    : `route-${routeId}`;

  // 4) cerco il gruppo nello SVG
  const g = svg.querySelector(`#${CSS.escape(normalized)}`);
  if (!g) return;

  // 5) attivo la variante e la porto sopra
  g.classList.add("is-variant-active");
}
/* ====== FINE: funzione highlightVariant (NUOVA) ====== */

 // ✅ stato iniziale: primo percorso attivo e scheda aperta
const defaultRoute = "route-1";

// evidenzia percorso sulla mappa
highlightRoute(defaultRoute);

// apri la scheda corrispondente
const defaultCard = cards.find(c => {
  const cId = c.dataset.route.startsWith("route-")
    ? c.dataset.route
    : `route-${c.dataset.route}`;
  return cId === defaultRoute;
});

if (defaultCard) {
  // chiudi tutto + apri solo quella
  cards.forEach(c => {
    c.classList.remove("is-open", "is-active");
    const b = c.querySelector(".route-body");
    if (b) b.hidden = true;
    const h = c.querySelector(".route-head");
    if (h) h.setAttribute("aria-expanded", "false");
  });

  defaultCard.classList.add("is-open", "is-active");
  const body = defaultCard.querySelector(".route-body");
  if (body) body.hidden = false;
  const head = defaultCard.querySelector(".route-head");
  if (head) head.setAttribute("aria-expanded", "true");
}

   // CLICK SULLA LISTA
  cards.forEach(card => {
    const head = card.querySelector(".route-head");
    const body = card.querySelector(".route-body");
    const routeId = card.dataset.route;

    head.addEventListener("click", () => {
  const isOpen = card.classList.contains("is-open");

  // chiudi tutto
  cards.forEach(c => {
    c.classList.remove("is-open", "is-active");
    const b = c.querySelector(".route-body");
    if (b) b.hidden = true;
    
    // spegni eventuali varianti attive dentro questa card
    c.querySelectorAll(".variant-btn.is-active")
      .forEach(v => v.classList.remove("is-active"));
  });

  // 🔥🔥🔥 QUESTO È IL RESET GLOBALE (METTILO QUI)
  document.querySelectorAll('[data-route].is-active')
    .forEach(el => el.classList.remove('is-active'));

  // --------------------

  if (!isOpen) {
    card.classList.add("is-open", "is-active");
    if (body) body.hidden = false;

    highlightVariant(null);   // 🔥 aggiungi QUESTA riga
    highlightRoute(routeId);
  } else {
    highlightRoute(null);
    highlightVariant(null);
  }
});

/* ====== INIZIO: click varianti (NUOVO) ====== */
document.addEventListener("click", (e) => {

  const btn = e.target.closest(".variant-btn");
  if (!btn) return;

  // impedisco che il click faccia altro (tipo chiudere/aprire schede)
  e.preventDefault();
  e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();

  // prendo l'id della variante dal bottone (es: "route-1a")
  const routeId = (btn.dataset.route || "").trim();
  if (!routeId) return;

console.log("VARIANT CLICK", routeId);

  // accendo SOLO la variante (non tocco il main)
  highlightVariant(routeId);

}, true);
/* ====== FINE: click varianti (NUOVO) ====== */

  });

// ===============================
// VARIANTI → MAPPA (CAPTURE, niente conflitti con le card)
// ===============================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".variant-btn");
  if (!btn) return;

  // blocca qualunque handler della card/head che potrebbe "resettare"
  e.preventDefault();
  e.stopPropagation();
  if (e.stopImmediatePropagation) e.stopImmediatePropagation();

  const routeId = (btn.dataset.route || "").trim(); // qui sarà "route-1a"
  if (!routeId) return;

  console.log("[VARIANT] click:", routeId); // debug: deve apparire

  highlightRoute(routeId);

  // feedback UI (opzionale)
  document.querySelectorAll(".variant-btn.is-active")
    .forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");

}, true); // <-- CAPTURE: arriva prima degli altri click listener
  }); // chiude document.querySelectorAll(".variant-btn").forEach
  
  // =========================
// MENU MOBILE
// =========================

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

if (menuToggle) {
  menuToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = document.body.classList.toggle("menu-open");

    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuToggle.setAttribute("aria-label", isOpen ? "Chiudi menu" : "Apri menu");

    menuToggle.blur();
  });
}

mobileMenuLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    document.body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri menu");
    }

    link.blur();
  });
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document.body.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Apri menu");
    }
  }
});