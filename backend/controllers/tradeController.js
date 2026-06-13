const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @route   POST /api/trades/buy
// @access  Protected
const buyStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Please provide stockId and quantity (min 1).' });
    }

    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive) {
      return res.status(404).json({ message: 'Stock not found or inactive.' });
    }

    const user = await User.findById(req.user._id);
    const totalCost = parseFloat((stock.price * quantity).toFixed(2));

    if (user.virtualBalance < totalCost) {
      return res.status(400).json({
        message: `Insufficient balance. Required: ₹${totalCost.toLocaleString()}, Available: ₹${user.virtualBalance.toLocaleString()}`,
      });
    }

    const balanceBefore = user.virtualBalance;
    user.virtualBalance = parseFloat((user.virtualBalance - totalCost).toFixed(2));
    await user.save();

    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId: user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: user._id, holdings: [], totalInvested: 0, realizedPnL: 0 });
    }

    const holdingIdx = portfolio.holdings.findIndex(
      (h) => h.stockId.toString() === stockId
    );

    if (holdingIdx > -1) {
      const existing = portfolio.holdings[holdingIdx];
      const newQty = existing.quantity + quantity;
      const newInvested = existing.totalInvested + totalCost;
      portfolio.holdings[holdingIdx].quantity = newQty;
      portfolio.holdings[holdingIdx].avgBuyPrice = parseFloat((newInvested / newQty).toFixed(2));
      portfolio.holdings[holdingIdx].totalInvested = parseFloat(newInvested.toFixed(2));
    } else {
      portfolio.holdings.push({
        stockId: stock._id,
        symbol: stock.symbol,
        stockName: stock.name,
        quantity,
        avgBuyPrice: stock.price,
        totalInvested: totalCost,
      });
    }

    portfolio.totalInvested = parseFloat((portfolio.totalInvested + totalCost).toFixed(2));
    await portfolio.save();

    // Record transaction
    const transaction = await Transaction.create({
      userId: user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'buy',
      quantity,
      priceAtTrade: stock.price,
      totalAmount: totalCost,
      balanceBefore,
      balanceAfter: user.virtualBalance,
    });

    res.status(200).json({
      success: true,
      message: `Successfully bought ${quantity} share(s) of ${stock.symbol}.`,
      transaction,
      newBalance: user.virtualBalance,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/trades/sell
// @access  Protected
const sellStock = async (req, res, next) => {
  try {
    const { stockId, quantity } = req.body;

    if (!stockId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Please provide stockId and quantity (min 1).' });
    }

    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    const user = await User.findById(req.user._id);
    const portfolio = await Portfolio.findOne({ userId: user._id });

    const holdingIdx = portfolio?.holdings.findIndex(
      (h) => h.stockId.toString() === stockId
    );

    if (!portfolio || holdingIdx === undefined || holdingIdx < 0) {
      return res.status(400).json({ message: `You don't own any shares of ${stock.symbol}.` });
    }

    const holding = portfolio.holdings[holdingIdx];

    if (holding.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient shares. You own ${holding.quantity} share(s) of ${stock.symbol}.`,
      });
    }

    const saleValue = parseFloat((stock.price * quantity).toFixed(2));
    const costBasis = parseFloat((holding.avgBuyPrice * quantity).toFixed(2));
    const pnl = parseFloat((saleValue - costBasis).toFixed(2));

    const balanceBefore = user.virtualBalance;
    user.virtualBalance = parseFloat((user.virtualBalance + saleValue).toFixed(2));
    await user.save();

    // Update portfolio
    holding.quantity -= quantity;
    holding.totalInvested = parseFloat((holding.avgBuyPrice * holding.quantity).toFixed(2));

    if (holding.quantity === 0) {
      portfolio.holdings.splice(holdingIdx, 1);
    }

    portfolio.totalInvested = Math.max(0, parseFloat((portfolio.totalInvested - costBasis).toFixed(2)));
    portfolio.realizedPnL = parseFloat((portfolio.realizedPnL + pnl).toFixed(2));
    await portfolio.save();

    const transaction = await Transaction.create({
      userId: user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'sell',
      quantity,
      priceAtTrade: stock.price,
      totalAmount: saleValue,
      balanceBefore,
      balanceAfter: user.virtualBalance,
    });

    res.status(200).json({
      success: true,
      message: `Successfully sold ${quantity} share(s) of ${stock.symbol}.`,
      transaction,
      newBalance: user.virtualBalance,
      pnl,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/trades/history
// @access  Protected
const getTradeHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('stockId', 'symbol name sector');

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { buyStock, sellStock, getTradeHistory };
