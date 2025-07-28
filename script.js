const slides = document.querySelectorAll('.gatinhos-carrossel-slide');
const slidesWrapper = document.getElementById('gatinhosCarrosselSlides');
const setaEsq = document.getElementById('gatinhosSetaEsquerda');
const setaDir = document.getElementById('gatinhosSetaDireita');
const indicadoresContainer = document.getElementById('gatinhosCarrosselIndicadores');
let currentIndex = 0;
let timer = null;

// Cria indicadores
for (let i = 0; i < slides.length; i++) {
  const span = document.createElement('span');
  span.className = 'gatinhos-carrossel-indicador' + (i === 0 ? ' ativo' : '');
  span.dataset.index = i;
  span.onclick = () => irParaSlide(i, true);
  indicadoresContainer.appendChild(span);
}
const indicadores = indicadoresContainer.querySelectorAll('.gatinhos-carrossel-indicador');

function mostrarSlide(index) {
  slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
  indicadores.forEach((ind, i) => ind.classList.toggle('ativo', i === index));
  currentIndex = index;
}

function proximoSlide(auto = false) {
  let nextIndex = (currentIndex + 1) % slides.length;
  mostrarSlide(nextIndex);
  if (!auto) resetarTimer();
}
function anteriorSlide() {
  let prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  mostrarSlide(prevIndex);
  resetarTimer();
}
function irParaSlide(index, manual = false) {
  mostrarSlide(index);
  if (manual) resetarTimer();
}

function iniciarCarrossel() {
  timer = setInterval(() => proximoSlide(true), 10); // 10 segundos
}
function resetarTimer() {
  clearInterval(timer);
  iniciarCarrossel();
}

setaEsq.onclick = anteriorSlide;
setaDir.onclick = proximoSlide;

window.addEventListener('resize', () => mostrarSlide(currentIndex));
mostrarSlide(0);
iniciarCarrossel();

