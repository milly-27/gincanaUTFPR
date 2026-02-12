// Configuração da API
const API_BASE_URL = 'http://localhost:3001';
let currentPessoaId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pessoaForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pessoasTableBody = document.getElementById('pessoasTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de pessoas ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPessoas();
    inicializarEstado();
    configurarToggleSenha();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarPessoa);
btnIncluir.addEventListener('click', incluirPessoa);
btnAlterar.addEventListener('click', alterarPessoa);
btnExcluir.addEventListener('click', excluirPessoa);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

// Configurar toggle de visualização de senha
function configurarToggleSenha() {
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '👁️';
            } else {
                input.type = 'password';
                this.textContent = '👁️‍🗨️';
            }
        });
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
    const inputs = form.querySelectorAll('input:not(#searchId)');
    searchId.disabled = bloquearPrimeiro;
    
    inputs.forEach((input) => {
        input.disabled = !bloquearPrimeiro;
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
    currentPessoaId = null;
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

// Função para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para validar senha
function validarSenha(senha) {
    return senha.length >= 6;
}

// Função para buscar pessoa por ID
async function buscarPessoa() {
    const id = searchId.value.trim();
    
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pessoas/${id}`);

        if (response.ok) {
            const pessoa = await response.json();
            preencherFormulario(pessoa);
            mostrarBotoes(true, false, true, true, false, false);
            bloquearCampos(false);
            mostrarMensagem('Pessoa encontrada!', 'success');
        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false);
            bloquearCampos(false);
            mostrarMensagem('Pessoa não encontrada. Você pode incluir uma nova.', 'info');
        } else {
            throw new Error('Erro ao buscar pessoa');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pessoa', 'error');
    }
}

// Função para preencher formulário
function preencherFormulario(pessoa) {
    currentPessoaId = pessoa.id;
    searchId.value = pessoa.id;
    document.getElementById('nome').value = pessoa.nome || '';
    document.getElementById('email').value = pessoa.email || '';
    // Senha não é preenchida por segurança
    document.getElementById('senha').value = '';
    document.getElementById('confirmar_senha').value = '';
}

// Função para incluir pessoa
function incluirPessoa() {
    limparFormulario();
    
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome').focus();
    operacao = 'incluir';
    
    mostrarMensagem('Digite os dados da nova pessoa', 'info');
}

// Função para alterar pessoa
function alterarPessoa() {
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);
    document.getElementById('nome').focus();
    operacao = 'alterar';
    
    // Limpar campos de senha
    document.getElementById('senha').value = '';
    document.getElementById('confirmar_senha').value = '';
    
    mostrarMensagem('Altere os dados desejados. Deixe a senha em branco para mantê-la', 'info');
}

// Função para excluir pessoa
function excluirPessoa() {
    if (!confirm('Tem certeza que deseja excluir esta pessoa?')) {
        return;
    }
    
    currentPessoaId = searchId.value;
    searchId.disabled = true;
    bloquearCampos(false);
    mostrarBotoes(false, false, false, false, true, true);
    operacao = 'excluir';
    
    mostrarMensagem('Clique em Salvar para confirmar a exclusão', 'warning');
}

// Função para salvar operação
async function salvarOperacao() {
    const formData = new FormData(form);
    const pessoa = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        senha: formData.get('senha')
    };

    // Validações
    if (operacao !== 'excluir') {
        if (!pessoa.nome) {
            mostrarMensagem('Nome é obrigatório', 'error');
            return;
        }
        if (!pessoa.email) {
            mostrarMensagem('Email é obrigatório', 'error');
            return;
        }
        if (!validarEmail(pessoa.email)) {
            mostrarMensagem('Email inválido', 'error');
            return;
        }

        // Validação de senha
        if (operacao === 'incluir') {
            if (!pessoa.senha) {
                mostrarMensagem('Senha é obrigatória', 'error');
                return;
            }
            if (!validarSenha(pessoa.senha)) {
                mostrarMensagem('Senha deve ter no mínimo 6 caracteres', 'error');
                return;
            }
        }

        // Se estiver alterando e senha foi preenchida
        if (operacao === 'alterar' && pessoa.senha) {
            if (!validarSenha(pessoa.senha)) {
                mostrarMensagem('Senha deve ter no mínimo 6 caracteres', 'error');
                return;
            }
        }

        // Confirmar senha
        const confirmarSenha = formData.get('confirmar_senha');
        if (pessoa.senha && pessoa.senha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem', 'error');
            return;
        }
    }

    try {
        let response;

        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pessoas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pessoa)
            });
        } else if (operacao === 'alterar') {
            // Se senha não foi preenchida, não enviar
            if (!pessoa.senha) {
                delete pessoa.senha;
            }
            
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPessoaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pessoa)
            });
        } else if (operacao === 'excluir') {
            response = await fetch(`${API_BASE_URL}/pessoas/${currentPessoaId}`, {
                method: 'DELETE'
            });
        }

        if (response.ok) {
            const operacaoTexto = operacao === 'incluir' ? 'incluída' : 
                                  operacao === 'alterar' ? 'alterada' : 'excluída';
            mostrarMensagem(`Pessoa ${operacaoTexto} com sucesso!`, 'success');
            limparFormulario();
            carregarPessoas();
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

// Função para carregar lista de pessoas
async function carregarPessoas() {
    try {
        const response = await fetch(`${API_BASE_URL}/pessoas`);
        
        if (response.ok) {
            const pessoas = await response.json();
            renderizarTabelaPessoas(pessoas);
        } else {
            throw new Error('Erro ao carregar pessoas');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pessoas', 'error');
    }
}

// Função para renderizar tabela de pessoas
function renderizarTabelaPessoas(pessoas) {
    pessoasTableBody.innerHTML = '';

    if (pessoas.length === 0) {
        pessoasTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma pessoa cadastrada</td></tr>';
        return;
    }

    pessoas.forEach(pessoa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <button class="btn-id" onclick="selecionarPessoa(${pessoa.id})">
                    ${pessoa.id}
                </button>
            </td>
            <td>${pessoa.nome}</td>
            <td>${pessoa.email}</td>
        `;
        pessoasTableBody.appendChild(row);
    });
}

// Função para selecionar pessoa da tabela
async function selecionarPessoa(id) {
    searchId.value = id;
    await buscarPessoa();
}