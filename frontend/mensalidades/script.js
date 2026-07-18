// =========================================================
// SISTEMA DE MENSALIDADES INTELIGENTES - FUT10 (PADRÃO PSG)
// =========================================================

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const STORAGE_ALUNOS = "fut10_alunos";
const STORAGE_CAIXA = "fut10_caixa";

let alunos = JSON.parse(localStorage.getItem(STORAGE_ALUNOS)) || [];
let caixa = JSON.parse(localStorage.getItem(STORAGE_CAIXA)) || [];

const gridAlunos = document.getElementById("lista-alunos");
const buscaInput = document.getElementById("busca-aluno");
const filtroTurma = document.getElementById("filtro-turma");
const filtroStatus = document.getElementById("filtro-status");
const modalAluno = document.getElementById("modal-aluno");
const modalPagamento = document.getElementById("modal-pagamento");
const formAluno = document.getElementById("form-aluno");
const formPagamento = document.getElementById("form-pagamento");

document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById(btn.dataset.modal).classList.remove("active");
    });
});

// Calcula o preço dinâmico do dia interpretando o formato do cadastro
function calcularValorEsperado(aluno, mesIndex) {
    const hoje = new Date();
    const diaAtual = hoje.getDate();
    
    // Identifica se o cadastro usa o texto longo ou o número isolado
    let freq = 1;
    const freqTexto = aluno.frequencia ? aluno.frequencia.toString().toLowerCase() : "";
    const turmaTexto = aluno.turma ? aluno.turma.toString().toLowerCase() : "";

    if (freqTexto.includes("2x") || turmaTexto.includes("2x") || freqTexto === "2") {
        freq = 2;
    }
    
    // Trata a marcação de irmão vinda dos dois formatos de tela
    const temIrmao = aluno.irmao === "sim" || aluno.temIrmao === true;
    let valorBase = 0;

    if (freq === 1) {
        if (diaAtual <= 10) valorBase = 90;
        else if (diaAtual <= 20) valorBase = 100;
        else valorBase = 110;
    } else { 
        if (diaAtual <= 10) valorBase = 150;
        else if (diaAtual <= 20) valorBase = 160;
        else valorBase = 170;
    }

    if (temIrmao) {
        const desconto = freq === 1 ? 5 : 10;
        valorBase = Math.max(0, valorBase - desconto);
    }

    return valorBase;
}
// Analisa a situação do aluno em um mês específico
function obterStatusMes(aluno, mesIndex) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    if (!aluno.matricula) {
        aluno.matricula = new Date().toISOString().split('T')[0];
    }

    let dataMat;
    if (aluno.matricula.includes('-')) {
        dataMat = new Date(aluno.matricula + 'T00:00:00');
    } else {
        const partes = aluno.matricula.split('/');
        dataMat = new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
    }

    const mesMatricula = dataMat.getMonth();
    const anoMatricula = dataMat.getFullYear();
    if (anoMatricula > anoAtual || (anoMatricula === anoAtual && mesIndex < mesMatricula)) {
        return { classe: "status-bloqueado", icone: "🔒", subtexto: "Não Matric.", clicavel: false, inadimplente: false };
    }

    const hist = aluno.historicoPagamentos ? aluno.historicoPagamentos[mesIndex] : null;

    if (hist && hist.status === "pago") {
        return { classe: "status-pago", icone: "✓", subtexto: `R$ ${hist.pago.toFixed(0)}`, clicavel: true, inadimplente: false };
    }

    if (hist && hist.status === "parcial") {
        const falta = hist.esperado - hist.pago;
        return { classe: "status-parcial", icone: "⚠️", subtexto: `Falta R$ ${falta.toFixed(0)}`, clicavel: true, inadimplente: true };
    }

    if (mesIndex > mesAtual) {
        return { classe: "status-futuro", icone: "⏳", subtexto: "Aguardando", clicavel: true, inadimplente: false };
    }

    const valorEsperado = calcularValorEsperado(aluno, mesIndex);
    return { classe: "status-aberto", icone: "✏️", subtexto: `R$ ${valorEsperado.toFixed(0)}`, clicavel: true, inadimplente: true };
}

// Determina se o aluno está devendo
function isAlunoInadimplente(aluno) {
    if (!aluno.historicoPagamentos) return false;
    for (let i = 0; i < 12; i++) {
        const status = obterStatusMes(aluno, i);
        if (status.inadimplente) return true;
    }
    return false;
}

function registrarNoCaixa(alunoNome, mesNome, valorPago) {
    const hoje = new Date();
    const novaTransacao = {
        id: Date.now().toString(),
        data: hoje.toISOString().split('T')[0],
        tipo: "entrada",
        categoria: "Mensalidade",
        descricao: `Mensalidade - ${alunoNome} (${mesNome})`,
        valor: parseFloat(valorPago),
        status: "confirmado"
    };

    caixa.push(novaTransacao);
    localStorage.setItem(STORAGE_CAIXA, JSON.stringify(caixa));
}

function salvarAlunos() {
    localStorage.setItem(STORAGE_ALUNOS, JSON.stringify(alunos));
}

// Renderizar Alunos na Tela com Filtros Corrigidos
function renderizarAlunos() {
    alunos = JSON.parse(localStorage.getItem(STORAGE_ALUNOS)) || [];
    gridAlunos.innerHTML = "";
    
    const termo = buscaInput.value.toLowerCase();
    const turmaFiltro = filtroTurma.value ? filtroTurma.value.toLowerCase() : "todos";
    const statusFiltro = filtroStatus.value;

    const filtrados = alunos.filter(aluno => {
        if (!aluno.historicoPagamentos) {
            aluno.historicoPagamentos = Array(12).fill(null).map(() => ({ pago: 0, esperado: 0, status: "aberto" }));
        }
        
        // ==================== CÓDIGO NOVO PARA COLOCAR NO LUGAR ====================
const freqTexto = aluno.frequencia ? aluno.frequencia.toString().toLowerCase() : "";
const turmaTexto = aluno.turma ? aluno.turma.toString().toLowerCase() : "";

if (freqTexto.includes("2x") || turmaTexto.includes("2x") || freqTexto === "2") {
    aluno.frequencia = "2";
} else {
    aluno.frequencia = "1";
}
// ===========================================================================

        const nomeAluno = aluno.nome ? aluno.nome.toLowerCase() : "";
        const atendeNome = nomeAluno.includes(termo);

        const stringTurma = aluno.turma ? aluno.turma.toLowerCase() : "";
        const stringFreq = aluno.frequencia ? aluno.frequencia.toString() : "";
        
        const atendeTurma = turmaFiltro === "todos" || 
                            turmaFiltro === "" || 
                            stringTurma.includes(turmaFiltro) || 
                            stringFreq === turmaFiltro;

        const atendeStatus = statusFiltro === "todos" || (statusFiltro === "inadimplentes" && isAlunoInadimplente(aluno));

        return atendeNome && atendeTurma && atendeStatus;
    });
    if (filtrados.length === 0) {
        gridAlunos.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">Nenhum aluno encontrado.</p>`;
        return;
    }

    filtrados.forEach(aluno => {
        const isInadimplente = isAlunoInadimplente(aluno);
        const card = document.createElement("div");
        card.className = `card-aluno ${isInadimplente ? 'inadimplente-border' : ''}`;

        const exibicaoFreq = (aluno.turma && aluno.turma.includes('2x')) || aluno.frequencia === "2" ? '2x' : '1x';

        let html = `
            <div class="card-header">
                <div class="info-aluno">
                    <h3>${aluno.nome || "Sem Nome"} ${isInadimplente ? '⚠️' : '✓'}</h3>
                    <p>${exibicaoFreq} na semana | Vencimento: Dia ${aluno.vencimento || 10} | Irmão: ${aluno.irmao === 'sim' ? 'SIM' : 'NÃO'}</p>
                    <p style="font-size:0.75rem; color:#94a3b8;">Matrícula: ${aluno.matricula.includes('-') ? aluno.matricula.split('-').reverse().join('/') : aluno.matricula}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="prepararEdicao('${aluno.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="excluirAluno('${aluno.id}')" style="background-color:#7f1d1d;"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="mensalidades-row">
        `;

        MESES.forEach((mes, index) => {
            const status = obterStatusMes(aluno, index);
            const acaoClique = status.clicavel ? `onclick="abrirPagamento('${aluno.id}', ${index})"` : "";

            html += `
                <div class="mes-box ${status.classe}" ${acaoClique}>
                    <span class="mes-nome">${mes}</span>
                    <span class="mes-status-icon">${status.icone}</span>
                    <span class="mes-subtext">${status.subtexto}</span>
                </div>
            `;
        });

        html += `</div>`;
        card.innerHTML = html;
        gridAlunos.appendChild(card);
    });
}

// Abrir Modal de Pagamento (Pop-up)
function abrirPagamento(alunoId, mesIndex) {
    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    const hist = aluno.historicoPagamentos ? aluno.historicoPagamentos[mesIndex] : null;
    const valorEsperadoHoje = calcularValorEsperado(aluno, mesIndex);

    document.getElementById("pay-aluno-id").value = alunoId;
    document.getElementById("pay-mes-index").value = mesIndex;
    document.getElementById("pay-aluno-nome").textContent = aluno.nome;
    document.getElementById("pay-mes-nome").textContent = MESES[mesIndex];

    const containerRegra = document.getElementById("pay-regra-aplicada");
    const inputValorReal = document.getElementById("pay-valor-real");
    const containerSugerido = document.getElementById("pay-valor-sugerido");

    if (hist && hist.status === "parcial") {
        const falta = hist.esperado - hist.pago;
        containerRegra.textContent = `PAGAMENTO PARCIAL: Já pago R$ ${hist.pago.toFixed(2)}.`;
        containerRegra.style.backgroundColor = "#451a03";
        containerRegra.style.color = "#fde68a";
        containerSugerido.textContent = `R$ ${falta.toFixed(2)}`;
        inputValorReal.value = falta.toFixed(2);
    } else {
        const freqTexto = (aluno.turma && aluno.turma.includes('2x')) || aluno.frequencia === "2" ? "2x" : "1x";
        const irmaoTexto = aluno.irmao === "sim" ? "com desconto" : "sem desconto";
        containerRegra.textContent = `Preço do dia: Treino ${freqTexto} (${irmaoTexto})`;
        containerRegra.style.backgroundColor = "#1e3a8a";
        containerRegra.style.color = "#93c5fd";
        containerSugerido.textContent = `R$ ${valorEsperadoHoje.toFixed(2)}`;
        inputValorReal.value = valorEsperadoHoje.toFixed(2);
    }

    modalPagamento.classList.add("active");
}
// Salvar Pagamento no Formulário do Modal
formPagamento.addEventListener("submit", (e) => {
    e.preventDefault();

    const alunoId = document.getElementById("pay-aluno-id").value;
    const mesIndex = parseInt(document.getElementById("pay-mes-index").value);
    const valorPagoInput = parseFloat(document.getElementById("pay-valor-real").value);

    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    if (!aluno.historicoPagamentos) {
        aluno.historicoPagamentos = Array(12).fill(null).map(() => ({ pago: 0, esperado: 0, status: "aberto" }));
    }

    let hist = aluno.historicoPagamentos[mesIndex];
    const valorEsperadoHoje = calcularValorEsperado(aluno, mesIndex);

    if (!hist) {
        hist = { pago: 0, esperado: 0, status: "aberto" };
        aluno.historicoPagamentos[mesIndex] = hist;
    }

    if (hist.status === "parcial") {
        hist.pago += valorPagoInput;
    } else {
        hist.esperado = valorEsperadoHoje;
        hist.pago = valorPagoInput;
    }

    if (hist.pago >= hist.esperado) {
        hist.status = "pago";
    } else {
        hist.status = "parcial";
    }

    salvarAlunos();
    registrarNoCaixa(aluno.nome, MESES[mesIndex], valorPagoInput);

    modalPagamento.classList.remove("active");
    renderizarAlunos();
});

// Eventos de Filtro imediato e inicialização
buscaInput.addEventListener("input", renderizarAlunos);
filtroTurma.addEventListener("change", renderizarAlunos);
filtroStatus.addEventListener("change", renderizarAlunos);

// Inicializa a tela desenhando os cards salvos
renderizarAlunos();