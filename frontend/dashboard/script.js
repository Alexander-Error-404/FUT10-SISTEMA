document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('fut10_usuario_logado');
    const nomeExibicao = localStorage.getItem('fut10_nome_exibicao');

    if (!usuarioLogado || !nomeExibicao) {
        window.location.href = '../login/index.html';
        return;
    }

    document.getElementById('nome-usuario').textContent = nomeExibicao;

    // Lógica de restrição de abas por perfil
    if (usuarioLogado === 'alessandra') {
        // Se for a Alessandra, esconde as telas exclusivas do Vinícius
        document.querySelectorAll('.menu-vinicius').forEach(card => {
            card.classList.add('ocultar');
        });
    } else if (usuarioLogado === 'vinicius') {
        // Se for o Vinícius, esconde as telas exclusivas da Alessandra
        document.querySelectorAll('.menu-alessandra').forEach(card => {
            card.classList.add('ocultar');
        });
    }
});

document.getElementById('btn-sair').addEventListener('click', function() {
    localStorage.removeItem('fut10_usuario_logado');
    localStorage.removeItem('fut10_nome_exibicao');
    window.location.href = '../login/index.html';
});