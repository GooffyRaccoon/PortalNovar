// Página atual
let currentPage = 1;
const totalPages = 34;
const sectionIds = ["section-1", "section-2", "section-3", "section-34"];

function showSection(page) {
    // Esconde todas as seções
    sectionIds.forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    // Mostra a seção correspondente, se existir
    const section = document.getElementById('section-' + page);
    if (section) {
        section.classList.add('active');
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
        if (sectionIds.includes('section-' + page)) {
            currentPage = page;
            showSection(page);
            updatePagination(page);
        }
    });
});

// Botão próximo >>
document.getElementById('next-btn').addEventListener('click', function() {
    let nextPage = currentPage + 1;
    // Só mostra se existe seção para a página
    while (nextPage <= totalPages && !sectionIds.includes('section-' + nextPage)) {
        nextPage++;
    }
    if (nextPage <= totalPages && sectionIds.includes('section-' + nextPage)) {
        currentPage = nextPage;
        showSection(currentPage);
        updatePagination(currentPage);
    }
});
