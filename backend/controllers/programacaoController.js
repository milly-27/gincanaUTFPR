const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudProgramacao = (req, res) => {
  console.log('programacaoController - Rota /abrirCrudProgramacao - abrir o crudProgramacao');
  res.sendFile(path.join(__dirname, '../../frontend/programacao/programacao.html'));
};

// Listar todas as programações
exports.listarProgramacoes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM programacao ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar programações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova programação
exports.criarProgramacao = async (req, res) => {
  try {
    const { id, dia, descricao } = req.body;

    // Validação básica
    if (!dia || !descricao) {
      return res.status(400).json({
        error: 'Dia e descrição são obrigatórios'
      });
    }

    // Se o ID não for fornecido, o banco gerará automaticamente (SERIAL)
    let queryText, queryParams;
    
    if (id) {
      queryText = 'INSERT INTO programacao (id, dia, descricao) VALUES ($1, $2, $3) RETURNING *';
      queryParams = [id, dia, descricao];
    } else {
      queryText = 'INSERT INTO programacao (dia, descricao) VALUES ($1, $2) RETURNING *';
      queryParams = [dia, descricao];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar programação:', error);

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

// Obter programação por ID
exports.obterProgramacao = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM programacao WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Programação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter programação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar programação
exports.atualizarProgramacao = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { dia, descricao } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a programação existe
    const existingProgramacao = await query(
      'SELECT * FROM programacao WHERE id = $1',
      [id]
    );

    if (existingProgramacao.rows.length === 0) {
      return res.status(404).json({ error: 'Programação não encontrada' });
    }

    // Atualiza a programação
    const updateResult = await query(
      'UPDATE programacao SET dia = $1, descricao = $2 WHERE id = $3 RETURNING *',
      [
        dia || existingProgramacao.rows[0].dia,
        descricao || existingProgramacao.rows[0].descricao,
        id
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar programação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar programação
exports.deletarProgramacao = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a programação existe
    const existingProgramacao = await query(
      'SELECT * FROM programacao WHERE id = $1',
      [id]
    );

    if (existingProgramacao.rows.length === 0) {
      return res.status(404).json({ error: 'Programação não encontrada' });
    }

    // Deleta a programação
    await query('DELETE FROM programacao WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar programação:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar programação com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};