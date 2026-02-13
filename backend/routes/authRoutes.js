const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// ======================================
// ROTAS DE AUTENTICAÇÃO
// ======================================
router.post('/registro', auth.registro);
router.post('/register', auth.registro); // Alias para compatibilidade
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/user', auth.verificarLogin);
router.get('/verificar', auth.verificarLogin); // Alias
router.put('/atualizarSenha', auth.atualizarSenha);

console.log('✅ Rotas de autenticação registradas:');
console.log('   POST /auth/registro');
console.log('   POST /auth/register');
console.log('   POST /auth/login');
console.log('   POST /auth/logout');
console.log('   GET /auth/user');
console.log('   GET /auth/verificar');
console.log('   PUT /auth/atualizarSenha');

module.exports = router;