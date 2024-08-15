const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();


router.post('/login', userController.loginUsuario);

router.patch('/usuario/redefinir', authController.redefinirSenha);

module.exports = router;
