const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudEquipe = (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/equipe/equipe.html'));
};

// Listar todas as equipes
exports.listarEquipes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM equipe ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar equipes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova equipe
exports.criarEquipe = async (req, res) => {
  try {
    const { id, nome_lider, nome_vice, cor, quantidade_alunos } = req.body;

    if (!nome_lider) return res.status(400).json({ error: 'Nome do líder é obrigatório' });
    if (!nome_vice)  return res.status(400).json({ error: 'Nome do vice é obrigatório' });
    if (!cor)        return res.status(400).json({ error: 'Cor da equipe é obrigatória' });
    if (!quantidade_alunos || quantidade_alunos <= 0)
      return res.status(400).json({ error: 'Quantidade de alunos deve ser maior que zero' });

    let queryText, queryParams;

    if (id) {
      queryText = `INSERT INTO equipe (id, nome_lider, nome_vice, cor, quantidade_alunos)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
      queryParams = [id, nome_lider, nome_vice, cor, quantidade_alunos];
    } else {
      queryText = `INSERT INTO equipe (nome_lider, nome_vice, cor, quantidade_alunos)
                   VALUES ($1, $2, $3, $4) RETURNING *`;
      queryParams = [nome_lider, nome_vice, cor, quantidade_alunos];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao criar equipe:', error);
    if (error.code === '23502') return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    if (error.code === '23505') return res.status(400).json({ error: 'ID já existe no sistema' });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter equipe por ID
exports.obterEquipe = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM equipe WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter equipe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar equipe
exports.atualizarEquipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_lider, nome_vice, cor, quantidade_alunos } = req.body;

    const existing = await query('SELECT * FROM equipe WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    const current = existing.rows[0];

    const result = await query(
      `UPDATE equipe
       SET nome_lider = $1, nome_vice = $2, cor = $3, quantidade_alunos = $4
       WHERE id = $5
       RETURNING *`,
      [
        nome_lider       ?? current.nome_lider,
        nome_vice        ?? current.nome_vice,
        cor              ?? current.cor,
        quantidade_alunos ?? current.quantidade_alunos,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar equipe:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar equipe
exports.deletarEquipe = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT * FROM equipe WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }

    await query('DELETE FROM equipe WHERE id = $1', [id]);
    res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar equipe:', error);
    if (error.code === '23503')
      return res.status(400).json({ error: 'Não é possível deletar equipe com dependências associadas' });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};