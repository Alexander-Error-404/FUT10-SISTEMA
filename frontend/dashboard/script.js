document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('fut10_usuario_logado');
    const nomeExibicao = localStorage.getItem('fut10_nome_exibicao');

    if (!usuarioLogado || !nomeExibicao) {
        window.location.href = '../login/index.html';
        return;
    }

    document.getElementById('nome-usuario').textContent = nomeExibicao;

    // Regra de restrição de abas por perfil original
    if (usuarioLogado === 'alessandra') {
        document.querySelectorAll('.menu-vinicius').forEach(card => {
            card.classList.add('ocultar');
        });
    } else if (usuarioLogado === 'vinicius') {
        document.querySelectorAll('.menu-alessandra').forEach(card => {
            card.classList.add('ocultar');
        });
    }

    // DISPARO SEGURO DO MOTOR DOS INDICADORES
    try {
        calcularEExibirIndicadores();
    } catch (erro) {
        console.error("Erro ao calcular indicadores: ", erro);
    }
});

function calcularEExibirIndicadores() {
    // 1. Total de Alunos
    const dadosAlunos = JSON.parse(localStorage.getItem('fut10_alunos')) || [];
    document.getElementById('kpi-alunos').textContent = dadosAlunos.length;

    // 2. Alunos Inadimplentes
    const historicoFin = JSON.parse(localStorage.getItem('fut10_historico_financeiro')) || {};
    const mesAtualIndice = new Date().getMonth(); 
    let contagemInadimplentes = 0;

    dadosAlunos.forEach(aluno => {
        // Proteção: pula se o aluno não tiver data ou ID válidos
        if (!aluno || !aluno.dataMatricula || !aluno.id) return;
        
        let mesMat = 1; 
        
        try {
            if (aluno.dataMatricula.includes('-')) {
                const partes = aluno.dataMatricula.split('-');
                mesMat = Number(partes[1]);
            } else if (aluno.dataMatricula.includes('/')) {
                const partes = aluno.dataMatricula.split('/');
                mesMat = Number(partes[1]);
            }
        } catch (e) {
            return; // ignora falhas de conversão de data
        }
        
        const mesMatriculaIndice = mesMat - 1;

        if (mesAtualIndice >= mesMatriculaIndice) {
            const pagamentoEfetuado = historicoFin[aluno.id] && historicoFin[aluno.id][mesAtualIndice];
            if (!pagamentoEfetuado) {
                contagemInadimplentes++;
            }
        }
    });
    document.getElementById('kpi-inadimplentes').textContent = contagemInadimplentes;

    // 3. Itens a acabar na Cantina
    const dadosEstoque = JSON.parse(localStorage.getItem('fut10_estoque_cantina')) || [];
    const itensCriticos = dadosEstoque.filter(item => item && item.quantidade <= (item.minimo || 5)).length;
    document.getElementById('kpi-estoque').textContent = itensCriticos;
}

// Evento de Logout
document.getElementById('btn-sair')?.addEventListener('click', function() {
    localStorage.removeItem('fut10_usuario_logado');
    localStorage.removeItem('fut10_nome_exibicao');
    window.location.href = '../login/index.html';
});