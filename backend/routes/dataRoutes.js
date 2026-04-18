const express = require('express');
const { 
    getLatestData, 
    getHistoricalData, 
    getEvents, 
    getTrafficData, 
    getPollutionData, 
    getStats,
    getCityDataByName 
} = require('../controllers/dataController');
const router = express.Router();

// Existing routes
router.get('/latest', getLatestData);
router.get('/historical', getHistoricalData);
router.get('/events', getEvents);

// Frontend-facing routes
router.get('/data', getLatestData);
router.get('/data/traffic', getTrafficData);
router.get('/data/pollution', getPollutionData);
router.get('/stats', getStats);

// NEW: Dynamic city search endpoint
router.get('/city', getCityDataByName);

module.exports = router;