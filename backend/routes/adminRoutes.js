const express = require('express');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllTransactions,
  getPlatformStats,
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/transactions', getAllTransactions);
router.get('/stats', getPlatformStats);

module.exports = router;
