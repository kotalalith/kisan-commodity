const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  appName: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  status: { type: String, default: 'approved' }, // approved, suspended
  usage_today: { type: Number, default: 0 },
  usage_total: { type: Number, default: 0 },
  fcm_token: { type: String }, // For push notifications
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
