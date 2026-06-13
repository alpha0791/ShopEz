const express = require('express');
const { getPortfolio } = require('../controllers/portfolioController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, getPortfolio);

module.exports = router;
