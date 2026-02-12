// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentCargoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('cargoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const cargosTableBody = document.getElementById('cargosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de cargos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarCargos();
    inicializarEstado();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarCargo);
btnIncluir.addEventListener('click', incluirCargo);
btnAlterar.addEventListener('click', alterarCargo);
btnExcluir.addEventListener('click', excluirCargo);
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
    currentCargoId = null;
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

// Função para buscar cargo por ID
async function buscarCargo() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cargos/${id}`);

        if (response.ok) {
            const cargo = await response.json();
            preencherFormulario(cargo);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Cargo encontrado!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Cargo não encontrado. Você pode incluir um novo cargo.', 'info');
        } else {
            throw new Error('Erro ao buscar cargo');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar cargo', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(cargo) {
    currentCargoId = cargo.id_cargo;
    searchId.value = cargo.id_cargo;
    document.getElementById('nome_cargo').value = cargo.nome_cargo || '';
}

// Função para incluir cargo
function incluirCargo() {
    currentCargoId = searchId.value.trim();
    limparFormulario();
    searchId.value = currentCargoId;
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_cargo').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados do novo cargo', 'info');
}

// Função para alterar cargo
function alterarCargo() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_cargo').focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir cargo
function excluirCargo() {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) {
        return;
    }
    
    currentCargoId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const cargo = {
        id_cargo: searchId.value.trim(),
        nome_cargo: formData.get('nome_cargo')
    };

    // Validação
    if (!cargo.nome_cargo && operacao !== 'excluir') {
        mostrarMensagem('Nome do cargo é obrigatório', 'error');
        return;
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/cargos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cargo)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/cargos/${currentCargoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cargo)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/cargos/${currentCargoId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            mostrarMensagem(`Cargo ${operacao === 'incluir' ? 'incluído' : operacao === 'alterar' ? 'alterado' : 'excluído'} com sucesso!`, 'success');
            limparFormulario();
            carregarCargos();
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

// Função para carregar lista de cargos
async function carregarCargos() {
    try {
        const response = await fetch(`${API_BASE_URL}/cargos`);
        
        if (response.ok) {
            const cargos = await response.json();
            renderizarTabelaCargos(cargos);
        } else {
            throw new Error('Erro ao carregar cargos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de cargos', 'error');
    }
}

// Função para renderizar tabela de cargos
function renderizarTabelaCargos(cargos) {
    cargosTableBody.innerHTML = '';

    if (cargos.length === 0) {
        cargosTableBody.innerHTML = '<tr><td colspan="2" style="text-align: center;">Nenhum cargo cadastrado</td></tr>';
        return;
    }

    cargos.forEach(cargo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarCargo(${cargo.id_cargo})">
                    ${cargo.id_cargo}
                </button>
            </td>
            <td>${cargo.nome_cargo}</td>
        `;
        cargosTableBody.appendChild(row);
    });
}

// Função para selecionar cargo da tabela
async function selecionarCargo(id) {
    searchId.value = id;
    await buscarCargo();
}