// auth.js - Sistema de Autenticação

const API_URL = 'http://localhost:3001';

// Função para mostrar mensagens
export function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
    elemento.style.display = 'block';
    
    console.log(`📢 Mensagem [${tipo}]:`, texto);
}

// Função para salvar dados no sessionStorage
function salvarSessao(nome, valor) {
    sessionStorage.setItem(nome, valor);
    console.log(`💾 Sessão salva: ${nome} = ${valor}`);
}

// Função para ler sessionStorage
function lerSessao(nome) {
    const valor = sessionStorage.getItem(nome);
    console.log(`🔍 Lendo sessão: ${nome} = ${valor || 'null'}`);
    return valor;
}

// Função para deletar sessão
function deletarSessao(nome) {
    sessionStorage.removeItem(nome);
    console.log(`🗑️ Sessão deletada: ${nome}`);
}

// Função para deletar todas as sessões
function deletarTodasSessoes() {
    console.log('🧹 Deletando todas as sessões...');
    sessionStorage.clear();
    console.log('✅ Todas as sessões deletadas!');
}

// Função de Login
export async function login(email, senha) {
    console.log('🔐 Iniciando login...');
    console.log('📧 Email:', email);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                email_usuario: email,
                senha_usuario: senha
            })
        });

        console.log('📡 Resposta do servidor:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (data.logged && data.user) {
            console.log('✅ Login bem-sucedido!');
            console.log('👤 Usuário:', data.user);
            
            // Salvar na sessão
            salvarSessao('userId', data.user.id);
            salvarSessao('userName', data.user.nome);
            salvarSessao('userEmail', data.user.email);
            salvarSessao('userCargo', data.user.cargo || 'aluno');
            
            console.log('🎉 Sessão criada com sucesso!');
            
            return {
                logged: true,
                user: data.user
            };
        } else {
            console.log('❌ Login falhou:', data.error || data.message || 'Erro desconhecido');
            return {
                logged: false,
                error: data.error || data.message || 'Email ou senha incorretos'
            };
        }
    } catch (error) {
        console.error('🔥 Erro na requisição de login:', error);
        throw error;
    }
}

// Função de Registro
export async function registrar(user) {
    console.log('📝 Iniciando cadastro...');
    console.log('👤 Dados do usuário:', user);
    
    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(user)
        });

        console.log('📡 Resposta do servidor:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);

        if (data.logged && data.user) {
            console.log('✅ Cadastro bem-sucedido!');
            console.log('👤 Usuário:', data.user);
            
            // Salvar na sessão
            salvarSessao('userId', data.user.id);
            salvarSessao('userName', data.user.nome);
            salvarSessao('userEmail', data.user.email);
            salvarSessao('userCargo', data.user.cargo || 'aluno');
            
            console.log('🎉 Sessão criada com sucesso!');
            
            return data;
        } else {
            console.log('❌ Cadastro falhou:', data.error || 'Erro desconhecido');
            return data;
        }
    } catch (error) {
        console.error('🔥 Erro na requisição de cadastro:', error);
        throw error;
    }
}

// Função para verificar se o usuário está logado
export function verificarLogin() {
    console.log('🔍 Verificando login...');
    
    const userId = lerSessao('userId');
    const userName = lerSessao('userName');
    const userCargo = lerSessao('userCargo');
    
    if (!userId || !userName) {
        console.log('❌ Usuário não está logado');
        return { logged: false };
    }
    
    console.log('✅ Usuário está logado!');
    return {
        logged: true,
        user: {
            id: userId,
            nome: userName,
            cargo: userCargo || 'aluno'
        }
    };
}

// Função de Logout
export function logout() {
    console.log('👋 Realizando logout...');
    
    deletarTodasSessoes();
    
    console.log('✅ Logout realizado com sucesso!');
}

// Exportar funções auxiliares
export { lerSessao as lerCookie, salvarSessao as salvarCookie, deletarSessao as deletarCookie };