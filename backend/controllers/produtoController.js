const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudProduto = (req, res) => {
  console.log('produtoController - Rota /abrirCrudProduto - abrir o crudProduto');
  res.sendFile(path.join(__dirname, '../../frontend/produto/produto.html'));
};

// Listar todos os produtos
exports.listarProdutos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM produtos ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo produto
exports.criarProduto = async (req, res) => {
  try {
    const { id, descricao, unidade, pontos } = req.body;

    // Validação básica
    if (!descricao || !unidade || pontos === undefined || pontos === null) {
      return res.status(400).json({
        error: 'Descrição, unidade e pontos são obrigatórios'
      });
    }

    // Validar se pontos é um número
    if (isNaN(pontos)) {
      return res.status(400).json({
        error: 'Pontos deve ser um número válido'
      });
    }

    // Se o ID não for fornecido, o banco gerará automaticamente (SERIAL)
    let queryText, queryParams;
    
    if (id) {
      queryText = 'INSERT INTO produtos (id, descricao, unidade, pontos) VALUES ($1, $2, $3, $4) RETURNING *';
      queryParams = [id, descricao, unidade, parseInt(pontos)];
    } else {
      queryText = 'INSERT INTO produtos (descricao, unidade, pontos) VALUES ($1, $2, $3) RETURNING *';
      queryParams = [descricao, unidade, parseInt(pontos)];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);

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

// Obter produto por ID
exports.obterProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar produto
exports.atualizarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { descricao, unidade, pontos } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o produto existe
    const existingProduto = await query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );

    if (existingProduto.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Validar pontos se fornecido
    if (pontos !== undefined && isNaN(pontos)) {
      return res.status(400).json({
        error: 'Pontos deve ser um número válido'
      });
    }

    // Atualiza o produto
    const updateResult = await query(
      'UPDATE produtos SET descricao = $1, unidade = $2, pontos = $3 WHERE id = $4 RETURNING *',
      [
        descricao || existingProduto.rows[0].descricao,
        unidade || existingProduto.rows[0].unidade,
        pontos !== undefined ? parseInt(pontos) : existingProduto.rows[0].pontos,
        id
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar produto
exports.deletarProduto = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o produto existe
    const existingProduto = await query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );

    if (existingProduto.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Deleta o produto
    await query('DELETE FROM produtos WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar produto com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};