const express = require('express');
const {
  getStocks,
  getStockBySymbol,
  createStock,
  updateStock,
  deleteStock,
  simulatePrice,
} = require('../controllers/stockController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getStocks);
router.get('/:symbol', getStockBySymbol);
router.post('/', verifyToken, requireAdmin, createStock);
router.put('/:id', verifyToken, requireAdmin, updateStock);
router.delete('/:id', verifyToken, requireAdmin, deleteStock);
router.post('/:id/simulate', verifyToken, requireAdmin, simulatePrice);

module.exports = router;
