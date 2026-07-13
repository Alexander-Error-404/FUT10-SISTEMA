let alunos = JSON.parse(localStorage.getItem('fut10_alunos')) || [];
let fotoBase64 = "";

// Função auxiliar para calcular diferença de dias
function calcularDiasDesde(dataString) {
    if (!dataString) return 999; 
    const dataPassada = new Date(dataString);
    const hoje = new Date();
    dataPassada.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);
    const diferencaTempo = hoje.getTime() - dataPassada.getTime();
    return Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));
}

// Determina dinamicamente o status do aluno baseado nas presenças
function obterStatusAluno(aluno) {
    const diasSemPresenca = calcularDiasDesde(aluno.ultimaPresenca || aluno.matricula);
    return diasSemPresenca >= 30 ? 'INATIVO' : 'ATIVO';
}

// Verifica a quantidade de alunos ativos em uma determinada turma
function contarAtivosNaTurma(nomeTurma, idIgnorar = "") {
    const turmaLimpa = nomeTurma.trim().toUpperCase();
    return alunos.filter(a => {
        if (a.id === idIgnorar) return false;
        return a.turma.trim().toUpperCase() === turmaLimpa && obterStatusAluno(a) === 'ATIVO';
    }).length;
}

// Atualiza o combobox de filtro de turmas automaticamente
function atualizarFiltroTurmas() {
    const filtroTurma = document.getElementById('filtro-turma-busca');
    if (!filtroTurma) return;
    
    const valorAtual = filtroTurma.value;
    filtroTurma.innerHTML = '<option value="">Selecione uma turma...</option>';
    
    const turmasUnicas = [...new Set(alunos.map(a => a.turma.trim().toUpperCase()))].sort();
    
    turmasUnicas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma;
        option.textContent = turma;
        filtroTurma.appendChild(option);
    });
    
    filtroTurma.value = valorAtual;
}

// Renderiza os cards aplicando todos os filtros (inclusive o de estrelas completo)
function renderizarAlunos() {
    const lista = document.getElementById('alunos-lista');
    if (!lista) return;
    lista.innerHTML = '';

    const buscaNome = document.getElementById('busca-nome')?.value.toLowerCase() || '';
    const filtroTurma = document.getElementById('filtro-turma-busca')?.value.toUpperCase() || '';
    const filtroStatus = document.getElementById('filtro-status-busca')?.value || '';
    const filtroHabilidade = document.getElementById('filtro-habilidade')?.value || '';

    const alunosFiltrados = alunos.filter(aluno => {
        const status = obterStatusAluno(aluno);
        const atendeNome = aluno.nome.toLowerCase().includes(buscaNome);
        const atendeTurma = filtroTurma === '' || aluno.turma.trim().toUpperCase() === filtroTurma;
        const atendeStatus = filtroStatus === '' || status === filtroStatus;
        
        let atendeHabilidade = true;
        if (filtroHabilidade !== '') {
            // Conta os caracteres corretos do array de strings de estrelas
            const numEstrelas = aluno.habilidade ? [...aluno.habilidade].length : 0;
            const metaEstrelas = parseInt(filtroHabilidade, 10);
            atendeHabilidade = (numEstrelas === metaEstrelas);
        }

        return atendeNome && atendeTurma && atendeStatus && atendeHabilidade;
    });

    if (alunosFiltrados.length === 0) {
        lista.innerHTML = '<p style="color: #fff; text-align: center; width: 100%; padding: 20px;">Nenhum aluno encontrado.</p>';
        return;
    }
    
    exibirCardsFiltrados(lista, alunosFiltrados);
}
// Gera o layout visual de cada card renderizado
function exibirCardsFiltrados(lista, alunosFiltrados) {
    alunosFiltrados.forEach(aluno => {
        const status = obterStatusAluno(aluno);
        const classeStatus = status === 'ATIVO' ? 'status-ativo' : 'status-inativo';
        const textoStatus = status === 'ATIVO' ? '🟢 ATIVO' : '🔴 INATIVO (30 dias s/ aula)';
        
        const card = document.createElement('div');
        card.className = 'aluno-card';
        card.innerHTML = `
            <div class="aluno-header">
                <div class="aluno-foto-perfil ${classeStatus}">${aluno.foto ? `<img src="${aluno.foto}">` : '👦'}</div>
                <div class="aluno-titulo">
                    <h4>${aluno.nome}</h4>
                    <span class="badge-categoria">Turma: ${aluno.turma.toUpperCase()} (${aluno.frequencia || '1x na semana'}) - ${aluno.idade}</span>
                </div>
                <div class="aluno-estrelas">${aluno.habilidade}</div>
            </div>
            <div class="aluno-detalhes">
                <p><strong>Situação:</strong> <span style="font-weight:bold;">${textoStatus}</span></p>
                <p><strong>Posição:</strong> ${aluno.posicao} | <strong>Retirada:</strong> ${aluno.retirada}</p>
                <p><strong>Horário:</strong> ${aluno.horario || 'Não Informado'}</p>
                <p><strong>Matrícula:</strong> ${aluno.matricula.split('-').reverse().join('/')}</p>
            </div>
            <div class="aluno-acoes">
                <a href="tel:${aluno.emergencia.replace(/\D/g,'')}" class="btn-acao btn-ligar">📞 Emergência</a>
                <button class="btn-acao btn-editar" onclick="editarAluno('${aluno.id}')">✏️</button>
                <button class="btn-acao btn-excluir" onclick="excluirAluno('${aluno.id}')">🗑️</button>
            </div>
        `;
        lista.appendChild(card);
    });
}

// Remove o aluno do sistema
function excluirAluno(id) {
    if (confirm("Deseja realmente excluir este aluno permanentemente?")) {
        alunos = alunos.filter(a => a.id !== id);
        localStorage.setItem('fut10_alunos', JSON.stringify(alunos));
        atualizarFiltroTurmas();
        renderizarAlunos();
    }
}

// Carrega a ficha do aluno selecionado para edição dentro do Modal
function editarAluno(id) {
    const aluno = alunos.find(a => a.id === id);
    if (!aluno) return;

    const status = obterStatusAluno(aluno);
    const inputStatus = document.getElementById('aluno-status-exibicao');
    if (inputStatus) {
        inputStatus.value = status;
        inputStatus.style.color = status === 'ATIVO' ? '#25d366' : '#ba181b';
    }

    document.getElementById('aluno-id').value = aluno.id;
    document.getElementById('aluno-nome').value = aluno.nome;
    document.getElementById('data-nasc').value = aluno.nascimento;
    document.getElementById('idade-aluno').value = aluno.idade;
    document.getElementById('aluno-turma').value = aluno.turma.toUpperCase();
    document.getElementById('aluno-frequencia').value = aluno.frequencia || '1x na semana';
    document.getElementById('select-habilidade').value = aluno.habilidade;
    document.getElementById('aluno-horario').value = aluno.horario || '';
    document.getElementById('aluno-posicao').value = aluno.posicao;
    document.getElementById('aluno-pe').value = aluno.pe || 'Destro';
    document.getElementById('aluno-camiseta').value = aluno.camiseta || '';
    document.getElementById('aluno-short').value = aluno.short || '';
    document.getElementById('aluno-meiao').value = aluno.meiao || '';
    document.getElementById('aluno-matricula').value = aluno.matricula;
    document.getElementById('aluno-cpf-crianca').value = aluno.cpfCrianca || '';
    document.getElementById('aluno-responsavel').value = aluno.responsavel;
    document.getElementById('aluno-cpf-resp').value = aluno.cpfResponsavel || '';
    document.getElementById('aluno-whatsapp').value = aluno.whatsapp;
    document.getElementById('aluno-emergencia').value = aluno.emergencia || '';
    document.getElementById('aluno-retirada').value = aluno.retirada;
    document.getElementById('tem-irmao').checked = aluno.temIrmao || false;
    document.getElementById('atestado-dia').checked = aluno.atestado;
    document.getElementById('uso-imagem').checked = aluno.imagem;
    document.getElementById('aluno-saude').value = aluno.saude || '';
    document.getElementById('aluno-alergias').value = aluno.alergias || '';
    document.getElementById('aluno-convenio').value = aluno.convenio || '';
    document.getElementById('aluno-carteirinha').value = aluno.carteirinha || '';

    const preview = document.getElementById('foto-preview');
    if (aluno.foto) {
        preview.innerHTML = `<img src="${aluno.foto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        fotoBase64 = aluno.foto;
    } else {
        preview.innerHTML = '📸';
        fotoBase64 = "";
    }
    document.getElementById('modal-aluno').style.display = 'flex';
}
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-aluno');
    const btnNovoAluno = document.getElementById('btn-novo-aluno');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    
    document.getElementById('busca-nome')?.addEventListener('input', renderizarAlunos);
    document.getElementById('filtro-turma-busca')?.addEventListener('change', renderizarAlunos);
    document.getElementById('filtro-status-busca')?.addEventListener('change', renderizarAlunos);
    document.getElementById('filtro-habilidade')?.addEventListener('change', renderizarAlunos);

    atualizarFiltroTurmas();
    renderizarAlunos();

    btnNovoAluno.addEventListener('click', () => {
        document.getElementById('formAluno').reset();
        document.getElementById('aluno-id').value = '';
        document.getElementById('aluno-status-exibicao').value = 'ATIVO';
        document.getElementById('aluno-status-exibicao').style.color = '#25d366';
        document.getElementById('foto-preview').innerHTML = '📸';
        fotoBase64 = "";
        modal.style.display = 'flex';
    });
    
    btnFecharModal.addEventListener('click', () => modal.style.display = 'none');

    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    document.getElementById('foto-aluno').addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoBase64 = e.target.result;
                document.getElementById('foto-preview').innerHTML = `<img src="${fotoBase64}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            }
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('data-nasc').addEventListener('change', function() {
        if (!this.value) return;
        const hoje = new Date();
        const nascimento = new Date(this.value);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        if (hoje.getMonth() - nascimento.getMonth() < 0 || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        document.getElementById('idade-aluno').value = idade + (idade === 1 ? " ano" : " anos");
    });

    document.getElementById('formAluno').addEventListener('submit', function(e) {
        e.preventDefault();
        const idExistente = document.getElementById('aluno-id').value;
        const turmaDigitada = document.getElementById('aluno-turma').value;
        
        const alunoAntigo = alunos.find(a => a.id === idExistente);
        const dataUltimaPresenca = alunoAntigo ? (alunoAntigo.ultimaPresenca || alunoAntigo.matricula) : document.getElementById('aluno-matricula').value;

        const objetoChecagem = { matricula: document.getElementById('aluno-matricula').value, ultimaPresenca: dataUltimaPresenca };
        
        if (obterStatusAluno(objetoChecagem) === 'ATIVO') {
            const totalAtivos = contarAtivosNaTurma(turmaDigitada, idExistente);
            if (totalAtivos >= 20) {
                alert(`⚠️ Impossível salvar! A turma ${turmaDigitada.toUpperCase()} já atingiu o limite de 20 ativos.`);
                return;
            }
        }
        
        const dadosAluno = {
            id: idExistente || Date.now().toString(),
            nome: document.getElementById('aluno-nome').value,
            nascimento: document.getElementById('data-nasc').value,
            idade: document.getElementById('idade-aluno').value,
            turma: turmaDigitada,
            frequencia: document.getElementById('aluno-frequencia').value,
            habilidade: document.getElementById('select-habilidade').value,
            horario: document.getElementById('aluno-horario').value,
            posicao: document.getElementById('aluno-posicao').value,
            pe: document.getElementById('aluno-pe').value,
            camiseta: document.getElementById('aluno-camiseta').value,
            short: document.getElementById('aluno-short').value,
            meiao: document.getElementById('aluno-meiao').value,
            matricula: document.getElementById('aluno-matricula').value,
            cpfCrianca: document.getElementById('aluno-cpf-crianca').value,
            responsavel: document.getElementById('aluno-responsavel').value,
            cpfResponsavel: document.getElementById('aluno-cpf-resp').value,
            whatsapp: document.getElementById('aluno-whatsapp').value,
            emergencia: document.getElementById('aluno-emergencia').value,
            retirada: document.getElementById('aluno-retirada').value,
            temIrmao: document.getElementById('tem-irmao').checked,
            atestado: document.getElementById('atestado-dia').checked,
            imagem: document.getElementById('uso-imagem').checked,
            saude: document.getElementById('aluno-saude').value,
            alergias: document.getElementById('aluno-alergias').value,
            convenio: document.getElementById('aluno-convenio').value,
            carteirinha: document.getElementById('aluno-carteirinha').value,
            foto: fotoBase64,
            ultimaPresenca: dataUltimaPresenca
        };

        if (idExistente) {
            const index = alunos.findIndex(a => a.id === idExistente);
            if (index !== -1) alunos[index] = dadosAluno;
        } else {
            alunos.push(dadosAluno);
        }

        localStorage.setItem('fut10_alunos', JSON.stringify(alunos));
        modal.style.display = 'none';
        atualizarFiltroTurmas();
        renderizarAlunos();
    });

    document.querySelectorAll('.mask-cpf').forEach(i => {
        i.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v.substring(0, 14);
        });
    });

    document.querySelectorAll('.mask-celular').forEach(i => {
        i.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
            e.target.value = v.substring(0, 15);
        });
    });

    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});