const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  triggered_at: { type: Date, required: true },
  completed_at: { type: Date, required: true },
  records_synced: { type: Number, default: 0 },
  status: { type: String, required: true }, // success, failed
  error_message: { type: String }
});

module.exports = mongoose.model('SyncLog', syncLogSchema);
