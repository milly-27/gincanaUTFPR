// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentProgramacaoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('programacaoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const programacoesTableBody = document.getElementById('programacoesTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de programações ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProgramacoes();
    inicializarEstado();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarProgramacao);
btnIncluir.addEventListener('click', incluirProgramacao);
btnAlterar.addEventListener('click', alterarProgramacao);
btnExcluir.addEventListener('click', excluirProgramacao);
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
    const inputs = form.querySelectorAll('input:not(#searchId), select, textarea');
    searchId.disabled = bloquearPrimeiro;
    
    inputs.forEach((input) => {
        input.disabled = !bloquearPrimeiro;
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentProgramacaoId = null;
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

// Função para buscar programação por ID
async function buscarProgramacao() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/programacoes/${id}`);

        if (response.ok) {
            const programacao = await response.json();
            preencherFormulario(programacao);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Programação encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Programação não encontrada. Você pode incluir uma nova programação.', 'info');
        } else {
            throw new Error('Erro ao buscar programação');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar programação', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(programacao) {
    currentProgramacaoId = programacao.id;
    searchId.value = programacao.id;
    document.getElementById('dia').value = programacao.dia || '';
    document.getElementById('descricao').value = programacao.descricao || '';
}

// Função para incluir programação
function incluirProgramacao() {
    currentProgramacaoId = searchId.value.trim();
    limparFormulario();
    searchId.value = currentProgramacaoId;
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('dia').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados da nova programação', 'info');
}

// Função para alterar programação
function alterarProgramacao() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('dia').focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir programação
function excluirProgramacao() {
    if (!confirm('Tem certeza que deseja excluir esta programação?')) {
        return;
    }
    
    currentProgramacaoId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const programacao = {
        id: searchId.value.trim(),
        dia: formData.get('dia'),
        descricao: formData.get('descricao')
    };

    // Validação
    if (operacao !== 'excluir') {
        if (!programacao.dia) {
            mostrarMensagem('Dia da semana é obrigatório', 'error');
            return;
        }
        if (!programacao.descricao) {
            mostrarMensagem('Descrição é obrigatória', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/programacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(programacao)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/programacoes/${currentProgramacaoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(programacao)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/programacoes/${currentProgramacaoId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            mostrarMensagem(`Programação ${operacao === 'incluir' ? 'incluída' : operacao === 'alterar' ? 'alterada' : 'excluída'} com sucesso!`, 'success');
            limparFormulario();
            carregarProgramacoes();
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

// Função para carregar lista de programações
async function carregarProgramacoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/programacoes`);
        
        if (response.ok) {
            const programacoes = await response.json();
            renderizarTabelaProgramacoes(programacoes);
        } else {
            throw new Error('Erro ao carregar programações');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de programações', 'error');
    }
}

// Função para renderizar tabela de programações
function renderizarTabelaProgramacoes(programacoes) {
    programacoesTableBody.innerHTML = '';

    if (programacoes.length === 0) {
        programacoesTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma programação cadastrada</td></tr>';
        return;
    }

    programacoes.forEach(programacao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarProgramacao(${programacao.id})">
                    ${programacao.id}
                </button>
            </td>
            <td>${programacao.dia}</td>
            <td class="descricao-cell">${programacao.descricao}</td>
        `;
        programacoesTableBody.appendChild(row);
    });
}

// Função para selecionar programação da tabela
async function selecionarProgramacao(id) {
    searchId.value = id;
    await buscarProgramacao();
}