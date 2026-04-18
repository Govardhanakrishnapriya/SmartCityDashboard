const mongoose = require('mongoose');

const cityDataSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    enum: ['North', 'South', 'East', 'West', 'Central']
  },
  traffic: {
    level: { type: Number, min: 0, max: 100 },
    congestion: { type: String, enum: ['Low', 'Medium', 'High', 'Severe'] }
  },
  pollution: {
    aqi: { type: Number, min: 0, max: 500 },
    pm25: { type: Number },
    pm10: { type: Number }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CityData', cityDataSchema);
