const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.listarProdutos);


router.post('/', productController.cadastrarProduto);

router.put('/:id', productController.atualizarProduto);


router.patch('/:id/estoque', productController.atualizarQuantidadeEstoque);


router.patch('/:id/foto', productController.atualizarFotoProduto);


router.delete('/:id', productController.deletarProduto);

module.exports = router;
