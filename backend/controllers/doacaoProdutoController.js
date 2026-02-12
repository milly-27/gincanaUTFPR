const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudDoacaoProduto = (req, res) => {
  console.log('doacaoProdutoController - Rota /abrirCrudDoacaoProduto');
  res.sendFile(path.join(__dirname, '../../frontend/doacao_produto/doacao_produto.html'));
};

// Listar todas as doações de produtos com informações das tabelas relacionadas
exports.listarDoacoesProdutos = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        dp.id,
        dp.equipe_id,
        e.nome as equipe_nome,
        dp.produto_id,
        p.nome as produto_nome,
        dp.quantidade,
        dp.pontos_total
      FROM doacao_produto dp
      LEFT JOIN equipe e ON dp.equipe_id = e.id
      LEFT JOIN produtos p ON dp.produto_id = p.id
      ORDER BY dp.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar doações de produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar nova doação de produto
exports.criarDoacaoProduto = async (req, res) => {
  try {
    const { equipe_id, produto_id, quantidade, pontos_total } = req.body;

    // Validações básicas
    if (!equipe_id) {
      return res.status(400).json({ error: 'ID da equipe é obrigatório' });
    }
    if (!produto_id) {
      return res.status(400).json({ error: 'ID do produto é obrigatório' });
    }
    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }
    if (!pontos_total || pontos_total < 0) {
      return res.status(400).json({ error: 'Pontos total deve ser informado' });
    }

    // Verifica se a equipe existe
    const equipeExists = await query('SELECT id FROM equipe WHERE id = $1', [equipe_id]);
    if (equipeExists.rows.length === 0) {
      return res.status(400).json({ error: 'Equipe não encontrada' });
    }

    // Verifica se o produto existe
    const produtoExists = await query('SELECT id FROM produtos WHERE id = $1', [produto_id]);
    if (produtoExists.rows.length === 0) {
      return res.status(400).json({ error: 'Produto não encontrado' });
    }

    const result = await query(
      `INSERT INTO doacao_produto (equipe_id, produto_id, quantidade, pontos_total) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [equipe_id, produto_id, quantidade, pontos_total]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar doação de produto:', error);

    // Erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Equipe ou produto não encontrado' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter doação de produto por ID
exports.obterDoacaoProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      `SELECT 
        dp.*,
        e.nome as equipe_nome,
        p.nome as produto_nome
       FROM doacao_produto dp
       LEFT JOIN equipe e ON dp.equipe_id = e.id
       LEFT JOIN produtos p ON dp.produto_id = p.id
       WHERE dp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doação de produto não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter doação de produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar doação de produto
exports.atualizarDoacaoProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { equipe_id, produto_id, quantidade, pontos_total } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Validações
    if (quantidade !== undefined && quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }
    if (pontos_total !== undefined && pontos_total < 0) {
      return res.status(400).json({ error: 'Pontos total não pode ser negativo' });
    }

    // Verifica se a doação existe
    const existingDoacao = await query(
      'SELECT * FROM doacao_produto WHERE id = $1',
      [id]
    );

    if (existingDoacao.rows.length === 0) {
      return res.status(404).json({ error: 'Doação de produto não encontrada' });
    }

    // Verifica se a equipe existe (se foi informada)
    if (equipe_id) {
      const equipeExists = await query('SELECT id FROM equipe WHERE id = $1', [equipe_id]);
      if (equipeExists.rows.length === 0) {
        return res.status(400).json({ error: 'Equipe não encontrada' });
      }
    }

    // Verifica se o produto existe (se foi informado)
    if (produto_id) {
      const produtoExists = await query('SELECT id FROM produtos WHERE id = $1', [produto_id]);
      if (produtoExists.rows.length === 0) {
        return res.status(400).json({ error: 'Produto não encontrado' });
      }
    }

    const currentDoacao = existingDoacao.rows[0];
    const updatedFields = {
      equipe_id: equipe_id !== undefined ? equipe_id : currentDoacao.equipe_id,
      produto_id: produto_id !== undefined ? produto_id : currentDoacao.produto_id,
      quantidade: quantidade !== undefined ? quantidade : currentDoacao.quantidade,
      pontos_total: pontos_total !== undefined ? pontos_total : currentDoacao.pontos_total
    };

    const updateResult = await query(
      `UPDATE doacao_produto 
       SET equipe_id = $1, produto_id = $2, quantidade = $3, pontos_total = $4 
       WHERE id = $5 RETURNING *`,
      [updatedFields.equipe_id, updatedFields.produto_id, updatedFields.quantidade, 
       updatedFields.pontos_total, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar doação de produto:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Equipe ou produto não encontrado' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar doação de produto
exports.deletarDoacaoProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se a doação existe
    const existingDoacao = await query(
      'SELECT * FROM doacao_produto WHERE id = $1',
      [id]
    );

    if (existingDoacao.rows.length === 0) {
      return res.status(404).json({ error: 'Doação de produto não encontrada' });
    }

    // Deleta a doação
    await query('DELETE FROM doacao_produto WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar doação de produto:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar doação com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};