require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const db = require('./database');

const HOST = 'localhost';
const PORT_FIXA = 3001;

// ============================================
// MIDDLEWARES
// ============================================

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-Access-Token',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
  maxAge: 86400
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Injeta db na request
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Log básico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ROTAS
// ============================================

app.use('/auth', require('./routes/authRoutes'));
app.use('/login', require('./routes/loginRoutes'));
app.use('/menu', require('./routes/menuRoutes'));
app.use('/cargos', require('./routes/cargoRoutes'));
app.use('/pessoas', require('./routes/pessoaRoutes'));
app.use('/produtos', require('./routes/produtoRoutes'));
app.use('/finalizacao', require('./routes/finalizacaoRoutes'));
app.use('/api/relatorios', require('./routes/relatorioRoutes'));
app.use('/doacoes-produtos', require('./routes/doacaoProdutoRoutes'));
app.use('/equipes', require('./routes/equipeRoutes'));
app.use('/resultados', require('./routes/resultadoRoutes'));
app.use('/programacoes', require('./routes/programacaoRoutes'));

// Rotas opcionais — descomente se os arquivos existirem
// app.use('/categorias', require('./routes/categoriaRoutes'));
// app.use('/funcionarios', require('./routes/funcionarioRoutes'));
// app.use('/clientes', require('./routes/clienteRoutes'));
// app.use('/cardapio', require('./routes/cardapioRoutes'));
// app.use('/pedido', require('./routes/pedidoRoutes'));
// app.use('/pedidoproduto', require('./routes/pedidoprodutoRoutes'));
// app.use('/pagamento', require('./routes/pagamentoRoutes'));
// app.use('/forma_pagamentos', require('./routes/forma_pagamentoRoutes'));
// app.use('/pagamento_has_formapagamentos', require('./routes/pagamento_has_formapagamentoRoutes'));

// ============================================
// ROTAS PADRÃO
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const ok = await db.testConnection();
    if (ok) {
      res.status(200).json({ status: 'OK', database: 'PostgreSQL', timestamp: new Date().toISOString() });
    } else {
      res.status(500).json({ status: 'ERROR', message: 'Falha na conexão com o banco', timestamp: new Date().toISOString() });
    }
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message, timestamp: new Date().toISOString() });
  }
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `${req.originalUrl} não existe`,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

const startServer = async () => {
  try {
    const connectionTest = await db.testConnection();

    if (connectionTest === 'mock') {
      console.log('Usando dados mockados');
      global.useMockData = true;
      global.mockDatabase = require('./mockData');
    } else if (!connectionTest) {
      console.error('Falha na conexão com PostgreSQL');
      process.exit(1);
    } else {
      console.log('PostgreSQL conectado');
    }

    const PORT = process.env.PORT || PORT_FIXA;
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    await db.pool.end();
    process.exit(0);
  } catch {
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();