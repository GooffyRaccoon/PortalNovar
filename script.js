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
    }, 2000); // Change slide every 2 seconds
  </script>
