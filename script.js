function criarChuvaDeEmojis() {
  const emojis = ['🎉', '✨', '🌟', '💫', '🔥', '⭐', '💥', '🎊', '😊', '🚀', '🌈', '🎈', '🎁', '👍', '❤️', '🔥', '⚡'];
  const container = document.createElement('div');
  container.className = 'emoji-container';
  
  // Adiciona container ao corpo
  document.body.appendChild(container);
  
  // Cria MUITOS mais emojis - verdadeira chuva!
  const quantidadeEmojis = 30; // Aumentei para 30 emojis
  const duracaoChuva = 8000; // 8 segundos de chuva
  
  for (let i = 0; i < quantidadeEmojis; i++) {
    // Distribui os emojis ao longo do tempo para criar efeito de chuva contínua
    const delay = Math.random() * 5000; // Emojis aparecem em momentos diferentes
    
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.className = 'emoji-chuva';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Posição aleatória horizontal
      const left = Math.random() * 100; // 0% a 100%
      emoji.style.left = left + '%';
      
      // Tamanho aleatório
      const tamanho = Math.random() * 30 + 20; // Entre 20px e 50px
      emoji.style.fontSize = tamanho + 'px';
      
      // Velocidade aleatória
      const duracao = Math.random() * 3 + 2; // Entre 2s e 5s
      emoji.style.animationDuration = duracao + 's';
      
      // Rotação aleatória
      const rotacaoInicial = Math.random() * 360;
      emoji.style.setProperty('--rotacao-inicial', rotacaoInicial + 'deg');
      
      container.appendChild(emoji);
      
      // Remove o emoji após a animação
      setTimeout(() => {
        if (emoji.parentNode) {
          emoji.remove();
        }
      }, duracao * 1000);
      
    }, delay);
  }
  
  // Remove o container após a chuva
  setTimeout(() => {
    if (container.parentNode) {
      container.remove();
    }
  }, duracaoChuva + 2000);
}

// Atualize o CSS para a chuva
const estiloChuva = `
.emoji-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 1001;
  overflow: hidden;
}

.emoji-chuva {
  position: absolute;
  animation: cairEmoji linear forwards;
  opacity: 0;
  top: -50px;
  user-select: none;
}

@keyframes cairEmoji {
  0% {
    opacity: 0;
    transform: translateY(-100px) rotate(var(--rotacao-inicial, 0deg)) scale(0.5);
  }
  10% {
    opacity: 1;
    transform: translateY(0) rotate(calc(var(--rotacao-inicial, 0deg) + 90deg)) scale(1);
  }
  90% {
    opacity: 0.8;
    transform: translateY(calc(100vh - 100px)) rotate(calc(var(--rotacao-inicial, 0deg) + 360deg)) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(calc(var(--rotacao-inicial, 0deg) + 450deg)) scale(0.5);
  }
}

/* Efeito de brilho nos emojis */
.emoji-chuva {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7));
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* Alguns emojis com cores especiais */
.emoji-chuva:nth-child(3n) {
  filter: drop-shadow(0 0 8px gold) brightness(1.2);
}

.emoji-chuva:nth-child(3n+1) {
  filter: drop-shadow(0 0 8px cyan) brightness(1.1);
}

.emoji-chuva:nth-child(3n+2) {
  filter: drop-shadow(0 0 8px magenta) brightness(1.1);
}
`;

// Adiciona o CSS da chuva
const styleSheet = document.createElement('style');
styleSheet.textContent = estiloChuva;
document.head.appendChild(styleSheet);

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
      }, 10000);
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



