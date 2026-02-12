const express = require('express');
const router = express.Router();
const equipeController = require('../controllers/equipeController');

// CRUD de Equipes
router.get('/abrirCrudEquipe', equipeController.abrirCrudEquipe);
router.get('/', equipeController.listarEquipes);
router.post('/', equipeController.criarEquipe);
router.get('/:id', equipeController.obterEquipe);
router.put('/:id', equipeController.atualizarEquipe);
router.delete('/:id', equipeController.deletarEquipe);

module.exports = router;