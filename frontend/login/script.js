document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('msg-erro');
    
    // Credenciais temporárias baseadas no LocalStorage para testes locais
    const credenciais = {
        alessandra: "123",
        vinicius: "456"
    };

    if (credenciais[usuario] === senha) {
        // Grava sessão fictícia no navegador
        localStorage.setItem('fut10_usuario_logado', usuario);
        localStorage.setItem('fut10_nome_exibicao', usuario === 'alessandra' ? 'Alessandra' : 'Vinícius');
        
        msgErro.style.display = 'none';
        
        // Encaminhamento dinâmico baseado em quem entrou
        if (usuario === 'alessandra') {
            window.location.href = '../barzinho/index.html'; 
        } else {
            window.location.href = '../chamada/index.html';
        }
    } else {
        msgErro.textContent = "Senha incorreta para o usuário selecionado.";
        msgErro.style.display = 'block';
    }
});