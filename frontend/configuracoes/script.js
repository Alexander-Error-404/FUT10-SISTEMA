// Chave única para armazenamento das regras fiscais e comerciais do FUT10
const CONFIG_KEY = 'fut10_configuracoes';

// Inicializa o sistema com todas as regras especificadas por você por padrão
let configuracoes = JSON.parse(localStorage.getItem(CONFIG_KEY)) || {
    mensalidade1xP1: "R$ 90,00",
    mensalidade2xP1: "R$ 150,00",
    mensalidade1xP2: "R$ 100,00",
    mensalidade2xP2: "R$ 160,00",
    mensalidade1xP3: "R$ 110,00",
    mensalidade2xP3: "R$ 170,00",
    descontoIrmao1x: "R$ 5,00",
    descontoIrmao2x: "R$ 10,00",
    uniformeVista: "R$ 130,00",
    uniformePrazo: "R$ 140,00",
    meiaoA: "R$ 40,00",
    meiaoB: "R$ 30,00",
    shortsA: "R$ 55,00",
    camisetaFut10: "R$ 65,00"
};

// Formata a digitação para o padrão monetário brasileiro em tempo real
function aplicarMascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor === "") {
        input.value = "";
        return;
    }
    let valorNumerico = (parseFloat(valor) / 100).toFixed(2);
    let valorFormatado = valorNumerico.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    input.value = "R$ " + valorFormatado;
}

// Preenche os inputs com as configurações em memória
function carregarCampos() {
    document.getElementById('mensalidade-1x-p1').value = configuracoes.mensalidade1xP1;
    document.getElementById('mensalidade-2x-p1').value = configuracoes.mensalidade2xP1;
    document.getElementById('mensalidade-1x-p2').value = configuracoes.mensalidade1xP2;
    document.getElementById('mensalidade-2x-p2').value = configuracoes.mensalidade2xP2;
    document.getElementById('mensalidade-1x-p3').value = configuracoes.mensalidade1xP3;
    document.getElementById('mensalidade-2x-p3').value = configuracoes.mensalidade2xP3;
    document.getElementById('desconto-irmao-1x').value = configuracoes.descontoIrmao1x;
    document.getElementById('desconto-irmao-2x').value = configuracoes.descontoIrmao2x;
    document.getElementById('uniforme-vista').value = configuracoes.uniformeVista;
    document.getElementById('uniforme-prazo').value = configuracoes.uniformePrazo;
    document.getElementById('meiao-a').value = configuracoes.meiaoA;
    document.getElementById('meiao-b').value = configuracoes.meiaoB;
    document.getElementById('shorts-a').value = configuracoes.shortsA;
    document.getElementById('camiseta-fut10').value = configuracoes.camisetaFut10;
}
document.addEventListener('DOMContentLoaded', () => {
    // Exibe os valores padrão ou salvos na tela
    carregarCampos();

    const form = document.getElementById('form-configuracoes');
    const todosInputsMoeda = document.querySelectorAll('.campo-moeda');

    // Aplica comportamento e máscaras interativas em todos os campos de valores
    todosInputsMoeda.forEach(input => {
        input.addEventListener('input', () => aplicarMascaraMoeda(input));
        
        // Insere R$ 0,00 se focado sem valor para guiar o usuário
        input.addEventListener('focus', () => {
            if (!input.value) input.value = "R$ 0,00";
        });
    });

    // Processamento e persistência das regras do FUT10 ao salvar
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const novasConfiguracoes = {
            mensalidade1xP1: document.getElementById('mensalidade-1x-p1').value || "R$ 0,00",
            mensalidade2xP1: document.getElementById('mensalidade-2x-p1').value || "R$ 0,00",
            mensalidade1xP2: document.getElementById('mensalidade-1x-p2').value || "R$ 0,00",
            mensalidade2xP2: document.getElementById('mensalidade-2x-p2').value || "R$ 0,00",
            mensalidade1xP3: document.getElementById('mensalidade-1x-p3').value || "R$ 0,00",
            mensalidade2xP3: document.getElementById('mensalidade-2x-p3').value || "R$ 0,00",
            descontoIrmao1x: document.getElementById('desconto-irmao-1x').value || "R$ 0,00",
            descontoIrmao2x: document.getElementById('desconto-irmao-2x').value || "R$ 0,00",
            uniformeVista: document.getElementById('uniforme-vista').value || "R$ 0,00",
            uniformePrazo: document.getElementById('uniforme-prazo').value || "R$ 0,00",
            meiaoA: document.getElementById('meiao-a').value || "R$ 0,00",
            meiaoB: document.getElementById('meiao-b').value || "R$ 0,00",
            shortsA: document.getElementById('shorts-a').value || "R$ 0,00",
            camisetaFut10: document.getElementById('camiseta-fut10').value || "R$ 0,00"
        };

        // Grava no localStorage para as demais telas (mensalidades, caixa) consumirem dinamicamente
        localStorage.setItem(CONFIG_KEY, JSON.stringify(novasConfiguracoes));
        configuracoes = novasConfiguracoes;

        alert('⚡ Configurações do FUT10 salvas com sucesso! Os novos valores e prazos já estão em vigor.');
    });
});