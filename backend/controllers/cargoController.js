const { query } = require('../database');
const path = require('path');

// Abrir página HTML do CRUD
exports.abrirCrudCargo = (req, res) => {
  console.log('cargoController - Rota /abrirCrudCargo - abrir o crudCargo');
  res.sendFile(path.join(__dirname, '../../frontend/cargo/cargo.html'));
};

// Listar todos os cargos
exports.listarCargos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cargo ORDER BY id_cargo');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar cargos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo cargo
exports.criarCargo = async (req, res) => {
  try {
    const { id_cargo, nome_cargo } = req.body;

    // Validação básica
    if (!nome_cargo) {
      return res.status(400).json({
        error: 'Nome do cargo é obrigatório'
      });
    }

    // Se o ID não for fornecido, o banco gerará automaticamente (SERIAL)
    let queryText, queryParams;
    
    if (id_cargo) {
      queryText = 'INSERT INTO cargo (id_cargo, nome_cargo) VALUES ($1, $2) RETURNING *';
      queryParams = [id_cargo, nome_cargo];
    } else {
      queryText = 'INSERT INTO cargo (nome_cargo) VALUES ($1) RETURNING *';
      queryParams = [nome_cargo];
    }

    const result = await query(queryText, queryParams);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Erro ao criar cargo:', error);

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

// Obter cargo por ID
exports.obterCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar cargo
exports.atualizarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_cargo } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o cargo existe
    const existingCargo = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (existingCargo.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    // Atualiza o cargo
    const updateResult = await query(
      'UPDATE cargo SET nome_cargo = $1 WHERE id_cargo = $2 RETURNING *',
      [nome_cargo || existingCargo.rows[0].nome_cargo, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar cargo
exports.deletarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    // Verifica se o cargo existe
    const existingCargo = await query(
      'SELECT * FROM cargo WHERE id_cargo = $1',
      [id]
    );

    if (existingCargo.rows.length === 0) {
      return res.status(404).json({ error: 'Cargo não encontrado' });
    }

    // Deleta o cargo
    await query('DELETE FROM cargo WHERE id_cargo = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cargo:', error);

    // Erro de violação de foreign key
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar cargo com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};