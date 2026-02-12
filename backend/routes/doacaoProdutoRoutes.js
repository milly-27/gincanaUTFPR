const express = require('express');
const router = express.Router();
const doacaoProdutoController = require('../controllers/doacaoProdutoController');

// CRUD de Doação de Produtos
router.get('/abrirCrudDoacaoProduto', doacaoProdutoController.abrirCrudDoacaoProduto);
router.get('/', doacaoProdutoController.listarDoacoesProdutos);
router.post('/', doacaoProdutoController.criarDoacaoProduto);
router.get('/:id', doacaoProdutoController.obterDoacaoProduto);
router.put('/:id', doacaoProdutoController.atualizarDoacaoProduto);
router.delete('/:id', doacaoProdutoController.deletarDoacaoProduto);

module.exports = router;