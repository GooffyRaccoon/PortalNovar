const slides = document.getElementById('carrosselSlides');
const indicadores = document.querySelectorAll('.carrossel-indicador');
const totalSlides = indicadores.length;
let currentIndex = 0;
let timer = null;

function mostrarSlide(index) {
    slides.style.transform = `translateX(-${index * 100}vw)`;
    indicadores.forEach((ind, i) => {
        ind.classList.toggle('ativo', i === index);
    });
    currentIndex = index;
}

function proximoSlide() {
    let nextIndex = (currentIndex + 1) % totalSlides;
    mostrarSlide(nextIndex);
}

function iniciarCarrossel() {
    timer = setInterval(proximoSlide, 10000); // 10 segundos
}

function pararCarrossel() {
    if (timer) clearInterval(timer);
}

indicadores.forEach(indicador => {
    indicador.addEventListener('click', function() {
        pararCarrossel();
        mostrarSlide(Number(this.dataset.index));
        iniciarCarrossel();
    });
});

// Ajusta o slide ao redimensionar a tela
window.addEventListener('resize', () => {
    mostrarSlide(currentIndex);
});

mostrarSlide(0);
iniciarCarrossel();