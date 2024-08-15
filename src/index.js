const express = require('express');
require('dotenv').config();
const { Pool } = require('pg');
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce',
    password: '123456',
    port: 5432,
});


app.use((req, res, next) => {
    req.pool = pool;
    next();
});


app.use('/auth', authRoutes);
app.use('/usuario', userRoutes);
app.use('/produtos', authMiddleware, productRoutes);
app.use('/usuario/produtos', productController.listarProdutos);
app.use('/pedidos', authMiddleware, orderRoutes);
app.use('/login', userController.loginUsuario);
app.use('/usuario/redefinir', authController.redefinirSenha);
app.use('/pedidos/:id/cancelar', orderController.cancelarPedido);


app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
