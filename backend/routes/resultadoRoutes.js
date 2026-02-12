const express = require('express');
const router = express.Router();
const resultadoController = require('../controllers/resultadoController');

// CRUD de Resultados
router.get('/abrirCrudResultado', resultadoController.abrirCrudResultado);
router.get('/', resultadoController.listarResultados);
router.get('/provas', resultadoController.listarProvas);
router.get('/equipes', resultadoController.listarEquipes);
router.post('/', resultadoController.criarResultado);
router.get('/:id', resultadoController.obterResultado);
router.put('/:id', resultadoController.atualizarResultado);
router.delete('/:id', resultadoController.deletarResultado);

module.exports = router;