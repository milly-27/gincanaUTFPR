const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudProva = (req, res) => {
  console.log('provaController - Rota /abrirCrudProva - abrir o crudProva');
  res.sendFile(path.join(__dirname, '../../frontend/prova/prova.html'));
};

// Listar todas as provas
exports.listarProvas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM prova ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar provas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova prova
exports.criarProva = async (req, res) => {
  try {
    const { id, nome, categoria, dia } = req.body;

    // Validação básica
    if (!nome || !dia) {
      return res.status(400).json({
        error: 'Nome e dia são obrigatórios'
      });
    }

    // Se o ID não for fornecido, o banco gerará automaticamente (SERIAL)
    let queryText, queryParams;
    
    if (id) {
      queryText = 'INSERT INTO prova (id, nome, categoria, dia) VALUES ($1, $2, $3, $4) RETURNING *';
      queryParams = [id, nome, categoria, dia];
    } else {
      queryText = 'INSERT INTO prova (nome, categoria, dia) VALUES ($1, $2, $3) RETURNING *';
      queryParams = [nome, categoria, dia];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar prova:', error);

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

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter prova por ID
exports.obterProva = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM prova WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter prova:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar prova
exports.atualizarProva = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, categoria, dia } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a prova existe
    const existingProva = await query(
      'SELECT * FROM prova WHERE id = $1',
      [id]
    );

    if (existingProva.rows.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Atualiza a prova
    const updateResult = await query(
      'UPDATE prova SET nome = $1, categoria = $2, dia = $3 WHERE id = $4 RETURNING *',
      [
        nome || existingProva.rows[0].nome,
        categoria !== undefined ? categoria : existingProva.rows[0].categoria,
        dia || existingProva.rows[0].dia,
        id
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar prova:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar prova
exports.deletarProva = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a prova existe
    const existingProva = await query(
      'SELECT * FROM prova WHERE id = $1',
      [id]
    );

    if (existingProva.rows.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Deleta a prova
    await query('DELETE FROM prova WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar prova:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar prova com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};