const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  zone: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High'] },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);