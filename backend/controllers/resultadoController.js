const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudResultado = (req, res) => {
  console.log('resultadoController - Rota /abrirCrudResultado - abrir o crudResultado');
  res.sendFile(path.join(__dirname, '../../frontend/resultado/resultado.html'));
};

// Listar todos os resultados
exports.listarResultados = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.id,
        r.prova_id,
        r.equipe_id,
        r.colocacao,
        r.pontos,
        p.nome as prova_nome,
        e.nome as equipe_nome
      FROM resultado r
      LEFT JOIN prova p ON r.prova_id = p.id
      LEFT JOIN equipe e ON r.equipe_id = e.id
      ORDER BY r.id
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar resultados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar provas para select
exports.listarProvas = async (req, res) => {
  try {
    const result = await query('SELECT id, nome FROM prova ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar provas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar equipes para select
exports.listarEquipes = async (req, res) => {
  try {
    const result = await query('SELECT id, nome FROM equipe ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar equipes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo resultado
exports.criarResultado = async (req, res) => {
  try {
    const { id, prova_id, equipe_id, colocacao, pontos } = req.body;

    // Validação básica
    if (!prova_id || !equipe_id || pontos === undefined || pontos === null) {
      return res.status(400).json({
        error: 'Prova, equipe e pontos são obrigatórios'
      });
    }

    // Validar se pontos é um número
    if (isNaN(pontos)) {
      return res.status(400).json({
        error: 'Pontos deve ser um número válido'
      });
    }

    // Validar colocação se fornecida
    if (colocacao !== undefined && colocacao !== null && isNaN(colocacao)) {
      return res.status(400).json({
        error: 'Colocação deve ser um número válido'
      });
    }

    // Se o ID não for fornecido, o banco gerará automaticamente (SERIAL)
    let queryText, queryParams;
    
    if (id) {
      queryText = 'INSERT INTO resultado (id, prova_id, equipe_id, colocacao, pontos) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      queryParams = [id, prova_id, equipe_id, colocacao || null, parseInt(pontos)];
    } else {
      queryText = 'INSERT INTO resultado (prova_id, equipe_id, colocacao, pontos) VALUES ($1, $2, $3, $4) RETURNING *';
      queryParams = [prova_id, equipe_id, colocacao || null, parseInt(pontos)];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar resultado:', error);

    // Erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    // Erro de violação de chave única (ID duplicado)
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'ID já existe no sistema'
      });
    }

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Prova ou equipe não encontrada no sistema'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter resultado por ID
exports.obterResultado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      `SELECT 
        r.id,
        r.prova_id,
        r.equipe_id,
        r.colocacao,
        r.pontos,
        p.nome as prova_nome,
        e.nome as equipe_nome
      FROM resultado r
      LEFT JOIN prova p ON r.prova_id = p.id
      LEFT JOIN equipe e ON r.equipe_id = e.id
      WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resultado não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter resultado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar resultado
exports.atualizarResultado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { prova_id, equipe_id, colocacao, pontos } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o resultado existe
    const existingResultado = await query(
      'SELECT * FROM resultado WHERE id = $1',
      [id]
    );

    if (existingResultado.rows.length === 0) {
      return res.status(404).json({ error: 'Resultado não encontrado' });
    }

    // Validar pontos se fornecido
    if (pontos !== undefined && isNaN(pontos)) {
      return res.status(400).json({
        error: 'Pontos deve ser um número válido'
      });
    }

    // Validar colocação se fornecida
    if (colocacao !== undefined && colocacao !== null && colocacao !== '' && isNaN(colocacao)) {
      return res.status(400).json({
        error: 'Colocação deve ser um número válido'
      });
    }

    // Atualiza o resultado
    const updateResult = await query(
      'UPDATE resultado SET prova_id = $1, equipe_id = $2, colocacao = $3, pontos = $4 WHERE id = $5 RETURNING *',
      [
        prova_id || existingResultado.rows[0].prova_id,
        equipe_id || existingResultado.rows[0].equipe_id,
        colocacao !== undefined && colocacao !== '' ? parseInt(colocacao) : null,
        pontos !== undefined ? parseInt(pontos) : existingResultado.rows[0].pontos,
        id
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar resultado:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Prova ou equipe não encontrada no sistema'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar resultado
exports.deletarResultado = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o resultado existe
    const existingResultado = await query(
      'SELECT * FROM resultado WHERE id = $1',
      [id]
    );

    if (existingResultado.rows.length === 0) {
      return res.status(404).json({ error: 'Resultado não encontrado' });
    }

    // Deleta o resultado
    await query('DELETE FROM resultado WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar resultado:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar resultado com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};