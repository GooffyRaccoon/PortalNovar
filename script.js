<script>
  let slides = document.querySelectorAll('#slideshow .slide');
  let current = 0;
  let intervalId;

  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function plusSlides(n) {
    current += n;
    if (current >= slides.length) current = 0;
    if (current < 0) current = slides.length - 1;
    showSlide(current);
    resetInterval();
  }

  function startInterval() {
    intervalId = setInterval(nextSlide, 10000); // 10 segundos
  }

  function resetInterval() {
    clearInterval(intervalId);
    startInterval();
  }

  // Inicialização
  showSlide(current);
  startInterval();
</script>