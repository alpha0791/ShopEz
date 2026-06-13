import { Link } from 'react-router-dom';

const formatChange = (change, changePercent) => {
  const sign = change >= 0 ? '+' : '';
  return { sign, cls: change >= 0 ? 'price-up' : 'price-down' };
};

const StockCard = ({ stock, onClick }) => {
  const { sign, cls } = formatChange(stock.change, stock.changePercent);

  return (
    <div
      className="stock-card card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="stock-card-header">
        <div>
          <div className="stock-symbol">{stock.symbol}</div>
          <div className="stock-name">{stock.name}</div>
        </div>
        <span className="sector-tag">{stock.sector}</span>
      </div>
      <div className="stock-card-footer">
        <div className="stock-price">
          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`stock-change ${cls}`}>
          {sign}{stock.change?.toFixed(2)} ({sign}{stock.changePercent?.toFixed(2)}%)
        </div>
      </div>
    </div>
  );
};

export default StockCard;
