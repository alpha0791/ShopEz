import { useState } from 'react';
import { tradesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './TradeModal.css';

const TradeModal = ({ stock, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalCost = (stock.price * quantity).toFixed(2);
  const canAfford = user?.virtualBalance >= parseFloat(totalCost);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity < 1) return;

    setLoading(true);
    try {
      const payload = { stockId: stock._id, quantity: parseInt(quantity) };
      let res;

      if (tradeType === 'buy') {
        res = await tradesAPI.buy(payload);
      } else {
        res = await tradesAPI.sell(payload);
      }

      const { message, newBalance } = res.data;
      updateUser({ ...user, virtualBalance: newBalance });
      toast.success(message);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Trade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal trade-modal">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{stock.symbol}</h3>
            <p className="modal-subtitle">{stock.name}</p>
          </div>
          <button className="modal-close btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Trade type toggle */}
          <div className="trade-toggle">
            <button
              id="buy-tab"
              className={`trade-tab ${tradeType === 'buy' ? 'active buy' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              📈 Buy
            </button>
            <button
              id="sell-tab"
              className={`trade-tab ${tradeType === 'sell' ? 'active sell' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              📉 Sell
            </button>
          </div>

          <form onSubmit={handleSubmit} className="trade-form">
            {/* Price info */}
            <div className="trade-info-grid">
              <div className="trade-info-item">
                <span className="trade-info-label">Market Price</span>
                <span className="trade-info-value">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="trade-info-item">
                <span className="trade-info-label">Change</span>
                <span className={`trade-info-value ${stock.change >= 0 ? 'price-up' : 'price-down'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                </span>
              </div>
              <div className="trade-info-item">
                <span className="trade-info-label">Your Balance</span>
                <span className="trade-info-value" style={{ color: 'var(--color-success-light)' }}>
                  ₹{user?.virtualBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Quantity input */}
            <div className="form-group">
              <label className="form-label" htmlFor="qty-input">Quantity (shares)</label>
              <div className="qty-input-wrapper">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >−</button>
                <input
                  id="qty-input"
                  type="number"
                  className="form-input qty-input"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >+</button>
              </div>
            </div>

            {/* Total */}
            <div className="trade-total">
              <span>Total {tradeType === 'buy' ? 'Cost' : 'Returns'}</span>
              <span className="trade-total-value">
                ₹{parseFloat(totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Warning */}
            {tradeType === 'buy' && !canAfford && (
              <p className="trade-warning">⚠️ Insufficient balance for this trade.</p>
            )}

            <button
              type="submit"
              className={`btn btn-lg ${tradeType === 'buy' ? 'btn-success' : 'btn-danger'}`}
              style={{ width: '100%' }}
              disabled={loading || (tradeType === 'buy' && !canAfford)}
            >
              {loading ? (
                <><div className="spinner spinner-sm" /> Processing...</>
              ) : (
                `${tradeType === 'buy' ? '📈 Buy' : '📉 Sell'} ${quantity} Share${quantity > 1 ? 's' : ''}`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
