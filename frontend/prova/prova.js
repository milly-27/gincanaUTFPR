// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentProvaId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('provaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const provasTableBody = document.getElementById('provasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de provas ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProvas();
    inicializarEstado();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarProva);
btnIncluir.addEventListener('click', incluirProva);
btnAlterar.addEventListener('click', alterarProva);
btnExcluir.addEventListener('click', excluirProva);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

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
    }, 3000);
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
    currentProvaId = null;
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

// Função para buscar prova por ID
async function buscarProva() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/provas/${id}`);

        if (response.ok) {
            const prova = await response.json();
            preencherFormulario(prova);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Prova encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Prova não encontrada. Você pode incluir uma nova prova.', 'info');
        } else {
            throw new Error('Erro ao buscar prova');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar prova', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(prova) {
    currentProvaId = prova.id;
    searchId.value = prova.id;
    document.getElementById('nome').value = prova.nome || '';
    document.getElementById('categoria').value = prova.categoria || '';
    document.getElementById('dia').value = prova.dia || '';
}

// Função para incluir prova
function incluirProva() {
    currentProvaId = searchId.value.trim();
    limparFormulario();
    searchId.value = currentProvaId;
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados da nova prova', 'info');
}

// Função para alterar prova
function alterarProva() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome').focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir prova
function excluirProva() {
    if (!confirm('Tem certeza que deseja excluir esta prova?')) {
        return;
    }
    
    currentProvaId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const prova = {
        id: searchId.value.trim(),
        nome: formData.get('nome'),
        categoria: formData.get('categoria'),
        dia: formData.get('dia')
    };

    // Validação
    if (operacao !== 'excluir') {
        if (!prova.nome) {
            mostrarMensagem('Nome da prova é obrigatório', 'error');
            return;
        }
        if (!prova.dia) {
            mostrarMensagem('Dia da semana é obrigatório', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/provas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prova)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/provas/${currentProvaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prova)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/provas/${currentProvaId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            mostrarMensagem(`Prova ${operacao === 'incluir' ? 'incluída' : operacao === 'alterar' ? 'alterada' : 'excluída'} com sucesso!`, 'success');
            limparFormulario();
            carregarProvas();
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

// Função para carregar lista de provas
async function carregarProvas() {
    try {
        const response = await fetch(`${API_BASE_URL}/provas`);
        
        if (response.ok) {
            const provas = await response.json();
            renderizarTabelaProvas(provas);
        } else {
            throw new Error('Erro ao carregar provas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de provas', 'error');
    }
}

// Função para renderizar tabela de provas
function renderizarTabelaProvas(provas) {
    provasTableBody.innerHTML = '';

    if (provas.length === 0) {
        provasTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhuma prova cadastrada</td></tr>';
        return;
    }

    provas.forEach(prova => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarProva(${prova.id})">
                    ${prova.id}
                </button>
            </td>
            <td>${prova.nome}</td>
            <td>${prova.categoria || '-'}</td>
            <td>${prova.dia}</td>
        `;
        provasTableBody.appendChild(row);
    });
}

// Função para selecionar prova da tabela
async function selecionarProva(id) {
    searchId.value = id;
    await buscarProva();
}