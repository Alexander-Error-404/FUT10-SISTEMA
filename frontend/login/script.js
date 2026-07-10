document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('msg-erro');
    
    const credenciais = {
        alessandra: "123",
        vinicius: "456"
    };

    if (credenciais[usuario] === senha) {
        localStorage.setItem('fut10_usuario_logado', usuario);
        localStorage.setItem('fut10_nome_exibicao', usuario === 'alessandra' ? 'Alessandra' : 'Vinícius');
        
        msgErro.style.display = 'none';
        
        // CORREÇÃO AQUI: Ambos vão para o Dashboard agora!
        window.location.href = '../dashboard/index.html'; 
    } else {
        msgErro.textContent = "Senha incorreta para o usuário selecionado.";
        msgErro.style.display = 'block';
    }
});