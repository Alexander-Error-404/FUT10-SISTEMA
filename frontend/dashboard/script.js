document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = localStorage.getItem('fut10_usuario_logado');
    const nomeExibicao = localStorage.getItem('fut10_nome_exibicao');

    if (!usuarioLogado || !nomeExibicao) {
        window.location.href = '../login/index.html';
        return;
    }

    document.getElementById('nome-usuario').textContent = nomeExibicao;

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

function diasSemAula(aluno) {
    const referencia = aluno.ultimaPresenca || aluno.matricula;
    if (!referencia) return 999;
    const dataPassada = new Date(referencia + 'T00:00:00');
    const hoje = new Date();
    dataPassada.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    return Math.floor((hoje - dataPassada) / (1000 * 60 * 60 * 24));
}

function calcularEExibirIndicadores() {
    const dadosAlunos = JSON.parse(localStorage.getItem('fut10_alunos')) || [];
    document.getElementById('kpi-alunos').textContent = dadosAlunos.length;

    const hoje = new Date();
    const mesAtualIndice = hoje.getMonth(); 
    const anoAtual = hoje.getFullYear();
    let contagemInadimplentes = 0;

    dadosAlunos.forEach(aluno => {
        if (!aluno || !aluno.id) return;
        
        // Aluno inativo não conta como inadimplente ativo
        if (diasSemAula(aluno) >= 30) return;

        // Se o histórico não existe, inicializa para não quebrar o dashboard
        const histPagamentos = aluno.historicoPagamentos || Array(12).fill(null).map(() => ({ pago: 0, esperado: 0, status: "aberto" }));

        let dataMat;
        if (aluno.matricula) {
            if (aluno.matricula.includes('-')) {
                dataMat = new Date(aluno.matricula + 'T00:00:00');
            } else {
                const partes = aluno.matricula.split('/');
                dataMat = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
            }
        } else {
            dataMat = new Date(); // assume hoje se não tiver
        }

        const anoMatricula = dataMat.getFullYear();
        const mesMatricula = dataMat.getMonth();

        // Checar do mês de matrícula até o mês atual por inadimplências
        for (let m = 0; m <= mesAtualIndice; m++) {
            // Se o mês m analisado for anterior à data em que o aluno se matriculou, não conta
            if (anoMatricula > anoAtual || (anoMatricula === anoAtual && m < mesMatricula)) {
                continue; 
            }

            const hist = histPagamentos[m];
            
            // É inadimplente se está totalmente em aberto, ou se pagou de forma "parcial" (o caso dos pais folgados)
            if (!hist || hist.status === "aberto" || hist.status === "parcial") {
                contagemInadimplentes++;
                break; // Se encontrou uma pendência em qualquer mês válido, ele é inadimplente geral
            }
        }
    });
    
    document.getElementById('kpi-inadimplentes').textContent = contagemInadimplentes;

    // Cantina
    const dadosEstoque = JSON.parse(localStorage.getItem('fut10_estoque_cantina')) || [];
    const itensCriticos = dadosEstoque.filter(item => item && item.quantidade <= (item.minimo || 5)).length;
    document.getElementById('kpi-estoque').textContent = itensCriticos;
}

document.getElementById('btn-sair')?.addEventListener('click', function() {
    localStorage.removeItem('fut10_usuario_logado');
    localStorage.removeItem('fut10_nome_exibicao');
    window.location.href = '../login/index.html';
});