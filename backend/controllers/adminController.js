const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');

// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, users });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Prevent self-demotion
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/transactions
// @access  Admin
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const query = {};
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('stockId', 'symbol name');

    res.status(200).json({ success: true, total, transactions });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/stats
// @access  Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStocks, totalTransactions, recentTransactions] =
      await Promise.all([
        User.countDocuments(),
        Stock.countDocuments({ isActive: true }),
        Transaction.countDocuments(),
        Transaction.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name'),
      ]);

    const volumeAgg = await Transaction.aggregate([
      { $group: { _id: '$type', totalAmount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStocks,
        totalTransactions,
        recentTransactions,
        volume: volumeAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUserRole, deleteUser, getAllTransactions, getPlatformStats };
