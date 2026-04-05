const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// 🔓 ROTAS PÚBLICAS (Não precisam de Token)
// Qualquer um pode acessar para criar conta e fazer login
router.post('/register', transactionController.register); 
router.post('/login', transactionController.login); 

// 🔒 ROTAS PRIVADAS (O "Segurança" verifyToken barra quem não tem o Token)
// Note que o `transactionController.verifyToken` fica no MEIO da rota
router.post('/', transactionController.verifyToken, transactionController.createTransaction);
router.get('/', transactionController.verifyToken, transactionController.getTransactions);
router.put('/:id', transactionController.verifyToken, transactionController.updateTransaction);
router.delete('/:id', transactionController.verifyToken, transactionController.deleteTransaction);

module.exports = router;