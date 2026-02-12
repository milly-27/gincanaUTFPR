// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentResultadoId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('resultadoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const resultadosTableBody = document.getElementById('resultadosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de resultados ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProvas();
    carregarEquipes();
    carregarResultados();
    inicializarEstado();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarResultado);
btnIncluir.addEventListener('click', incluirResultado);
btnAlterar.addEventListener('click', alterarResultado);
btnExcluir.addEventListener('click', excluirResultado);
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
    currentResultadoId = null;
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

// Função para carregar provas
async function carregarProvas() {
    try {
        const response = await fetch(`${API_BASE_URL}/resultados/provas`);
        
        if (response.ok) {
            const provas = await response.json();
            const selectProva = document.getElementById('prova_id');
            
            // Limpar options existentes (mantendo apenas o primeiro)
            selectProva.innerHTML = '<option value="">Selecione a prova</option>';
            
            provas.forEach(prova => {
                const option = document.createElement('option');
                option.value = prova.id;
                option.textContent = prova.nome;
                selectProva.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar provas:', error);
        mostrarMensagem('Erro ao carregar lista de provas', 'error');
    }
}

// Função para carregar equipes
async function carregarEquipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/resultados/equipes`);
        
        if (response.ok) {
            const equipes = await response.json();
            const selectEquipe = document.getElementById('equipe_id');
            
            // Limpar options existentes (mantendo apenas o primeiro)
            selectEquipe.innerHTML = '<option value="">Selecione a equipe</option>';
            
            equipes.forEach(equipe => {
                const option = document.createElement('option');
                option.value = equipe.id;
                option.textContent = equipe.nome;
                selectEquipe.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar equipes:', error);
        mostrarMensagem('Erro ao carregar lista de equipes', 'error');
    }
}

// Função para buscar resultado por ID
async function buscarResultado() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/resultados/${id}`);

        if (response.ok) {
            const resultado = await response.json();
            preencherFormulario(resultado);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Resultado encontrado!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Resultado não encontrado. Você pode incluir um novo resultado.', 'info');
        } else {
            throw new Error('Erro ao buscar resultado');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar resultado', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(resultado) {
    currentResultadoId = resultado.id;
    searchId.value = resultado.id;
    document.getElementById('prova_id').value = resultado.prova_id || '';
    document.getElementById('equipe_id').value = resultado.equipe_id || '';
    document.getElementById('colocacao').value = resultado.colocacao || '';
    document.getElementById('pontos').value = resultado.pontos || '';
}

// Função para incluir resultado
function incluirResultado() {
    currentResultadoId = searchId.value.trim();
    limparFormulario();
    searchId.value = currentResultadoId;
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('prova_id').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados do novo resultado', 'info');
}

// Função para alterar resultado
function alterarResultado() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('prova_id').focus();
    operacao = 'alterar';
    
    mostrarMensagem('Altere os dados desejados', 'info');
}

// Função para excluir resultado
function excluirResultado() {
    if (!confirm('Tem certeza que deseja excluir este resultado?')) {
        return;
    }
    
    currentResultadoId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const resultado = {
        id: searchId.value.trim(),
        prova_id: formData.get('prova_id'),
        equipe_id: formData.get('equipe_id'),
        colocacao: formData.get('colocacao'),
        pontos: formData.get('pontos')
    };

    // Validação
    if (operacao !== 'excluir') {
        if (!resultado.prova_id) {
            mostrarMensagem('Prova é obrigatória', 'error');
            return;
        }
        if (!resultado.equipe_id) {
            mostrarMensagem('Equipe é obrigatória', 'error');
            return;
        }
        if (!resultado.pontos) {
            mostrarMensagem('Pontos são obrigatórios', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/resultados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resultado)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/resultados/${currentResultadoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resultado)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/resultados/${currentResultadoId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            mostrarMensagem(`Resultado ${operacao === 'incluir' ? 'incluído' : operacao === 'alterar' ? 'alterado' : 'excluído'} com sucesso!`, 'success');
            limparFormulario();
            carregarResultados();
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

// Função para carregar lista de resultados
async function carregarResultados() {
    try {
        const response = await fetch(`${API_BASE_URL}/resultados`);
        
        if (response.ok) {
            const resultados = await response.json();
            renderizarTabelaResultados(resultados);
        } else {
            throw new Error('Erro ao carregar resultados');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de resultados', 'error');
    }
}

// Função para renderizar tabela de resultados
function renderizarTabelaResultados(resultados) {
    resultadosTableBody.innerHTML = '';

    if (resultados.length === 0) {
        resultadosTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum resultado cadastrado</td></tr>';
        return;
    }

    resultados.forEach(resultado => {
        const colocacaoTexto = resultado.colocacao ? `${resultado.colocacao}º` : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarResultado(${resultado.id})">
                    ${resultado.id}
                </button>
            </td>
            <td>${resultado.prova_nome || 'N/A'}</td>
            <td>${resultado.equipe_nome || 'N/A'}</td>
            <td>${colocacaoTexto}</td>
            <td>${resultado.pontos}</td>
        `;
        resultadosTableBody.appendChild(row);
    });
}

// Função para selecionar resultado da tabela
async function selecionarResultado(id) {
    searchId.value = id;
    await buscarResultado();
}