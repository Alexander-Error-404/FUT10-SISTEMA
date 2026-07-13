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
        document.querySelectorAll('.menu-vinicius').forEach(card => card.classList.add('ocultar'));
    } else if (usuarioLogado === 'vinicius') {
        document.querySelectorAll('.menu-alessandra').forEach(card => card.classList.add('ocultar'));
    }

    try {
        calcularEExibirIndicadores();
    } catch (erro) {
        console.error("Erro ao calcular indicadores: ", erro);
    }
});

// Calcula dias desde o último registro para checagem de inatividade
function diasSemAula(aluno) {
    const referencia = aluno.ultimaPresenca || aluno.matricula;
    if (!referencia) return 999;
    const dataPassada = new Date(referencia);
    const hoje = new Date();
    dataPassada.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    return Math.floor((hoje - dataPassada) / (1000 * 60 * 60 * 24));
}

function calcularEExibirIndicadores() {
    const dadosAlunos = JSON.parse(localStorage.getItem('fut10_alunos')) || [];
    document.getElementById('kpi-alunos').textContent = dadosAlunos.length;

    const historicoFin = JSON.parse(localStorage.getItem('fut10_historico_financeiro')) || {};
    const hoje = new Date();
    const mesAtualIndice = hoje.getMonth(); 
    const anoAtual = hoje.getFullYear();
    let contagemInadimplentes = 0;

    dadosAlunos.forEach(aluno => {
        if (!aluno || !aluno.matricula || !aluno.id) return;
        
        // Regra F: Se tiver 30 dias sem aula, o cadastro está inativo e não deve gerar cobrança nova
        if (diasSemAula(aluno) >= 30) return;

        // Analisa a data de matrícula do aluno
        let dataMat;
        if (aluno.matricula.includes('-')) {
            dataMat = new Date(aluno.matricula);
        } else if (aluno.matricula.includes('/')) {
            const partes = aluno.matricula.split('/');
            dataMat = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        } else {
            return;
        }

        const anoMatricula = dataMat.getFullYear();
        const mesMatricula = dataMat.getMonth();

        // Verifica os meses atrasados desde a data da matrícula até o mês corrente do ano atual
        for (let m = 0; m <= mesAtualIndice; m++) {
            if (anoMatricula > anoAtual || (anoMatricula === anoAtual && m < mesMatricula)) {
                continue; // Mês anterior à matrícula não gera inadimplência
            }

            // Verifica se este mês está quitado no histórico financeiro
            const pago = historicoFin[aluno.id] && historicoFin[aluno.id][m];
            if (!pago) {
                contagemInadimplentes++;
                break; // Se achou ao menos um mês atrasado, o aluno já é marcado como inadimplente
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