const mongoose = require('mongoose');

const pricePointSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, default: 0 },
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Healthcare',
        'Finance',
        'Energy',
        'Consumer',
        'Industrial',
        'Real Estate',
        'Utilities',
        'Materials',
        'Telecommunications',
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    previousClose: {
      type: Number,
      required: true,
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
    },
    volume: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    historicalData: [pricePointSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: calculate change on price set
stockSchema.pre('save', function (next) {
  if (this.isModified('price') || this.isModified('previousClose')) {
    this.change = parseFloat((this.price - this.previousClose).toFixed(2));
    this.changePercent = parseFloat(
      (((this.price - this.previousClose) / this.previousClose) * 100).toFixed(2)
    );
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
