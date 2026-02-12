const express = require('express');
const router = express.Router();
const programacaoController = require('../controllers/programacaoController');

// CRUD de Programação
router.get('/abrirCrudProgramacao', programacaoController.abrirCrudProgramacao);
router.get('/', programacaoController.listarProgramacoes);
router.post('/', programacaoController.criarProgramacao);
router.get('/:id', programacaoController.obterProgramacao);
router.put('/:id', programacaoController.atualizarProgramacao);
router.delete('/:id', programacaoController.deletarProgramacao);

module.exports = router;