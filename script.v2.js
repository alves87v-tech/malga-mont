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

    
function initHeroSlideshow() {
  const wrap = document.querySelector(".hero-bg-slideshow");
  if (!wrap) return;

  const slides = Array.from(wrap.querySelectorAll(".hero-slide"));
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let i = 0;
  let timer = null;

  function show(idx) {
    slides.forEach((el, k) => {
      el.classList.toggle("is-active", k === idx);
    });
  }

  function start() {
    if (reduceMotion.matches || timer) return;

    timer = setInterval(() => {
      i = (i + 1) % slides.length;
      show(i);
    }, 4500);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  show(0);
  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
}

document.addEventListener("DOMContentLoaded", initHeroSlideshow);

// =========================
// HERO PRELOADER
// =========================

function hidePreloader() {
  const preloader = document.getElementById("preloader");

  document.body.classList.add("hero-ready");

  if (!preloader) return;

  preloader.classList.add("is-hidden");

  setTimeout(() => {
    preloader.remove();
  }, 450);
}

function waitForHero() {
  const logo = document.getElementById("heroLogo");
  const video = document.getElementById("heroVideo");

  let logoReady = false;
  let videoReady = false;

  function checkReady() {
    if (logoReady && videoReady) {
      hidePreloader();
    }
  }

  // Logo
  if (!logo) {
    logoReady = true;
  } else if (logo.complete) {
    logoReady = true;
  } else {
    logo.addEventListener("load", () => {
      logoReady = true;
      checkReady();
    });

    logo.addEventListener("error", () => {
      logoReady = true;
      checkReady();
    });
  }

  // Video
  if (!video) {
    videoReady = true;
  } else if (video.readyState >= 2) {
    videoReady = true;
  } else {
    video.addEventListener("loadeddata", () => {
      videoReady = true;
      checkReady();
    });

    video.addEventListener("canplay", () => {
      videoReady = true;
      checkReady();
    });

    video.addEventListener("error", () => {
      videoReady = true;
      checkReady();
    });
  }

  checkReady();

  // Sicurezza: non blocca il sito se logo o video tardano
  setTimeout(() => {
    hidePreloader();
  }, 5000);
}

document.addEventListener("DOMContentLoaded", waitForHero);

// --- HERO SCROLL CUE: freccia mobile/tablet visibile solo sulla hero ----
document.addEventListener("DOMContentLoaded", () => {
  const heroScrollCue = document.querySelector(".hero-scroll-cue");
  const heroSection = document.querySelector(".hero, .hero-section");

  if (!heroScrollCue || !heroSection) return;

  const toggleHeroCue = () => {
    const rect = heroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const isMobileOrTablet = window.innerWidth < 1025;

    const heroMostlyVisible =
      rect.top >= -40 &&
      rect.bottom >= viewportHeight * 0.75;

    heroScrollCue.classList.toggle(
      "is-hidden",
      !(isMobileOrTablet && heroMostlyVisible)
    );
  };

  toggleHeroCue();

  window.addEventListener("scroll", toggleHeroCue, { passive: true });
  window.addEventListener("resize", toggleHeroCue);
});

/* ============================
   MAPS – Percorsi interattivi
============================ */

document.addEventListener("DOMContentLoaded", () => {
// MENU MOBILE PERCORSI / ITINERARI
const routesMasterToggle = document.querySelector(".routes-master-toggle");
const routesMobilePanel = document.querySelector(".routes-mobile-panel");

if (routesMasterToggle && routesMobilePanel) {
  routesMasterToggle.addEventListener("click", () => {
    const isOpen = routesMasterToggle.classList.toggle("is-open");

    routesMasterToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    routesMobilePanel.classList.toggle("is-open", isOpen);
  });
}

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

// =========================
// PROMO VIDEO
// =========================

document.querySelectorAll(".promo-video-card").forEach((card) => {
  const video = card.querySelector(".promo-video");
  const playButton = card.querySelector(".promo-video-play");

  if (!video || !playButton) return;

 function updateState() {
  const isPlaying = !video.paused && !video.ended;

  card.classList.toggle("is-playing", isPlaying);

  video.controls = isPlaying;

  playButton.setAttribute(
    "aria-label",
    isPlaying ? "Metti in pausa il video" : "Guarda il video"
  );
}

  playButton.addEventListener("click", async () => {
    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch (error) {
        console.error("Errore avvio video promo:", error);
      }
    } else {
      video.pause();
    }
  });

  video.addEventListener("click", () => {
    if (video.paused || video.ended) {
      video.play().catch((error) => {
        console.error("Errore avvio video promo:", error);
      });
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", updateState);
  video.addEventListener("pause", updateState);

 video.addEventListener("ended", () => {
  video.currentTime = 0;
  video.controls = false;
  updateState();
});

  updateState();
});