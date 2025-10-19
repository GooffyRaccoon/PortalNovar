// Página atual
let currentPage = 1;

function showSection(page) {
    console.log('Tentando mostrar seção:', page);
    
    // Esconde todas as seções
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostra a seção correspondente
    const section = document.getElementById('section-' + page);
    if (section) {
        section.classList.add('active');
        currentPage = page;
        updatePagination(page);
        
        // LEVAR AO TOPO DA SEÇÃO MAIN
        const mainSection = document.querySelector('.main');
        if (mainSection) {
            mainSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

function updatePagination(page) {
    // Remove classe active de todos os botões
    document.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona classe active ao botão da página atual
    const activeBtn = document.querySelector('.pagination-btn[data-page="' + page + '"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Adiciona evento aos botões de página
document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', function() {
        const page = Number(this.getAttribute('data-page'));
        showSection(page);
    });
});

// Botão próximo >>
document.getElementById('next-btn').addEventListener('click', function() {
    let nextPage = currentPage + 1;
    if (nextPage <= 34) {
        showSection(nextPage);
    }
});

// Inicializa a página 1
document.addEventListener('DOMContentLoaded', function() {
    showSection(1);
});
