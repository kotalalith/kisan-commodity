const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true }, // The slugified ID (market_commodity_date_gov)
  state: { type: String, required: true, index: true },
  district: { type: String },
  market: { type: String, required: true, index: true },
  commodity: { type: String, required: true, index: true },
  variety: { type: String },
  min_price: { type: Number, default: 0 },
  max_price: { type: Number, default: 0 },
  modal_price: { type: Number, default: 0 },
  arrival_date: { type: String, required: true },
  parsed_date: { type: Date, required: true, index: true }, // For the 90-day cleanup and history sorting
  source: { type: String, default: 'gov' },
  last_synced: { type: Date, default: Date.now }
});

// Create compound index for faster API history queries
mandiPriceSchema.index({ commodity: 1, market: 1, parsed_date: -1 });

module.exports = mongoose.model('MandiPrice', mandiPriceSchema);
