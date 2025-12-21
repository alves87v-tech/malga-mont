let slideIndex = 0;
let slideInterval = null;

const slides = document.getElementsByClassName("slide");

function showSlide(index) {
  if (!slides.length) return; // sicurezza: se non ci sono slide, non fa nulla

  slideIndex = (index + slides.length) % slides.length;

  for (let i = 0; i < slides.length; i++) {
    slides[i].classList.remove("is-active");
  }

  slides[slideIndex].classList.add("is-active");
}

function nextSlide() {
  showSlide(slideIndex + 1);
}

function prevSlide() {
  showSlide(slideIndex - 1);
}

function startAutoplay() {
  stopAutoplay();
  slideInterval = setInterval(nextSlide, 4000);
}

function stopAutoplay() {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = null;
}

function restartAutoplay() {
  startAutoplay();
}

// init slideshow
showSlide(0);
startAutoplay();

// --- VIDEO: loop “morbido” per evitare lo scatto ---
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("heroVideo");
  if (!video) return;

  // IMPORTANTE: togli "loop" dal tag video in HTML
  video.addEventListener("timeupdate", () => {
    const cut = 0.08;   // quanto prima del fine tagliare
    const restart = 0.03; // da dove ripartire
    if (video.duration && video.currentTime >= video.duration - cut) {
      video.currentTime = restart;
      video.play();
    }
  });
});