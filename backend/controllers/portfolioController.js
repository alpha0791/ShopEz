const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');

// @route   GET /api/portfolio
// @access  Protected
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id }).populate(
      'holdings.stockId',
      'symbol name price change changePercent sector'
    );

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found.' });
    }

    // Compute current value and unrealized P&L for each holding
    const enrichedHoldings = portfolio.holdings.map((h) => {
      const currentPrice = h.stockId?.price ?? h.avgBuyPrice;
      const currentValue = parseFloat((currentPrice * h.quantity).toFixed(2));
      const unrealizedPnL = parseFloat((currentValue - h.totalInvested).toFixed(2));
      const unrealizedPnLPct = parseFloat(
        ((unrealizedPnL / h.totalInvested) * 100).toFixed(2)
      );

      return {
        stockId: h.stockId?._id,
        symbol: h.symbol,
        stockName: h.stockName,
        sector: h.stockId?.sector,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        currentPrice,
        totalInvested: h.totalInvested,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPct,
        change: h.stockId?.change,
        changePercent: h.stockId?.changePercent,
      };
    });

    const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalUnrealizedPnL = enrichedHoldings.reduce((sum, h) => sum + h.unrealizedPnL, 0);

    res.status(200).json({
      success: true,
      portfolio: {
        holdings: enrichedHoldings,
        totalInvested: portfolio.totalInvested,
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalUnrealizedPnL: parseFloat(totalUnrealizedPnL.toFixed(2)),
        realizedPnL: portfolio.realizedPnL,
        virtualBalance: req.user.virtualBalance,
        totalPortfolioValue: parseFloat(
          (totalCurrentValue + req.user.virtualBalance).toFixed(2)
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPortfolio };
