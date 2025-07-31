const slidesWrapper = document.getElementById('carrosselSlides');
const slides = document.querySelectorAll('.carrossel-slide');
const setaEsq = document.getElementById('carrosselSetaEsquerda');
const setaDir = document.getElementById('carrosselSetaDireita');
const indicadoresContainer = document.getElementById('carrosselIndicadores');

let currentIndex = 0;
let timer = null;

// Criação dos indicadores (bolinhas)
indicadoresContainer.innerHTML = '';
for (let i = 0; i < slides.length; i++) {
  const span = document.createElement('span');
  span.className = 'carrossel-indicador' + (i === 0 ? ' ativo' : '');
  span.dataset.index = i;
  span.onclick = () => irParaSlide(i, true);
  indicadoresContainer.appendChild(span);
}
const indicadores = indicadoresContainer.querySelectorAll('.carrossel-indicador');

// Função para mostrar o slide desejado
function mostrarSlide(index) {
  slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
  indicadores.forEach((ind, i) => ind.classList.toggle('ativo', i === index));
  currentIndex = index;
}

// Próximo slide
function proximoSlide(auto = false) {
  let nextIndex = (currentIndex + 1) % slides.length;
  mostrarSlide(nextIndex);
  if (!auto) resetarTimer();
}

// Slide anterior
function anteriorSlide() {
  let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  mostrarSlide(prevIndex);
  resetarTimer();
}

// Ir para slide específico (clicando na bolinha)
function irParaSlide(index, manual = false) {
  mostrarSlide(index);
  if (manual) resetarTimer();
}

// Inicia o carrossel automático
function iniciarCarrossel() {
  timer = setInterval(() => proximoSlide(true), 5000); // 5 segundos
}

// Reseta o timer ao trocar manualmente
function resetarTimer() {
  clearInterval(timer);
  iniciarCarrossel();
}

// Eventos das setas
setaEsq.onclick = anteriorSlide;
setaDir.onclick = proximoSlide;

// Responsividade: ajusta slide atual ao redimensionar
window.addEventListener('resize', () => mostrarSlide(currentIndex));

// Inicialização
mostrarSlide(0);
iniciarCarrossel();