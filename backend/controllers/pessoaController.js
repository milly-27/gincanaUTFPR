const { query } = require('../database');
const path = require('path');
const bcrypt = require('bcrypt');

// Abrir página HTML do CRUD
exports.abrirCrudPessoa = (req, res) => {
  console.log('pessoaController - Rota /abrirCrudPessoa');
  res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
};

// Listar todas as pessoas (sem mostrar senha)
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT id, nome, email FROM pessoa ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova pessoa
exports.criarPessoa = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validações básicas
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    if (!senha) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validação de senha (mínimo 6 caracteres)
    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Criptografar senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const result = await query(
      'INSERT INTO pessoa (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email.toLowerCase(), senhaHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    // Erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Erro de violação de UNIQUE (email duplicado)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado no sistema' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter pessoa por ID (sem mostrar senha)
exports.obterPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT id, nome, email FROM pessoa WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar pessoa
exports.atualizarPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, email, senha } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Validação de email se fornecido
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
    }

    // Validação de senha se fornecida
    if (senha && senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verifica se a pessoa existe
    const existingPessoa = await query(
      'SELECT * FROM pessoa WHERE id = $1',
      [id]
    );

    if (existingPessoa.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const currentPessoa = existingPessoa.rows[0];
    const updatedFields = {
      nome: nome !== undefined ? nome : currentPessoa.nome,
      email: email !== undefined ? email.toLowerCase() : currentPessoa.email,
      senha: currentPessoa.senha
    };

    // Criptografar nova senha se fornecida
    if (senha) {
      const saltRounds = 10;
      updatedFields.senha = await bcrypt.hash(senha, saltRounds);
    }

    const updateResult = await query(
      'UPDATE pessoa SET nome = $1, email = $2, senha = $3 WHERE id = $4 RETURNING id, nome, email',
      [updatedFields.nome, updatedFields.email, updatedFields.senha, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);

    // Erro de violação de UNIQUE (email duplicado)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado no sistema' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pessoa
exports.deletarPessoa = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a pessoa existe
    const existingPessoa = await query(
      'SELECT * FROM pessoa WHERE id = $1',
      [id]
    );

    if (existingPessoa.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    // Deleta a pessoa
    await query('DELETE FROM pessoa WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pessoa:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pessoa com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};