import { login, registrar, mostrarMensagem } from './auth.js';

// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================

const mascot3d = document.getElementById('mascot3d');
const pupilLeft = document.getElementById('pupilLeft');
const pupilRight = document.getElementById('pupilRight');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');

let currentExpression = '';
let isPasswordFieldFocused = false;
let idleTimer = null;
let lastInteractionTime = Date.now();
let mouseX = 0;
let mouseY = 0;

// Frases aleatórias para o mascote
const idlePhrases = [
    "Tá esperando o que? 🤔",
    "Zzz... Ops, acordei! 😴",
    "Vai encarar a gincana? 💪",
    "Bora participar! 🎯",
    "Que tal fazer login? 😊",
    "Estou aqui esperando! ⏰",
    "Vamos lá, campeão! 🏆",
    "A gincana não vai se ganhar sozinha! 🎪"
];

const happyPhrases = [
    "Isso aí! Continue assim! 😄",
    "Mandando bem! 👏",
    "Você é demais! ⭐",
    "Ótimo! Estamos quase lá! 🚀",
    "Perfeito! Continue! ✨",
    "Show de bola! 🎉"
];

const encouragementPhrases = [
    "Vamos com calma... 😌",
    "Sem pressa! Você consegue! 💪",
    "Relaxa e respira... 🧘",
    "Tudo vai dar certo! 🌟",
    "Acredite em você! 💫"
];

// ==========================================
// ATUALIZAR ANO AUTOMATICAMENTE
// ==========================================

function atualizarAno() {
    const anoAtual = new Date().getFullYear();
    const logoTitle = document.getElementById('logoTitle');
    
    const temaSalvo = localStorage.getItem('gincana_tema');
    
    if (temaSalvo) {
        const tema = JSON.parse(temaSalvo);
        if (logoTitle && tema.nome) {
            logoTitle.textContent = `${tema.nome.toUpperCase()} ${anoAtual}`;
        } else if (logoTitle) {
            logoTitle.textContent = `GINCANA ${anoAtual}`;
        }
    } else if (logoTitle) {
        logoTitle.textContent = `GINCANA ${anoAtual}`;
    }
}

// ==========================================
// FUNÇÕES DO BALÃO DE FALA
// ==========================================

function showSpeech(text, duration = 3000) {
    speechText.textContent = text;
    speechBubble.style.display = 'block';
    speechBubble.style.animation = 'bubblePop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    if (duration > 0) {
        setTimeout(() => {
            speechBubble.style.opacity = '0';
            speechBubble.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                speechBubble.style.display = 'none';
                speechBubble.style.opacity = '1';
            }, 300);
        }, duration);
    }
}

function getRandomPhrase(phrasesArray) {
    return phrasesArray[Math.floor(Math.random() * phrasesArray.length)];
}

// ==========================================
// COMPORTAMENTO IDLE
// ==========================================

function resetIdleTimer() {
    lastInteractionTime = Date.now();
    clearTimeout(idleTimer);
    
    idleTimer = setTimeout(() => {
        if (currentExpression === '' || currentExpression === 'thinking') {
            const randomAction = Math.random();
            
            if (randomAction < 0.3) {
                setMascotExpression('blink');
                setTimeout(() => {
                    setMascotExpression('', getRandomPhrase(idlePhrases));
                }, 300);
            } else if (randomAction < 0.6) {
                lookAround();
            } else {
                showSpeech(getRandomPhrase(encouragementPhrases), 4000);
            }
        }
    }, 8000);
}

function lookAround() {
    const originalExpression = currentExpression;
    
    pupilLeft.style.transform = 'translate(-5px, 0)';
    pupilRight.style.transform = 'translate(-5px, 0)';
    
    setTimeout(() => {
        pupilLeft.style.transform = 'translate(5px, 0)';
        pupilRight.style.transform = 'translate(5px, 0)';
    }, 1000);
    
    setTimeout(() => {
        pupilLeft.style.transform = 'translate(0, 0)';
        pupilRight.style.transform = 'translate(0, 0)';
    }, 2000);
}

// ==========================================
// MASCOTE 3D - OLHOS SEGUEM O MOUSE
// ==========================================

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    resetIdleTimer();
    
    if (!isPasswordFieldFocused) {
        movePupils3D(mouseX, mouseY);
        tiltTrophy(mouseX, mouseY);
    }
});

function movePupils3D(mouseX, mouseY) {
    const eyes = document.querySelectorAll('.pupil');
    
    eyes.forEach((pupil) => {
        const eye = pupil.closest('.eye');
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        const distance = Math.min(4, Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 30);
        
        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;
        
        pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
    });
}

function tiltTrophy(mouseX, mouseY) {
    const mascotRect = mascot3d.getBoundingClientRect();
    const mascotCenterX = mascotRect.left + mascotRect.width / 2;
    const mascotCenterY = mascotRect.top + mascotRect.height / 2;
    
    const deltaX = (mouseX - mascotCenterX) / window.innerWidth;
    const deltaY = (mouseY - mascotCenterY) / window.innerHeight;
    
    const rotateY = deltaX * 15;
    const rotateX = -deltaY * 15;
    
    if (currentExpression !== 'looking-away' && currentExpression !== 'shake' && currentExpression !== 'excited') {
        mascot3d.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
}

// ==========================================
// EXPRESSÕES DO MASCOTE 3D
// ==========================================

function setMascotExpression(expression, message = '') {
    mascot3d.className = 'mascot-3d';
    
    if (expression) {
        mascot3d.classList.add(expression);
        currentExpression = expression;
    } else {
        currentExpression = '';
        mascot3d.style.transform = '';
    }
    
    if (message) {
        showSpeech(message);
    }
}

// Piscar periodicamente
function startBlinking() {
    setInterval(() => {
        if ((currentExpression === '' || currentExpression === 'thinking' || currentExpression === 'happy') 
            && !isPasswordFieldFocused) {
            mascot3d.classList.add('blink');
            setTimeout(() => {
                mascot3d.classList.remove('blink');
            }, 200);
        }
    }, Math.random() * 3000 + 4000);
}

// Reações aleatórias
function startRandomReactions() {
    setInterval(() => {
        if (currentExpression === '' && Math.random() < 0.25) {
            const reactions = ['happy', 'thinking', 'excited'];
            const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
            
            setMascotExpression(randomReaction, getRandomPhrase(happyPhrases));
            
            setTimeout(() => {
                setMascotExpression('');
            }, 2000);
        }
    }, 15000);
}

// ==========================================
// CONFETE DE CELEBRAÇÃO
// ==========================================

function createConfetti() {
    const confettiContainer = document.getElementById('confettiContainer');
    const colors = ['#FF6B35', '#F7931E', '#FFC857', '#4ECDC4', '#95E1D3', '#FFD700', '#FF1493', '#00CED1'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = Math.random() * 1 + 2 + 's';
        confetti.style.width = Math.random() * 6 + 8 + 'px';
        confetti.style.height = confetti.style.width;
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
    
    setMascotExpression('excited', '🎊 PARABÉNS! VOCÊ CONSEGUIU! 🎊');
}

// ==========================================
// SISTEMA DE ABAS
// ==========================================

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        resetIdleTimer();
        const targetTab = button.getAttribute('data-tab');
        
        const messages = {
            'login': ['Vamos entrar! 🎯', 'Hora de logar! 🔑', 'Bem-vindo de volta! 👋'],
            'cadastro': ['Seja bem-vindo! 🎉', 'Vamos criar sua conta! ✨', 'Entre para a equipe! 🏆']
        };
        
        const randomMessage = messages[targetTab][Math.floor(Math.random() * messages[targetTab].length)];
        
        setMascotExpression('happy', randomMessage);
        
        setTimeout(() => {
            setMascotExpression('thinking');
        }, 1500);
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        const targetContent = document.getElementById(`${targetTab}Tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

// ==========================================
// TOGGLE VISUALIZAR SENHA
// ==========================================

function setupPasswordToggle(toggleBtn, passwordInput) {
    toggleBtn.addEventListener('click', function() {
        resetIdleTimer();
        const eyeIcon = this.querySelector('.eye-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
            
            const surpriseMessages = [
                'Eita! Olha só essa senha! 😱',
                'Ui! Que senha é essa?! 😲',
                'Vish! Vi tudo! 🫣',
                'Ops! Senha à mostra! 😮'
            ];
            
            setMascotExpression('surprised', getRandomPhrase(surpriseMessages));
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
            
            const relievedMessages = [
                'Uffa, escondi! 😌',
                'Pronto, tá seguro! 🔒',
                'Guardadinha! 🤐',
                'Segredo mantido! 🤫'
            ];
            
            setMascotExpression('', getRandomPhrase(relievedMessages));
        }
    });
}

setupPasswordToggle(
    document.getElementById('toggleLoginPassword'),
    document.getElementById('loginSenha')
);

setupPasswordToggle(
    document.getElementById('toggleRegPassword'),
    document.getElementById('regSenha')
);

// ==========================================
// EVENTOS DOS INPUTS
// ==========================================

const allInputs = document.querySelectorAll('input');

allInputs.forEach(input => {
    input.addEventListener('focus', () => {
        resetIdleTimer();
        
        if (input.type === 'password') {
            isPasswordFieldFocused = true;
            
            const shyMessages = [
                'Vou olhar pro lado... 🙈',
                'Não vou espiar! 😇',
                'Pode digitar, não tô olhando! 🫣',
                'Virando aqui... 👀'
            ];
            
            setMascotExpression('looking-away', getRandomPhrase(shyMessages));
            
            setTimeout(() => {
                pupilLeft.style.transform = 'translate(-6px, 0)';
                pupilRight.style.transform = 'translate(-6px, 0)';
            }, 800);
            
        } else {
            isPasswordFieldFocused = false;
            
            const thinkingMessages = [
                'Hmm, deixa eu pensar... 🤔',
                'O que será que vai digitar? 🧐',
                'Interessante... 📝',
                'Boa! Continue! ✍️'
            ];
            
            setMascotExpression('thinking', getRandomPhrase(thinkingMessages));
        }
    });
    
    input.addEventListener('blur', () => {
        isPasswordFieldFocused = false;
        
        if (currentExpression === 'looking-away') {
            pupilLeft.style.transform = 'translate(0, 0)';
            pupilRight.style.transform = 'translate(0, 0)';
            
            setTimeout(() => {
                setMascotExpression('', 'Pronto! 😊');
                mascot3d.style.transform = '';
            }, 500);
        } else {
            setMascotExpression('');
        }
    });
    
    let typingTimeout;
    input.addEventListener('input', () => {
        resetIdleTimer();
        
        if (!isPasswordFieldFocused) {
            clearTimeout(typingTimeout);
            
            if (Math.random() < 0.2) {
                setMascotExpression('happy');
                
                if (Math.random() < 0.3) {
                    showSpeech(getRandomPhrase(happyPhrases), 2000);
                }
            }
            
            typingTimeout = setTimeout(() => {
                if (document.activeElement === input && input.type !== 'password') {
                    setMascotExpression('thinking');
                }
            }, 800);
        }
    });
});

// ==========================================
// CARREGAMENTO DO TEMA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    atualizarAno();
    carregarTema();
    startBlinking();
    startRandomReactions();
    resetIdleTimer();
    
    const welcomeMessages = [
        'Olá! Pronto para a gincana? 🎉',
        'E aí, campeão! Bora começar? 🏆',
        'Bem-vindo! Vamos nessa? 🚀',
        'Opa! Chegou para vencer? 💪'
    ];
    
    showSpeech(getRandomPhrase(welcomeMessages), 5000);
});

function carregarTema() {
    const temaSalvo = localStorage.getItem('gincana_tema');
    
    if (temaSalvo) {
        const tema = JSON.parse(temaSalvo);
        aplicarTema(tema);
    }
}

function aplicarTema(tema) {
    if (!tema) return;
    
    const anoAtual = new Date().getFullYear();
    const logoTitle = document.getElementById('logoTitle');
    const logoSubtitle = document.getElementById('logoSubtitle');
    
    if (logoTitle && tema.nome) {
        logoTitle.textContent = `${tema.nome.toUpperCase()} ${anoAtual}`;
    }
    
    if (logoSubtitle && tema.descricao) {
        logoSubtitle.textContent = tema.descricao;
    }
    
    if (tema.corPrimaria) {
        document.documentElement.style.setProperty('--cor-primaria', tema.corPrimaria);
    }
    
    if (tema.corSecundaria) {
        document.documentElement.style.setProperty('--cor-secundaria', tema.corSecundaria);
    }
    
    if (tema.corFundo) {
        document.documentElement.style.setProperty('--cor-fundo-geral', tema.corFundo);
    }
}

// ==========================================
// FORMULÁRIO DE LOGIN
// ==========================================

const loginForm = document.getElementById('loginForm');
const mensagemLogin = document.getElementById('mensagemLogin');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetIdleTimer();
    
    setMascotExpression('thinking', 'Deixa eu verificar isso aqui... 🔍');
    
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    
    const btn = loginForm.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-text">Verificando...</span> <span class="btn-icon">⏳</span>';
    btn.disabled = true;
    
    try {
        const data = await login(email, senha);
        
        if (data.logged && data.user) {
            const successMessages = [
                '🎉 EBAAAA! Você conseguiu! Bem-vindo! 🏆',
                '🎊 UHUL! Tá dentro! Vamos nessa! 🚀',
                '✨ SHOW! Login feito! Partiu gincana! 🎯',
                '🌟 PERFEITO! Conta confirmada! Bora! 💪'
            ];
            
            setMascotExpression('excited', getRandomPhrase(successMessages));
            createConfetti();
            mostrarMensagem(mensagemLogin, 'Login realizado com sucesso! Redirecionando...', 'sucesso');
            
            setTimeout(() => {
                window.location.href = '../menu.html';
            }, 2000);
            
        } else {
            const errorMsg = data.error || '';
            
            if (errorMsg.toLowerCase().includes('não encontrado') || 
                errorMsg.toLowerCase().includes('não cadastrado') ||
                errorMsg.toLowerCase().includes('não existe')) {
                
                const notFoundMessages = [
                    '🤔 Hmm... você ainda não está cadastrado!',
                    '😅 Opa! Não achei você aqui não!',
                    '🔍 Procurei mas não encontrei sua conta!',
                    '😬 Eita! Você não tá na lista!'
                ];
                
                setMascotExpression('shake', getRandomPhrase(notFoundMessages));
                
                setTimeout(() => {
                    setMascotExpression('grimace');
                }, 600);
                
                mostrarMensagem(mensagemLogin, '❌ ' + errorMsg, 'erro');
                
                setTimeout(() => {
                    const inviteMessages = [
                        'Que tal criar sua conta agora? Clique em "Cadastro"! 👆',
                        'Bora se cadastrar! É rapidinho! Clica ali em cima! ☝️',
                        'Vem comigo! Vamos criar sua conta! Só clicar em "Cadastro"! 🎯',
                        'Relaxa! É só se cadastrar! Olha ali o botão! 👆'
                    ];
                    
                    showSpeech(getRandomPhrase(inviteMessages), 6000);
                    setMascotExpression('happy');
                    
                    const cadastroTab = document.querySelector('[data-tab="cadastro"]');
                    cadastroTab.style.animation = 'iconBounce 0.6s ease 4';
                }, 2500);
                
            } else {
                const errorMessages = [
                    '😬 Ops! Algo está errado...',
                    '🤨 Hmm... isso não tá certo!',
                    '😕 Eita! Tem algo errado aí!',
                    '🫤 Opa! Revisa isso aí!'
                ];
                
                setMascotExpression('shake', getRandomPhrase(errorMessages));
                
                setTimeout(() => {
                    setMascotExpression('grimace');
                }, 600);
                
                mostrarMensagem(mensagemLogin, errorMsg || 'Email ou senha incorretos', 'erro');
                
                setTimeout(() => {
                    const retryMessages = [
                        'Calma! Tenta de novo! 💪',
                        'Sem stress! Vai dar certo! 😊',
                        'Relaxa e tenta mais uma vez! 🌟',
                        'Não desiste! Você consegue! ⭐'
                    ];
                    
                    setMascotExpression('sad', getRandomPhrase(retryMessages));
                }, 1500);
            }
            
            setTimeout(() => setMascotExpression(''), 4000);
        }
        
    } catch (err) {
        console.error(err);
        
        const connectionMessages = [
            '😰 Eita! Problema na conexão!',
            '🔌 Opa! Parece que caiu a internet!',
            '📡 Vish! Não consegui conectar!',
            '⚠️ Ops! Servidor fora do ar!'
        ];
        
        setMascotExpression('shake', getRandomPhrase(connectionMessages));
        setTimeout(() => setMascotExpression('sad'), 600);
        mostrarMensagem(mensagemLogin, 'Falha na conexão com o servidor', 'erro');
        setTimeout(() => setMascotExpression(''), 4000);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// ==========================================
// FORMULÁRIO DE CADASTRO
// ==========================================

const cadastroForm = document.getElementById('cadastroForm');
const mensagemCadastro = document.getElementById('mensagemCadastro');

document.getElementById('regCpf').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    e.target.value = value;
});

cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetIdleTimer();
    
    setMascotExpression('thinking', 'Verificando seus dados... 📝');
    
    const cpfFormatted = document.getElementById('regCpf').value;
    const cpfClean = cpfFormatted.replace(/\D/g, '');
    
    const user = {
        name: document.getElementById('regNome').value.trim(),
        cpf: cpfClean,
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regSenha').value
    };
    
    if (cpfClean.length !== 11) {
        setMascotExpression('shake', '😕 Esse CPF não está completo! Faltam números!');
        setTimeout(() => setMascotExpression('grimace'), 600);
        mostrarMensagem(mensagemCadastro, 'CPF deve ter 11 dígitos', 'erro');
        setTimeout(() => setMascotExpression(''), 3000);
        return;
    }
    
    if (user.password.length < 6) {
        setMascotExpression('shake', '🔒 Senha muito curta! Precisa de pelo menos 6 caracteres!');
        setTimeout(() => setMascotExpression('sad'), 600);
        mostrarMensagem(mensagemCadastro, 'Senha deve ter no mínimo 6 caracteres', 'erro');
        setTimeout(() => setMascotExpression(''), 3000);
        return;
    }
    
    if (user.password.length > 20) {
        setMascotExpression('shake', '😅 Calma! Essa senha é muito longa! Máximo 20!');
        setTimeout(() => setMascotExpression('surprised'), 600);
        mostrarMensagem(mensagemCadastro, 'Senha deve ter no máximo 20 caracteres', 'erro');
        setTimeout(() => setMascotExpression(''), 3000);
        return;
    }
    
    const btn = cadastroForm.querySelector('.btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="btn-text">Criando sua conta...</span> <span class="btn-icon">⏳</span>';
    btn.disabled = true;
    
    try {
        const data = await registrar(user);
        
        if (data.logged && data.user) {
            const successMessages = [
                '🎊 UHUUL! Conta criada! Bem-vindo à equipe! 🏆',
                '🎉 EBAA! Você está dentro! Partiu gincana! 🚀',
                '✨ SHOWWW! Conta pronta! Vamos nessa! 🎯',
                '🌟 DEMAIS! Bem-vindo ao time! Bora! 💪'
            ];
            
            setMascotExpression('excited', getRandomPhrase(successMessages));
            createConfetti();
            mostrarMensagem(mensagemCadastro, 'Cadastro realizado com sucesso! Redirecionando...', 'sucesso');
            
            setTimeout(() => {
                window.location.href = '../menu.html';
            }, 2000);
            
        } else {
            setMascotExpression('shake', '😬 Ops! Algo deu errado...');
            setTimeout(() => setMascotExpression('sad'), 600);
            mostrarMensagem(mensagemCadastro, data.error || 'Erro no cadastro', 'erro');
            setTimeout(() => setMascotExpression(''), 3000);
        }
        
    } catch (err) {
        console.error(err);
        setMascotExpression('shake', '😰 Problema na conexão!');
        setTimeout(() => setMascotExpression('sad'), 600);
        mostrarMensagem(mensagemCadastro, 'Falha na conexão com o servidor', 'erro');
        setTimeout(() => setMascotExpression(''), 3000);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});