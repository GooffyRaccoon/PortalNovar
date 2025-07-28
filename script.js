<script>
    let slides = document.querySelectorAll('#slideshow img');
    let current = 0;

    function showSlide(index) {
      slides.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });
    }

    setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, 2000); //Troca de alide a cada s

let slideIndex = 0;
const slides = document.getElementsByClassName("slide");

function showSlide(index) {
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
    }
    slides[index].classList.add("active");
}

function plusSlides(n) {
    slideIndex += n;
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;
    showSlide(slideIndex);
}

</script>

  
