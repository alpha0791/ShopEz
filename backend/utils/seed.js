require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

const generateHistory = (basePrice, days = 60) => {
  const history = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const fluctuation = (Math.random() - 0.48) * 0.025;
    const open = price;
    price = parseFloat((price * (1 + fluctuation)).toFixed(2));
    history.push({
      date: date.toISOString().split('T')[0],
      open,
      high: parseFloat((Math.max(open, price) * (1 + Math.random() * 0.008)).toFixed(2)),
      low: parseFloat((Math.min(open, price) * (1 - Math.random() * 0.008)).toFixed(2)),
      close: price,
      volume: Math.floor(Math.random() * 8000000) + 500000,
    });
  }
  return history;
};

const stocksData = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', price: 2850, previousClose: 2830, marketCap: 19200000000000, description: 'India\'s largest conglomerate with interests in petrochemicals, refining, oil & gas, retail and telecommunications.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology', price: 3920, previousClose: 3890, marketCap: 14200000000000, description: 'India\'s largest IT services company providing consulting and business solutions globally.' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Finance', price: 1680, previousClose: 1665, marketCap: 12500000000000, description: 'India\'s largest private sector bank by assets, offering retail and wholesale banking services.' },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Technology', price: 1780, previousClose: 1760, marketCap: 7400000000000, description: 'Global leader in next-generation digital services and consulting.' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Finance', price: 1120, previousClose: 1105, marketCap: 7900000000000, description: 'Leading private sector bank in India offering a diversified portfolio of financial services.' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'Consumer', price: 2450, previousClose: 2430, marketCap: 5700000000000, description: 'India\'s largest FMCG company with brands in beauty, health, home care, and food.' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Finance', price: 780, previousClose: 772, marketCap: 6900000000000, description: 'India\'s largest public sector bank serving over 500 million customers.' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance', price: 7200, previousClose: 7150, marketCap: 4300000000000, description: 'India\'s leading non-banking financial company (NBFC) offering consumer lending services.' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'Technology', price: 480, previousClose: 475, marketCap: 2600000000000, description: 'Global IT, consulting, and business process services company.' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer', price: 2900, previousClose: 2875, marketCap: 2800000000000, description: 'India\'s largest paint company and Asia\'s third largest paint manufacturer.' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Consumer', price: 12500, previousClose: 12380, marketCap: 3800000000000, description: 'India\'s largest passenger vehicle manufacturer with a market share over 40%.' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', sector: 'Healthcare', price: 1650, previousClose: 1635, marketCap: 3900000000000, description: 'India\'s largest pharmaceutical company and fourth largest specialty generic company globally.' },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', sector: 'Healthcare', price: 6200, previousClose: 6150, marketCap: 1030000000000, description: 'Indian multinational pharmaceutical company and one of the leading generics manufacturers.' },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'Technology', price: 5400, previousClose: 5350, marketCap: 1600000000000, description: 'Global technology consulting and digital solutions company formed by LTI and Mindtree merger.' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'Consumer', price: 2300, previousClose: 2280, marketCap: 2200000000000, description: 'India operations of Swiss food and beverage giant Nestlé, makers of Maggi, KitKat, and Munch.' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Utilities', price: 320, previousClose: 317, marketCap: 2970000000000, description: 'Central transmission utility of India responsible for the country\'s power grid.' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Consumer', price: 950, previousClose: 940, marketCap: 3500000000000, description: 'India\'s largest automobile manufacturer making cars, trucks, vans, coaches, buses, and military vehicles.' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', sector: 'Industrial', price: 1350, previousClose: 1330, marketCap: 2900000000000, description: 'India\'s largest port developer and operator with over 14 ports across India.' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'Technology', price: 1640, previousClose: 1625, marketCap: 4400000000000, description: 'Indian multinational IT services company providing software development and IT consulting.' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer', price: 3450, previousClose: 3420, marketCap: 3000000000000, description: 'India\'s leading lifestyle company making watches, jewellery, eyewear, and accessories.' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Stock.deleteMany({});
    await User.deleteMany({});
    await Portfolio.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed stocks with historical data
    const stocksWithHistory = stocksData.map((s) => ({
      ...s,
      change: parseFloat((s.price - s.previousClose).toFixed(2)),
      changePercent: parseFloat((((s.price - s.previousClose) / s.previousClose) * 100).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      historicalData: generateHistory(s.previousClose * 0.85, 60),
    }));

    await Stock.insertMany(stocksWithHistory);
    console.log(`✅ Seeded ${stocksWithHistory.length} stocks`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shopez.com',
      password: 'Admin@123',
      role: 'admin',
      virtualBalance: 1000000,
    });
    await Portfolio.create({ userId: admin._id, holdings: [] });

    // Create demo user
    const demo = await User.create({
      name: 'Demo Trader',
      email: 'demo@shopez.com',
      password: 'Demo@123',
      role: 'user',
      virtualBalance: 100000,
    });
    await Portfolio.create({ userId: demo._id, holdings: [] });

    console.log('✅ Seeded admin user: admin@shopez.com / Admin@123');
    console.log('✅ Seeded demo user: demo@shopez.com / Demo@123');
    console.log('🚀 Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
