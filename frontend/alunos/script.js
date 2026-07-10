document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal-aluno');
    const btnNovoAluno = document.getElementById('btn-novo-aluno');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const inputDataNasc = document.getElementById('data-nasc');
    const inputIdade = document.getElementById('idade-aluno');
    const fotoInput = document.getElementById('foto-aluno');
    const fotoPreview = document.getElementById('foto-preview');

    btnNovoAluno.addEventListener('click', () => modal.style.display = 'flex');
    btnFecharModal.addEventListener('click', () => modal.style.display = 'none');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // SISTEMA DE UPLOAD E PRÉ-VISUALIZAÇÃO DA FOTO
    fotoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                fotoPreview.innerHTML = `<img src="${e.target.result}">`;
                document.getElementById('preview-card-foto').innerHTML = `<img src="${e.target.result}">`;
            }
            reader.readAsDataURL(file);
        }
    });

    inputDataNasc.addEventListener('change', function() {
        if (!this.value) return;
        const hoje = new Date();
        const nascimento = new Date(this.value);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        if (hoje.getMonth() - nascimento.getMonth() < 0 || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        inputIdade.value = idade + (idade === 1 ? " ano" : " anos");
    });

    // MÁSCARAS DE DIGITAÇÃO AUTOMÁTICA
    document.querySelectorAll('.mask-cpf').forEach(input => {
        input.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v.substring(0, 14);
        });
    });

    document.querySelectorAll('.mask-celular').forEach(input => {
        input.addEventListener('input', e => {
            let v = e.target.value.replace(/\D/g, "");
            v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
            v = v.replace(/(\d{5})(\d)/, "$1-$2");
            e.target.value = v.substring(0, 15);
        });
    });

    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});