// Função para mostrar notificação
function mostrarNotificacao() {
  if (!localStorage.getItem('notificacaoVista')) {
    // Cria a CHUVA de emojis
    criarChuvaDeEmojis();
    
    // Mostra a notificação
    const notificacao = document.querySelector('.cabelo.notificacao');
    if (notificacao) {
      notificacao.style.display = 'flex';
      
      // Esconde após 10 segundos
      setTimeout(() => {
        notificacao.style.display = 'none';
        localStorage.setItem('notificacaoVista', 'true');
      }, 5000);
    }
  } else {
    // Se já foi vista, remove a notificação
    const notificacao = document.querySelector('.cabelo.notificacao');
    if (notificacao) {
      notificacao.remove();
    }
  }
}

// Execute quando a página carregar
document.addEventListener('DOMContentLoaded', mostrarNotificacao);

// Adicionar evento ao botão X para fechar manualmente
document.addEventListener('DOMContentLoaded', function() {
  const botaoFechar = document.querySelector('.xcabelo');
  if (botaoFechar) {
    botaoFechar.addEventListener('click', function() {
      const notificacao = document.querySelector('.cabelo.notificacao');
      if (notificacao) {
        notificacao.style.display = 'none';
        localStorage.setItem('notificacaoVista', 'true');
      }
    });
  }
});

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
  timer = setInterval(() => proximoSlide(true), 10000); // 8 segundos
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



