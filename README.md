# 📋 ROTEIRO DE DESENVOLVIMENTO – SISTEMA FUT10 (MOBILE-FIRST)

> **Objetivo:** Sistema leve focado 100% em uso por celular para escolinha de futebol infantil (Vinícius no campo) e cantina/financeiro (Alessandra). Hospedagem planejada na Hostinger com banco PostgreSQL.

---

## 📌 PASSO 1: O BANCO DE DADOS (`database/tabelas.sql`)
*Criar a estrutura no pgAdmin 4 garantindo que todas as tabelas se conversem pelo ID do aluno.*
- [ ] **Tabela `usuarios`:** Login e senha diferenciando os acessos (Irmã vs. Cunhado).
- [ ] **Tabela `alunos`:** Nome, idade, categoria (Sub-7 ao Sub-15), contatos dos pais (CPF/WhatsApp), tamanho do uniforme/chuteira, perna dominante (Destro/Canhoto), posição de ofício e nível de habilidade (1 a 5 estrelas).
- [ ] **Tabela `frequencias`:** Registro diário de presenças e faltas vinculadas à data e turma.
- [ ] **Tabela `produtos`:** Estoque do barzinho (bebidas, esfiha, pão de queijo) com quantidade atual e alerta de estoque mínimo.
- [ ] **Tabela `comandas`:** Registro de consumo "fiado" por aluno, com trava de limite mensal.
- [ ] **Tabela `financeiro`:** Controle de mensalidades por pacotes (Mensal, Trimestral, Anual) e cálculo de matrícula proporcional.

---

## 📌 PASSO 2: O BACKEND EM NODE.JS (`backend/`)
*Configurar o servidor que vai processar as regras inteligentes do negócio.*
- [ ] **`server.js` e Rotas:** Criar a API que conecta o banco de dados com as telas do celular.
- [ ] **Regra da Matrícula:** Algoritmo que calcula o valor da matrícula regressiva (Jan: R$150 -> Jul: R$75 -> Dez: R$0).
- [ ] **Regra do Sorteador Tático:** Algoritmo de sorteio que equilibra os times equilibrando o nível de habilidade, garantindo ao menos um goleiro e posicionando os canhotos no lado esquerdo do campo.
- [ ] **Regra de Evasão:** Alerta automático disparado ao backend quando o aluno acumular 3 faltas seguidas.
- [ ] **Importador/Backup:** Lógica para ler arquivos `.txt` do bloco de notas atual da sua irmã.

---

## 📌 PASSO 3: O FRONTEND - DESIGN MOBILE (`frontend/`)
*Criar as telas com foco em Mobile-First (botões grandes para os polegares, listas verticais em "cards" em vez de tabelas largas).*
- [ ] **`index.html` (Login):** Tela limpa de autenticação que redireciona o usuário baseado na sua permissão.
- [ ] **`barzinho.html` (Irmã):** Interface rápida no estilo Ponto de Venda (PDV) para abrir comanda do aluno, clicar nos botões dos salgados e exibir travas de limite de gasto e alertas de estoque baixo.
- [ ] **`alunos.html` (Ambos):** Formulário de matrícula simplificado para celular e lista de alunos exibida em formato de cartões (cards).
- [ ] **`financeiro.html` (Irmã):** A "lista de caloteiros" com sinalizadores de status visual (Verde/Amarelo/Vermelho) e relatórios divididos (Faturamento do Bar vs. Faturamento da Escolinha).
- [ ] **`chamada.html` (Cunhado):** Filtro por categoria com botões estilo interruptor (switch) bem grandes para o professor marcar presença caminhando no campo.
- [ ] **`treinos.html` (Cunhado):** O campo de futebol verde interativo usando tecnologia *Drag and Drop* para arrastar a foto das crianças para as posições com o dedo.

## 📌 PASSO 4: Focar primeiro no front-end (`frontend/`)
*Como eu estou fazendo um pouco e mostrando pra minha irmã se esta bom eu vou focar no frontend e usando o localstorage pra ver funcionando

## 📌 PASSO 5: ter uma tela de login (`frontend/`)
*Ter uma tela de login para escolher entre minha irmã (Alessandra) e meu cunhado (Vinícius)

## 📌 PASSO 6: Tudo separadinho (`frontend/`)
*Quero que cada aba seja dividido em um arquivo só pra html, outro só pra CSS e outro pra Javascript; usando sempre o localstorage. E quando for passar os códigos se a quantidade de linhas ultrapassar 100 divida. para sempre mandar 100 linhas de código ou menos.
