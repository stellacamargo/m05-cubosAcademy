const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/', userController.cadastrarUsuario);


router.get('/', authMiddleware, userController.detalharPerfil);


router.put('/', authMiddleware, userController.editarPerfil);

module.exports = router;
