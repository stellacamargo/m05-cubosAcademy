const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/', authMiddleware, orderController.criarPedido);


router.get('/', authMiddleware, orderController.listarPedidosUsuario);


router.get('/admin', authMiddleware, orderController.listarTodosPedidos);


router.put('/:id/status', authMiddleware, orderController.atualizarStatusPedido);

module.exports = router;
