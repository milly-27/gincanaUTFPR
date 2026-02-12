// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentEquipeId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('equipeForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const equipesTableBody = document.getElementById('equipesTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de equipes ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarEquipes();
    inicializarEstado();
    configurarEventosInput();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarEquipe);
btnIncluir.addEventListener('click', incluirEquipe);
btnAlterar.addEventListener('click', alterarEquipe);
btnExcluir.addEventListener('click', excluirEquipe);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Configurar eventos de input
function configurarEventosInput() {
    // Forçar ID em maiúscula
    searchId.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
}

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
    currentEquipeId = null;
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

// Função para validar formato do ID
function validarFormatoId(id) {
    // Formato esperado: número + letra maiúscula (Ex: 1A, 2B, 3C)
    const regex = /^[0-9]+[A-Z]$/;
    return regex.test(id);
}

// Função para buscar equipe por ID
async function buscarEquipe() {
    const id = searchId.value.trim().toUpperCase();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    if (!validarFormatoId(id)) {
        mostrarMensagem('ID deve seguir o formato: número + letra maiúscula (Ex: 1A, 2B, 3C)', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/equipes/${id}`);

        if (response.ok) {
            const equipe = await response.json();
            preencherFormulario(equipe);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Equipe encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Equipe não encontrada. Você pode incluir uma nova.', 'info');
        } else {
            throw new Error('Erro ao buscar equipe');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar equipe', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(equipe) {
    currentEquipeId = equipe.id;
    searchId.value = equipe.id;
    document.getElementById('nome_lider').value = equipe.nome_lider || '';
    document.getElementById('nome_vice').value = equipe.nome_vice || '';
    document.getElementById('cor').value = equipe.cor || '';
    document.getElementById('quantidade_alunos').value = equipe.quantidade_alunos || '';
}

// Função para incluir equipe
function incluirEquipe() {
    const id = searchId.value.trim().toUpperCase();
    
    if (id && !validarFormatoId(id)) {
        mostrarMensagem('ID deve seguir o formato: número + letra maiúscula (Ex: 1A, 2B, 3C)', 'warning');
        return;
    }
    
    limparFormulario();
    searchId.value = id;
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_lider').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados da nova equipe', 'info');
}

// Função para alterar equipe
function alterarEquipe() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome_lider').focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir equipe
function excluirEquipe() {
    if (!confirm('Tem certeza que deseja excluir esta equipe?')) {
        return;
    }
    
    currentEquipeId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const id = searchId.value.trim().toUpperCase();
    
    const equipe = {
        id: id,
        nome_lider: formData.get('nome_lider'),
        nome_vice: formData.get('nome_vice'),
        cor: formData.get('cor'),
        quantidade_alunos: parseInt(formData.get('quantidade_alunos'))
    };

    // Validações
    if (operacao !== 'excluir') {
        if (!equipe.id) {
            mostrarMensagem('ID da equipe é obrigatório', 'error');
            return;
        }
        if (!validarFormatoId(equipe.id)) {
            mostrarMensagem('ID deve seguir o formato: número + letra maiúscula (Ex: 1A, 2B, 3C)', 'error');
            return;
        }
        if (!equipe.nome_lider) {
            mostrarMensagem('Nome do líder é obrigatório', 'error');
            return;
        }
        if (!equipe.nome_vice) {
            mostrarMensagem('Nome do vice é obrigatório', 'error');
            return;
        }
        if (!equipe.cor) {
            mostrarMensagem('Cor da equipe é obrigatória', 'error');
            return;
        }
        if (!equipe.quantidade_alunos || equipe.quantidade_alunos <= 0) {
            mostrarMensagem('Quantidade de alunos deve ser maior que zero', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/equipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipe)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/equipes/${currentEquipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipe)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/equipes/${currentEquipeId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            const operacaoTexto = operacao === 'incluir' ? 'incluída' : 
                                  operacao === 'alterar' ? 'alterada' : 'excluída';
            mostrarMensagem(`Equipe ${operacaoTexto} com sucesso!`, 'success');
            limparFormulario();
            carregarEquipes();
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

// Função para carregar lista de equipes
async function carregarEquipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/equipes`);
        
        if (response.ok) {
            const equipes = await response.json();
            renderizarTabelaEquipes(equipes);
        } else {
            throw new Error('Erro ao carregar equipes');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de equipes', 'error');
    }
}

// Função para renderizar tabela de equipes
function renderizarTabelaEquipes(equipes) {
    equipesTableBody.innerHTML = '';

    if (equipes.length === 0) {
        equipesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma equipe cadastrada</td></tr>';
        return;
    }

    equipes.forEach(equipe => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarEquipe('${equipe.id}')">
                    ${equipe.id}
                </button>
            </td>
            <td>${equipe.nome_lider}</td>
            <td>${equipe.nome_vice}</td>
            <td>
                <span class="color-badge" style="background-color: ${equipe.cor}; color: ${getContrastColor(equipe.cor)};">
                    ${equipe.cor}
                </span>
            </td>
            <td style="text-align: center;">${equipe.quantidade_alunos}</td>
        `;
        equipesTableBody.appendChild(row);
    });
}

// Função para obter cor de contraste para o texto
function getContrastColor(hexColor) {
    // Remover # se existir
    hexColor = hexColor.replace('#', '');
    
    // Converter para RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calcular luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retornar branco ou preto baseado na luminosidade
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// Função para selecionar equipe da tabela
async function selecionarEquipe(id) {
    searchId.value = id;
    await buscarEquipe();
}