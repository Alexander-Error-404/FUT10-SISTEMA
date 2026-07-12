// 1. Verificação de Segurança Absoluta (Apenas Alessandra)
const usuarioLogado = localStorage.getItem('fut10_usuario_logado');
if (usuarioLogado !== 'alessandra') {
    document.getElementById('conteudo-pagina').style.display = 'none';
    document.getElementById('bloqueio-acesso').style.display = 'block';
}

// 2. Banco de Dados Local (Alunos e Histórico Financeiro)
let alunos = JSON.parse(localStorage.getItem('fut10_alunos')) || [];
let historicoFinanceiro = JSON.parse(localStorage.getItem('fut10_historico_financeiro')) || {};

// 3. Configuração de Valores Padrão (Conforme Regras A a D)
const configValoresPadrao = {
    mensalidade_1x: 100.00,
    mensalidade_2x: 150.00,
    desconto_irmao_1x: 15.00,
    desconto_irmao_2x: 25.00,
    // Taxas extras por atraso comercial de pagamento
    acrescimo_dias_16_20: 10.00,
    acrescimo_dias_21_30: 20.00
};

// Inicializa configurações no localStorage se não existirem
if (!localStorage.getItem('fut10_config_valores')) {
    localStorage.setItem('fut10_config_valores', JSON.stringify(configValoresPadrao));
}
const configValores = JSON.parse(localStorage.getItem('fut10_config_valores'));

// 4. Mapeamento de Meses do Ano Corrente (2026)
const MESES_NOMES = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

// 5. Elementos da Interface
const listaMensalidades = document.getElementById('lista-mensalidades');
const buscaAluno = document.getElementById('busca-aluno');
const filtroTurma = document.getElementById('filtro-turma');
const filtroStatus = document.getElementById('filtro-status');

// Elementos do Modal de Pagamento
const modalPagamento = document.getElementById('modal-pagamento');
const modalNomeAluno = document.getElementById('modal-nome-aluno');
const modalMesNome = document.getElementById('modal-mes-nome');
const modalRegra = document.getElementById('modal-regra');
const modalValor = document.getElementById('modal-valor');
const btnCancelar = document.getElementById('btn-cancelar-pagamento');
const btnConfirmar = document.getElementById('btn-confirmar-pagamento');

// Estado de controle do clique atual
let pagamentoPendente = null;
// 6. Motor Inteligente de Cálculo de Mensalidades (Regras A, B e C)
function calcularMensalidadeInformativa(aluno, diaDoMes) {
    let valorBase = 0;
    let desconto = 0;
    let acrescimo = 0;
    let justificativa = "";

    // Regra A: Frequência semanal
    const eDuasVezes = aluno.frequencia && aluno.frequencia.includes('2x');
    if (eDuasVezes) {
        valorBase = configValores.mensalidade_2x;
        justificativa += "Mensalidade 2x (R$ " + valorBase.toFixed(2) + ")";
    } else {
        valorBase = configValores.mensalidade_1x;
        justificativa += "Mensalidade 1x (R$ " + valorBase.toFixed(2) + ")";
    }

    // Regra B: Desconto para irmãos
    if (aluno.temIrmao) {
        desconto = eDuasVezes ? configValores.desconto_irmao_2x : configValores.desconto_irmao_1x;
        justificativa += " - Desconto Irmão (-R$ " + desconto.toFixed(2) + ")";
    }

    // Regra C: Janelas de Vencimento e Acréscimos por data
    if (diaDoMes <= 10) {
        justificativa += " [Pago até dia 10: Sem taxas]";
    } else if (diaDoMes >= 16 && diaDoMes <= 20) {
        acrescimo = configValores.acrescimo_dias_16_20;
        justificativa += " + Taxa Dias 16-20 (+R$ " + acrescimo.toFixed(2) + ")";
    } else if (diaDoMes >= 21 && diaDoMes <= 30) {
        acrescimo = configValores.acrescimo_dias_21_30;
        justificativa += " + Taxa Dias 21-30 (+R$ " + acrescimo.toFixed(2) + ")";
    } else {
        justificativa += " [Período padrão sem acréscimo extra]";
    }

    const valorFinal = valorBase - desconto + acrescimo;
    return {
        valor: Math.max(0, valorFinal),
        regra: justificativa
    };
}

// 7. Determina o Status Visual de cada Mês (Cinza, Vermelho, Amarelo, Verde)
function obterStatusMes(aluno, mesIndice) {
    // Se já está pago no histórico, é VERDE
    if (historicoFinanceiro[aluno.id] && historicoFinanceiro[aluno.id][mesIndice]) {
        return 'PAGO';
    }

    const hoje = new Date(); // Ano corrente: 2026
    const mesAtual = hoje.getMonth();

    // Regra de Matrícula: Analisa quando o aluno entrou
    const dataMatricula = new Date(aluno.matricula);
    const anoMatricula = dataMatricula.getFullYear();
    const mesMatricula = dataMatricula.getMonth();

    // Se a matrícula foi depois de 2026 ou o mês avaliado é anterior ao mês de entrada
    if (anoMatricula > 2026 || (anoMatricula === 2026 && mesIndice < mesMatricula)) {
        return 'PRE_MATRICULA'; // CINZA
    }

    // Se o mês avaliado é maior que o mês atual, é futuro
    if (mesIndice > mesAtual) {
        return 'FUTURO'; // AMARELO
    }

    // Se não caiu em nenhuma regra anterior e não está pago, está vencido
    return 'ATRASADO'; // VERMELHO
}
// 8. Determina a Situação Geral de Débito do Aluno (Regra de Inadimplência)
function obterSituacaoFinanceiraGeral(aluno) {
    // Regra F: Se o aluno está inativo na ficha técnica por 30 dias sem aula,
    // ele não deve sumir, mas mantemos o status limpo se não houver débitos pendentes.
    const hoje = new Date();
    const mesAtual = hoje.getMonth();

    // Varre todos os meses do início do ano até o mês corrente
    for (let m = 0; m <= mesAtual; m++) {
        const statusMes = obterStatusMes(aluno, m);
        // Se houver qualquer mês marcado como atrasado (vermelho), ele está inadimplente
        if (statusMes === 'ATRASADO') {
            return 'INADIMPLENTE';
        }
    }
    return 'EM_DIA';
}

// 9. Monta e Atualiza o Dropdown de Filtro de Turmas Dinamicamente
function atualizarFiltroTurmasFin() {
    if (!filtroTurma) return;
    const valorSelecionado = filtroTurma.value;
    
    // Limpa mantendo o padrão
    filtroTurma.innerHTML = '<option value="">Todas as Turmas</option>';
    
    // Filtra e ordena nomes únicos de turmas
    const turmasUnicas = [...new Set(alunos.map(a => a.turma.trim().toUpperCase()))].sort();
    
    turmasUnicas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma;
        option.textContent = `Turma: ${turma}`;
        filtroTurma.appendChild(option);
    });
    
    filtroTurma.value = valorSelecionado;
}

// Ouvintes de eventos para busca em tempo real e filtros do polegar
buscaAluno?.addEventListener('input', renderizarTelaFinanceira);
filtroTurma?.addEventListener('change', renderizarTelaFinanceira);
filtroStatus?.addEventListener('change', renderizarTelaFinanceira);
// 10. Renderiza os Cards Financeiros na Tela com Foco em Performance Mobile
function renderizarTelaFinanceira() {
    if (!listaMensalidades) return;
    listaMensalidades.innerHTML = '';

    const termoBusca = buscaAluno?.value.toLowerCase() || '';
    const turmaSelecionada = filtroTurma?.value.toUpperCase() || '';
    const statusSelecionado = filtroStatus?.value || '';

    const alunosFiltrados = alunos.filter(aluno => {
        const situacaoGeral = obterSituacaoFinanceiraGeral(aluno);
        const atendeNome = aluno.nome.toLowerCase().includes(termoBusca);
        const atendeTurma = !turmaSelecionada || aluno.turma.trim().toUpperCase() === turmaSelecionada;
        const atendeStatus = !statusSelecionado || situacaoGeral === statusSelecionado;

        return atendeNome && atendeTurma && atendeStatus;
    });

    if (alunosFiltrados.length === 0) {
        listaMensalidades.innerHTML = '<p style="text-align:center;padding:20px;color:#dae3ef;">Nenhum aluno encontrado nos filtros.</p>';
        return;
    }

    alunosFiltrados.forEach(aluno => {
        const situacaoGeral = obterSituacaoFinanceiraGeral(aluno);
        const classeStatusGeral = situacaoGeral === 'EM_DIA' ? 'status-em-dia' : 'status-inadimplente';
        const textoStatusGeral = situacaoGeral === 'EM_DIA' ? '🟢 EM DIA' : '🔴 PENDENTE';
        const numZap = aluno.whatsapp ? aluno.whatsapp.replace(/\D/g, '') : '';

        const card = document.createElement('div');
        card.className = 'aluno-card-financeiro';
        
        let htmlCard = `
            <div class="card-header">
                <div class="foto-perfil-fin">${aluno.foto ? `<img src="${aluno.foto}">` : '👦'}</div>
                <div class="info-principal">
                    <h4>${aluno.nome}</h4>
                    <span class="badge-turma-fin">Turma: ${aluno.turma.toUpperCase()}</span>
                </div>
                ${numZap ? `<a href="https://wa.me/55${numZap}?text=Olá!%20Aqui%20é%20da%20Escolinha%20FUT10.%20Gostaríamos%20de%20conversar%20sobre%20as%20mensalidades%20do(a)%20${encodeURIComponent(aluno.nome)}." target="_blank" class="btn-cobrar-whatsapp">💬</a>` : ''}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="status-geral-badge ${classeStatusGeral}">${textoStatusGeral}</span>
            </div>
            <div class="meses-grid-container">
                <div class="meses-linha">
        `;

        // Laço para gerar a barra horizontal dos 12 meses
        for (let m = 0; m < 12; m++) {
            const statusMes = obterStatusMes(aluno, m);
            let classeClasse = 'mes-pre-matricula';
            let textoBotao = MESES_NOMES[m];
            
            if (statusMes === 'PAGO') {
                classeClasse = 'mes-pago';
                textoBotao = '✓';
            } else if (statusMes === 'ATRASADO') {
                classeClasse = 'mes-atrasado';
            } else if (statusMes === 'FUTURO') {
                classeClasse = 'mes-futuro';
            }

            // Exibe o valor de referência base calculado (dia 10) abaixo do botão
            const calculoReferencia = calcularMensalidadeInformativa(aluno, 10);
            let subTexto = `R$ ${calculoReferencia.valor.toFixed(0)}`;

            if (statusMes === 'PAGO') {
                const dadosPagos = historicoFinanceiro[aluno.id][m];
                subTexto = `R$ ${dadosPagos.valor.toFixed(0)} PAGO`;
            } else if (statusMes === 'PRE_MATRICULA') {
                subTexto = '-';
            }

            htmlCard += `
                <div class="mes-bloco">
                    <button class="quadradinho-mes ${classeClasse}" ${statusMes === 'PRE_MATRICULA' ? 'disabled' : ''} onclick="abrirModalPagamento('${aluno.id}', ${m}, '${statusMes}')">${textoBotao}</button>
                    <span class="mes-subtexto">${MESES_NOMES[m]}<br>${subTexto}</span>
                </div>
            `;
        }

        htmlCard += `</div></div>`;
        card.innerHTML = htmlCard;
        listaMensalidades.appendChild(card);
    });
}
// 11. Controle do Modal de Pagamento e Registro no LocalStorage
function abrirModalPagamento(alunoId, mesIndice, statusAtual) {
    // Se o mês já estiver pago ou for pré-matrícula, bloqueia nova ação pelo clique
    if (statusAtual === 'PAGO' || statusAtual === 'PRE_MATRICULA') return;

    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    // Captura o dia atual da máquina no momento do recebimento (Regra C)
    const dataHoje = new Date();
    const diaDoMesAtual = dataHoje.getDate();

    // Executa o cálculo exato com base no dia do clique
    const calculo = calcularMensalidadeInformativa(aluno, diaDoMesAtual);

    // Guarda o estado global do pagamento que está sendo processado
    pagamentoPendente = {
        alunoId: alunoId,
        mesIndice: mesIndice,
        valor: calculo.valor,
        dataPagamento: dataHoje.toISOString().split('T')[0]
    };

    // Alimenta visualmente os campos do Modal
    modalNomeAluno.textContent = aluno.nome;
    modalMesNome.textContent = MESES_NOMES[mesIndice] + " / 2026";
    modalRegra.textContent = calculo.regra;
    modalValor.textContent = calculo.valor.toFixed(2);

    modalPagamento.style.display = 'flex';
}

// Salva permanentemente a baixa da mensalidade
btnConfirmar?.addEventListener('click', function() {
    if (!pagamentoPendente) return;

    const id = pagamentoPendente.alunoId;
    const mes = pagamentoPendente.mesIndice;

    // Inicializa a árvore de registros do aluno se não existir
    if (!historicoFinanceiro[id]) {
        historicoFinanceiro[id] = {};
    }

    // Grava as informações consolidadas da transação
    historicoFinanceiro[id][mes] = {
        valor: pagamentoPendente.valor,
        data: pagamentoPendente.dataPagamento
    };

    // Salva no LocalStorage e limpa o cache de controle
    localStorage.setItem('fut10_historico_financeiro', JSON.stringify(historicoFinanceiro));
    modalPagamento.style.display = 'none';
    pagamentoPendente = null;

    // Atualiza a tela em tempo real
    renderizarTelaFinanceira();
});

// Cancelamento e Fechamento do Modal
btnCancelar?.addEventListener('click', () => {
    modalPagamento.style.display = 'none';
    pagamentoPendente = null;
});

window.addEventListener('click', (e) => {
    if (e.target === modalPagamento) {
        modalPagamento.style.display = 'none';
        pagamentoPendente = null;
    }
});

// 12. Inicialização Automática da Página ao Carregar
document.addEventListener('DOMContentLoaded', function() {
    if (usuarioLogado === 'alessandra') {
        atualizarFiltroTurmasFin();
        renderizarTelaFinanceira();
    }
});