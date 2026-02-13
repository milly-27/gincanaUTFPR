const db = require('../database');

// ======================================
// REGISTRO DE NOVO USUÁRIO
// ======================================
exports.registro = async (req, res) => {
  const { name, email, password, cargo } = req.body;

  console.log('📝 Tentativa de registro:', { email, cargo });

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (password.length > 20) {
    return res.status(400).json({ error: 'Senha deve ter no máximo 20 caracteres.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }

  // Validar cargo
  const cargosValidos = ['aluno', 'representante', 'professor'];
  const cargoFinal = cargo && cargosValidos.includes(cargo.toLowerCase()) ? cargo.toLowerCase() : 'aluno';

  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar se email já existe
    const checkUser = await client.query(
      'SELECT email FROM pessoa WHERE email = $1',
      [email]
    );

    if (checkUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // Inserir pessoa
    const resultPessoa = await client.query(
      `INSERT INTO pessoa (nome, email, senha)
       VALUES ($1, $2, $3)
       RETURNING id, nome, email`,
      [name, email, password]
    );

    const user = resultPessoa.rows[0];

    // Inserir cargo
    await client.query(
      'INSERT INTO cargo (pessoa_id, cargo) VALUES ($1, $2)',
      [user.id, cargoFinal]
    );

    await client.query('COMMIT');

    console.log('✅ Usuário registrado:', user.email, 'Cargo:', cargoFinal);

    // Criar cookies de sessão
    res.cookie('usuarioLogado', user.nome, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 1 dia
    });

    res.cookie('usuarioId', user.id, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('usuarioCargo', cargoFinal, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Usuário registrado com sucesso.',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: cargoFinal
      },
      logged: true
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no registro:', err);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  } finally {
    client.release();
  }
};

// ======================================
// LOGIN
// ======================================
exports.login = async (req, res) => {
  const { email_usuario, senha_usuario } = req.body;

  console.log('🔐 Tentativa de login:', email_usuario);

  if (!email_usuario || !senha_usuario) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Buscar pessoa e seu cargo
    const resultPessoa = await db.query(
      `SELECT p.id, p.nome, p.email, p.senha, c.cargo
       FROM pessoa p
       LEFT JOIN cargo c ON p.id = c.pessoa_id
       WHERE p.email = $1`,
      [email_usuario]
    );

    if (resultPessoa.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const user = resultPessoa.rows[0];

    // Verificar senha (texto plano - em produção use bcrypt)
    if (user.senha !== senha_usuario) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    console.log('✅ Login bem-sucedido:', user.email, 'Cargo:', user.cargo || 'aluno');

    // Criar cookies
    res.cookie('usuarioLogado', user.nome, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('usuarioId', user.id, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('usuarioCargo', user.cargo || 'aluno', {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login efetuado com sucesso.',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo || 'aluno'
      },
      logged: true
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ error: 'Erro ao efetuar login.' });
  }
};

// ======================================
// VERIFICAR SE ESTÁ LOGADO
// ======================================
exports.verificarLogin = async (req, res) => {
  const nome = req.cookies.usuarioLogado;
  const id = req.cookies.usuarioId;

  console.log('🔍 Verificando login:', { nome, id });

  if (!nome || !id) {
    return res.json({ logged: false });
  }

  try {
    // Verificar se o usuário ainda existe no banco
    const result = await db.query(
      `SELECT p.id, p.nome, p.email, c.cargo
       FROM pessoa p
       LEFT JOIN cargo c ON p.id = c.pessoa_id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      // Usuário não existe mais, limpar cookies
      res.clearCookie('usuarioLogado', {
        sameSite: 'None',
        secure: true,
        httpOnly: true,
        path: '/',
      });
      res.clearCookie('usuarioId', {
        sameSite: 'None',
        secure: true,
        httpOnly: true,
        path: '/',
      });
      res.clearCookie('usuarioCargo', {
        sameSite: 'None',
        secure: true,
        httpOnly: true,
        path: '/',
      });
      return res.json({ logged: false });
    }

    const user = result.rows[0];

    res.json({
      logged: true,
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo || 'aluno'
    });

  } catch (err) {
    console.error('❌ Erro ao verificar login:', err);
    res.status(500).json({ error: 'Erro ao verificar sessão.' });
  }
};

// ======================================
// LOGOUT
// ======================================
exports.logout = (req, res) => {
  console.log('\n👋 [LOGOUT] Iniciando processo de logout...');
  console.log('════════════════════════════════════════');
  
  const cookieOptions = {
    sameSite: 'None',
    secure: true,
    httpOnly: true,
    path: '/',
  };
  
  const cookiesParaLimpar = [
    'usuarioLogado',
    'usuarioId',
    'usuarioCargo'
  ];
  
  cookiesParaLimpar.forEach(cookieName => {
    res.clearCookie(cookieName, cookieOptions);
    console.log(`   🗑️ Cookie limpo: ${cookieName}`);
  });
  
  console.log('✅ [LOGOUT] Todos os cookies removidos');
  console.log('════════════════════════════════════════\n');

  res.json({
    status: 'deslogado',
    message: 'Logout realizado com sucesso.',
    logged: false
  });
};

// ======================================
// ATUALIZAR SENHA
// ======================================
exports.atualizarSenha = async (req, res) => {
  const id = req.cookies.usuarioId;
  const { senha_atual, nova_senha } = req.body;

  if (!id) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
  }

  if (nova_senha.length > 20) {
    return res.status(400).json({ error: 'Nova senha deve ter no máximo 20 caracteres.' });
  }

  if (nova_senha.length < 6) {
    return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    // Verificar senha atual
    const checkPassword = await db.query(
      'SELECT senha FROM pessoa WHERE id = $1',
      [id]
    );

    if (checkPassword.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (checkPassword.rows[0].senha !== senha_atual) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    // Atualizar senha
    await db.query(
      'UPDATE pessoa SET senha = $1 WHERE id = $2',
      [nova_senha, id]
    );

    console.log('✅ Senha atualizada para ID:', id);

    res.json({ message: 'Senha atualizada com sucesso.' });

  } catch (err) {
    console.error('❌ Erro ao atualizar senha:', err);
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
};