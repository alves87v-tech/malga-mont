let slideIndex = 1;

let slideInterval = null;
showSlides(slideIndex);
startAutoplay();

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.transition = "opacity 1s";
        slides[i].style.opacity = 0;
        slides[i].style.zIndex = 1;
    }
    slides[slideIndex-1].style.zIndex = 2;
    slides[slideIndex-1].style.display = "block";
    setTimeout(function(){
        slides[slideIndex-1].style.opacity = 1;
        for (let j = 0; j < slides.length; j++) {
            if (j !== (slideIndex-1)) {
                setTimeout(function(){
                    slides[j].style.display = "none";
                }, 1000);
            }
        }
    }, 10);
}

function startAutoplay() {
    slideInterval = setInterval(function() {
        showSlides(++slideIndex);
    }, 4000);
}

function restartAutoplay() {
    clearInterval(slideInterval);
    startAutoplay();
}