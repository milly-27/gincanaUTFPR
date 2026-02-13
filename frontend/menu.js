const API_BASE_URL = 'http://localhost:3001';

console.log('✅ menu.js carregado com sucesso!');

// ========================================
// FUNÇÕES DE SESSÃO (sessionStorage)
// ========================================

function lerSessao(nome) {
    return sessionStorage.getItem(nome);
}

function deletarSessao(nome) {
    sessionStorage.removeItem(nome);
    console.log(`🗑️ Sessão deletada: ${nome}`);
}

function deletarTodasSessoes() {
    console.log('🍪 Deletando todas as sessões de autenticação...');
    sessionStorage.clear();
    console.log('✅ Todas as sessões deletadas!');
}

// ========================================
// CONTROLE DE VISIBILIDADE DOS MENUS
// ========================================

function controlarMenus(cargo, isLogado) {
    const menuCadastros = document.getElementById('menuCadastros');
    const menuRelatorios = document.getElementById('menuRelatorios');
    const menuConfiguracoes = document.getElementById('menuConfiguracoes');
    const btnCadastro = document.getElementById('btnCadastro');
    
    console.log('🔐 Controlando menus - Cargo:', cargo, '- Está logado?', isLogado);
    
    // PROFESSORES: Acesso total (Login, Cadastros, Relatórios, Configurações)
    if (cargo === 'professor') {
        if (menuCadastros) menuCadastros.style.display = 'block';
        if (menuRelatorios) menuRelatorios.style.display = 'block';
        if (menuConfiguracoes) menuConfiguracoes.style.display = 'block';
        if (btnCadastro) btnCadastro.style.display = 'none';
        console.log('✅ Professor: Todos os menus liberados (Login, Cadastros, Relatórios, Config)');
    }
    // REPRESENTANTES: Apenas Cadastros (sem Login, Relatórios ou Config)
    else if (cargo === 'representante') {
        if (menuCadastros) menuCadastros.style.display = 'block';
        if (menuRelatorios) menuRelatorios.style.display = 'none';
        if (menuConfiguracoes) menuConfiguracoes.style.display = 'none';
        if (btnCadastro) btnCadastro.style.display = 'inline-block';
        console.log('✅ Representante: Menu Cadastros liberado (sem Login, Relatórios ou Config)');
    }
    // ALUNOS ou NÃO LOGADO: Sem acesso aos menus administrativos
    else {
        if (menuCadastros) menuCadastros.style.display = 'none';
        if (menuRelatorios) menuRelatorios.style.display = 'none';
        if (menuConfiguracoes) menuConfiguracoes.style.display = 'none';
        if (btnCadastro) btnCadastro.style.display = 'none';
        console.log('🔒 Aluno/Visitante: Menus bloqueados');
    }
}

// ========================================
// ATUALIZAR INTERFACE DO USUÁRIO
// ========================================

function atualizarInterfaceUsuario(userData = null) {
    console.log('🔄 Atualizando interface do usuário:', userData);
    
    const btnLogin = document.getElementById('btnLogin');
    const btnCadastro = document.getElementById('btnCadastro');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const loginPrompt = document.getElementById('loginPrompt');
    
    if (!userInfo || !userName) {
        console.warn('⚠️ Elementos de UI não encontrados');
        return;
    }
    
    if (userData && userData.nome) {
        console.log('👤 Usuário logado:', userData.nome);
        console.log('🔰 Cargo:', userData.cargo);
        
        // Ocultar botões de login/cadastro
        if (btnLogin) btnLogin.classList.add('hidden');
        if (btnCadastro) btnCadastro.classList.add('hidden');
        
        // Mostrar informações do usuário
        userInfo.classList.remove('hidden');
        if (loginPrompt) loginPrompt.style.display = 'none';
        
        userName.innerHTML = '';
        
        const nomeSpan = document.createElement('span');
        nomeSpan.textContent = userData.nome;
        nomeSpan.style.cssText = 'font-weight: 600; color: var(--text-dark);';
        userName.appendChild(nomeSpan);
        
        // Badge baseado no cargo
        let badgeText = '';
        let badgeColor = '';
        
        if (userData.cargo === 'professor') {
            badgeText = '👨‍🏫 Professor';
            badgeColor = 'linear-gradient(135deg, #3498db, #2980b9)';
        } else if (userData.cargo === 'representante') {
            badgeText = '👥 Representante';
            badgeColor = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
        } else {
            badgeText = '🎓 Aluno';
            badgeColor = 'linear-gradient(135deg, #2ecc71, #27ae60)';
        }
        
        const badgeSpan = document.createElement('span');
        badgeSpan.textContent = badgeText;
        badgeSpan.style.cssText = `
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 10px;
            padding: 4px 10px;
            background: ${badgeColor};
            color: white;
            border-radius: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        userName.appendChild(badgeSpan);
        
        userInfo.style.cursor = 'pointer';
        userInfo.title = 'Clique para fazer logout';
        userInfo.onclick = logout;
        
        // Mensagens personalizadas
        if (userData.cargo === 'professor') {
            if (welcomeTitle) welcomeTitle.textContent = `Bem-vindo, Professor ${userData.nome}! 👨‍🏫`;
            if (welcomeMessage) welcomeMessage.textContent = 'Você tem acesso total ao sistema. Gerencie as atividades e personalize o tema da gincana.';
        } else if (userData.cargo === 'representante') {
            if (welcomeTitle) welcomeTitle.textContent = `Bem-vindo, ${userData.nome}! 👥`;
            if (welcomeMessage) welcomeMessage.textContent = 'Como representante, você pode gerenciar os cadastros da gincana.';
        } else {
            if (welcomeTitle) welcomeTitle.textContent = `Seja bem-vindo, ${userData.nome}! 🎓`;
            if (welcomeMessage) welcomeMessage.textContent = 'Participe das atividades, acumule pontos e acompanhe seu desempenho!';
        }
        
        controlarMenus(userData.cargo, true);
        
    } else {
        console.log('👤 Nenhum usuário logado');
        
        // Mostrar botão de login apenas
        if (btnLogin) btnLogin.classList.remove('hidden');
        if (btnCadastro) btnCadastro.classList.add('hidden');
        
        userInfo.classList.add('hidden');
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (userName) userName.innerHTML = '';
        
        if (welcomeTitle) welcomeTitle.textContent = 'Bem-vindo à Gincana!';
        if (welcomeMessage) welcomeMessage.textContent = 'Participe das competições e mostre seu talento!';
        
        controlarMenus('visitante', false);
    }
}

// ========================================
// VERIFICAR LOGIN NO SESSIONSTORAGE
// ========================================

function verificarSeUsuarioEstaLogado() {
    console.log('🔍 Verificando autenticação no sessionStorage...');
    console.log('══════════════════════════════════════');
    
    try {
        const userId = lerSessao('userId');
        const userName = lerSessao('userName');
        const userEmail = lerSessao('userEmail');
        const userCargo = lerSessao('userCargo');
        
        console.log('💾 Dados da sessão:');
        console.log('   - userId:', userId || '❌ Não encontrado');
        console.log('   - userName:', userName || '❌ Não encontrado');
        console.log('   - userEmail:', userEmail || '❌ Não encontrado');
        console.log('   - userCargo:', userCargo || '❌ Não encontrado');
        
        if (!userId || !userName) {
            console.log('❌ Usuário não autenticado (sessão vazia)');
            console.log('══════════════════════════════════════');
            atualizarInterfaceUsuario(null);
            return null;
        }
        
        const userData = {
            id: userId,
            nome: userName,
            email: userEmail,
            cargo: userCargo || 'aluno'
        };
        
        console.log('👤 Dados do usuário (sessão):');
        console.log('   - Nome:', userData.nome);
        console.log('   - Cargo:', userData.cargo);
        console.log('══════════════════════════════════════');
        
        atualizarInterfaceUsuario(userData);
        
        return userData;
        
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        console.log('══════════════════════════════════════');
        deletarTodasSessoes();
        atualizarInterfaceUsuario(null);
        return null;
    }
}

// ========================================
// LOGOUT COM MODAIS
// ========================================

async function logout() {
    console.log('🚪 Solicitação de logout...');
    
    criarModalConfirmacao(
        'Deseja sair?',
        'Tem certeza que deseja encerrar sua sessão?',
        async () => {
            console.log('🚪 Confirmado! Iniciando logout...');
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                console.log('📨 Resposta logout:', result);
            } catch (error) {
                console.warn('⚠️ Erro ao fazer logout no servidor:', error);
            }
            
            deletarTodasSessoes();
            atualizarInterfaceUsuario(null);
            
            mostrarModalSucesso(
                'Logout realizado!',
                'Até logo! Você será redirecionado...'
            );
            
            setTimeout(() => {
                window.location.href = './auth/login.html';
            }, 2000);
        }
    );
}

// ========================================
// MODAIS
// ========================================

function criarModalConfirmacao(titulo, mensagem, onConfirm) {
    const modalExistente = document.getElementById('customModal');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const modalHTML = `
        <div id="customModal" class="custom-modal-overlay">
            <div class="custom-modal-content">
                <div class="custom-modal-icon">🚪</div>
                <h3 class="custom-modal-title">${titulo}</h3>
                <p class="custom-modal-message">${mensagem}</p>
                <div class="custom-modal-actions">
                    <button class="custom-modal-btn custom-modal-btn-cancel" onclick="fecharModalConfirmacao()">
                        Cancelar
                    </button>
                    <button class="custom-modal-btn custom-modal-btn-confirm" onclick="confirmarModalConfirmacao()">
                        Sim, deslogar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        document.getElementById('customModal').classList.add('show');
    }, 10);
    
    window.modalConfirmCallback = onConfirm;
}

function fecharModalConfirmacao() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    window.modalConfirmCallback = null;
}

function confirmarModalConfirmacao() {
    if (window.modalConfirmCallback) {
        window.modalConfirmCallback();
    }
    fecharModalConfirmacao();
}

function mostrarModalSucesso(titulo, mensagem) {
    const modalExistente = document.getElementById('customModal');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const modalHTML = `
        <div id="customModal" class="custom-modal-overlay">
            <div class="custom-modal-content success">
                <div class="custom-modal-icon success">✅</div>
                <h3 class="custom-modal-title">${titulo}</h3>
                <p class="custom-modal-message">${mensagem}</p>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    setTimeout(() => {
        document.getElementById('customModal').classList.add('show');
    }, 10);
    
    setTimeout(() => {
        fecharModalConfirmacao();
    }, 2000);
}

// ========================================
// INICIALIZAÇÃO
// ========================================

function inicializarMenu() {
    console.log('🚀 Menu carregado, inicializando...');
    
    const anoAtual = new Date().getFullYear();
    const menuTitle = document.getElementById('menuTitle');
    if (menuTitle) {
        menuTitle.textContent = `🏆 GINCANA ${anoAtual}`;
    }
    
    const footerText = document.getElementById('footerText');
    if (footerText) {
        footerText.textContent = `© ${anoAtual} - Sistema de Gincana`;
    }
    
    verificarSeUsuarioEstaLogado();
    
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) {
        btnLogin.onclick = () => window.location.href = './auth/login.html';
    }
    
    const btnCadastro = document.getElementById('btnCadastro');
    if (btnCadastro) {
        btnCadastro.onclick = () => window.location.href = './auth/login.html?tab=cadastro';
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', inicializarMenu);

// ========================================
// EXPORTAR FUNÇÕES GLOBALMENTE
// ========================================

window.logout = logout;
window.verificarSeUsuarioEstaLogado = verificarSeUsuarioEstaLogado;
window.fecharModalConfirmacao = fecharModalConfirmacao;
window.confirmarModalConfirmacao = confirmarModalConfirmacao;