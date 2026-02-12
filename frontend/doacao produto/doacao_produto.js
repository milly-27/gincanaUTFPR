// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentDoacaoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('doacaoProdutoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const doacoesProdutosTableBody = document.getElementById('doacoesProdutosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Selects
const equipeSelect = document.getElementById('equipe_id');
const produtoSelect = document.getElementById('produto_id');

// Carregar dados ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarDoacoesProdutos();
    carregarEquipes();
    carregarProdutos();
    inicializarEstado();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarDoacaoProduto);
btnIncluir.addEventListener('click', incluirDoacaoProduto);
btnAlterar.addEventListener('click', alterarDoacaoProduto);
btnExcluir.addEventListener('click', excluirDoacaoProduto);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Calcular pontos automaticamente ao alterar quantidade
document.getElementById('quantidade').addEventListener('input', calcularPontos);
produtoSelect.addEventListener('change', calcularPontos);

// Inicializar estado da interface
function inicializarEstado() {
    mostrarBotoes(true, false, false, false, false, false);
    bloquearCampos(false);
    searchId.focus();
}

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 4000);
}

// Função para bloquear/desbloquear campos
function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input:not(#searchId), select');
    searchId.disabled = bloquearPrimeiro;
    
    inputs.forEach((input) => {
        input.disabled = !bloquearPrimeiro;
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentDoacaoId = null;
}

// Função para mostrar/ocultar botões
function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para carregar equipes
async function carregarEquipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/equipes`);
        if (response.ok) {
            const equipes = await response.json();
            equipeSelect.innerHTML = '<option value="">Selecione uma equipe</option>';
            equipes.forEach(equipe => {
                equipeSelect.innerHTML += `<option value="${equipe.id}">${equipe.id} - ${equipe.nome}</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        mostrarMensagem('Erro ao carregar equipes', 'error');
    }
}

// Função para carregar produtos
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        if (response.ok) {
            const produtos = await response.json();
            produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
            produtos.forEach(produto => {
                const pontos = produto.pontos || 0;
                produtoSelect.innerHTML += `<option value="${produto.id}" data-pontos="${pontos}">${produto.nome} (${pontos} pts)</option>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        mostrarMensagem('Erro ao carregar produtos', 'error');
    }
}

// Função para calcular pontos totais
function calcularPontos() {
    const quantidade = parseInt(document.getElementById('quantidade').value) || 0;
    const selectedOption = produtoSelect.options[produtoSelect.selectedIndex];
    const pontosPorProduto = parseInt(selectedOption.getAttribute('data-pontos')) || 0;
    
    const pontosTotal = quantidade * pontosPorProduto;
    document.getElementById('pontos_total').value = pontosTotal;
}

// Função para buscar doação de produto por ID
async function buscarDoacaoProduto() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/doacoes-produtos/${id}`);

        if (response.ok) {
            const doacaoProduto = await response.json();
            preencherFormulario(doacaoProduto);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Doação de produto encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Doação não encontrada. Você pode incluir uma nova.', 'info');
        } else {
            throw new Error('Erro ao buscar doação de produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar doação de produto', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(doacaoProduto) {
    currentDoacaoId = doacaoProduto.id;
    searchId.value = doacaoProduto.id;
    equipeSelect.value = doacaoProduto.equipe_id || '';
    produtoSelect.value = doacaoProduto.produto_id || '';
    document.getElementById('quantidade').value = doacaoProduto.quantidade || '';
    document.getElementById('pontos_total').value = doacaoProduto.pontos_total || '';
}

// Função para incluir doação de produto
function incluirDoacaoProduto() {
    limparFormulario();
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    equipeSelect.focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados da nova doação', 'info');
}

// Função para alterar doação de produto
function alterarDoacaoProduto() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    equipeSelect.focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir doação de produto
function excluirDoacaoProduto() {
    if (!confirm('Tem certeza que deseja excluir esta doação de produto?')) {
        return;
    }
    
    currentDoacaoId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const doacaoProduto = {
        equipe_id: formData.get('equipe_id'),
        produto_id: parseInt(formData.get('produto_id')),
        quantidade: parseInt(formData.get('quantidade')),
        pontos_total: parseInt(formData.get('pontos_total'))
    };

    // Validações
    if (operacao !== 'excluir') {
        if (!doacaoProduto.equipe_id) {
            mostrarMensagem('Selecione uma equipe', 'error');
            return;
        }
        if (!doacaoProduto.produto_id) {
            mostrarMensagem('Selecione um produto', 'error');
            return;
        }
        if (!doacaoProduto.quantidade || doacaoProduto.quantidade <= 0) {
            mostrarMensagem('Quantidade deve ser maior que zero', 'error');
            return;
        }
        if (isNaN(doacaoProduto.pontos_total) || doacaoProduto.pontos_total < 0) {
            mostrarMensagem('Pontos total inválido', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/doacoes-produtos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(doacaoProduto)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/doacoes-produtos/${currentDoacaoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(doacaoProduto)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/doacoes-produtos/${currentDoacaoId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            const operacaoTexto = operacao === 'incluir' ? 'incluída' : 
                                  operacao === 'alterar' ? 'alterada' : 'excluída';
            mostrarMensagem(`Doação de produto ${operacaoTexto} com sucesso!`, 'success');
            limparFormulario();
            carregarDoacoesProdutos();
            inicializarEstado();
        } else {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao realizar operação', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao realizar operação', 'error');
    }
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    inicializarEstado();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de doações de produtos
async function carregarDoacoesProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/doacoes-produtos`);
        
        if (response.ok) {
            const doacoesProdutos = await response.json();
            renderizarTabelaDoacoesProdutos(doacoesProdutos);
        } else {
            throw new Error('Erro ao carregar doações de produtos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de doações de produtos', 'error');
    }
}

// Função para renderizar tabela de doações de produtos
function renderizarTabelaDoacoesProdutos(doacoesProdutos) {
    doacoesProdutosTableBody.innerHTML = '';

    if (doacoesProdutos.length === 0) {
        doacoesProdutosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma doação cadastrada</td></tr>';
        return;
    }

    doacoesProdutos.forEach(doacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarDoacaoProduto(${doacao.id})">
                    ${doacao.id}
                </button>
            </td>
            <td>${doacao.equipe_id} - ${doacao.equipe_nome || 'N/A'}</td>
            <td>${doacao.produto_nome || 'N/A'}</td>
            <td>${doacao.quantidade}</td>
            <td>${doacao.pontos_total}</td>
        `;
        doacoesProdutosTableBody.appendChild(row);
    });
}

// Função para selecionar doação de produto da tabela
async function selecionarDoacaoProduto(id) {
    searchId.value = id;
    await buscarDoacaoProduto();
}