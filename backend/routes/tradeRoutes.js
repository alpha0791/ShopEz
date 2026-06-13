const express = require('express');
const { buyStock, sellStock, getTradeHistory } = require('../controllers/tradeController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/buy', buyStock);
router.post('/sell', sellStock);
router.get('/history', getTradeHistory);

module.exports = router;
