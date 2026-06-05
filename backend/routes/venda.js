const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/VendaController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas são protegidas
router.use(authMiddleware);

router.get('/', vendaController.history);
router.post('/checkout', vendaController.checkout);
router.post('/pay', vendaController.pay);

module.exports = router;