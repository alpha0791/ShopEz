const Stock = require('../models/Stock');

// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res, next) => {
  try {
    const { search, sector, sort = 'symbol', page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (sector && sector !== 'All') {
      query.sector = sector;
    }

    const sortOptions = {
      symbol: { symbol: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      change_desc: { changePercent: -1 },
      change_asc: { changePercent: 1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Stock.countDocuments(query);

    const stocks = await Stock.find(query)
      .select('-historicalData')
      .sort(sortOptions[sort] || { symbol: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stocks,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/stocks/:symbol
// @access  Public
const getStockBySymbol = async (req, res, next) => {
  try {
    const stock = await Stock.findOne({
      symbol: req.params.symbol.toUpperCase(),
      isActive: true,
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    res.status(200).json({ success: true, stock });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/stocks
// @access  Admin
const createStock = async (req, res, next) => {
  try {
    const stock = await Stock.create(req.body);
    res.status(201).json({ success: true, stock });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/stocks/:id
// @access  Admin
const updateStock = async (req, res, next) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    res.status(200).json({ success: true, stock });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/stocks/:id
// @access  Admin
const deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ message: 'Stock not found.' });
    }

    res.status(200).json({ success: true, message: 'Stock removed from market.' });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/stocks/:id/simulate
// @access  Admin — simulate price fluctuation
const simulatePrice = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found.' });

    const fluctuation = (Math.random() - 0.48) * 0.03; // ±3% with slight upward bias
    const newPrice = parseFloat((stock.price * (1 + fluctuation)).toFixed(2));

    // Add to historical data
    const today = new Date().toISOString().split('T')[0];
    stock.historicalData.push({
      date: today,
      open: stock.price,
      high: Math.max(stock.price, newPrice) * (1 + Math.random() * 0.005),
      low: Math.min(stock.price, newPrice) * (1 - Math.random() * 0.005),
      close: newPrice,
      volume: Math.floor(Math.random() * 5000000) + 1000000,
    });

    // Keep last 90 days
    if (stock.historicalData.length > 90) {
      stock.historicalData = stock.historicalData.slice(-90);
    }

    stock.previousClose = stock.price;
    stock.price = newPrice;
    await stock.save();

    res.status(200).json({ success: true, stock });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStocks, getStockBySymbol, createStock, updateStock, deleteStock, simulatePrice };
