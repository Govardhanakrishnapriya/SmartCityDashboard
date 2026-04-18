const express = require('express');
const { getLatestData, getHistoricalData, getEvents, getTrafficData, getPollutionData } = require('../controllers/dataController');
const router = express.Router();

// Original endpoints (keep for compatibility)
router.get('/latest', getLatestData);
router.get('/historical', getHistoricalData);
router.get('/events', getEvents);

// NEW endpoints for teammate's frontend
router.get('/data', getLatestData);           // For getCityData()
router.get('/data/traffic', getTrafficData);  // For getTrafficData()
router.get('/data/pollution', getPollutionData); // For getPollutionData()

module.exports = router;