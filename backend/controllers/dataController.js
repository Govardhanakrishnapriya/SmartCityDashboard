const CityData = require('../models/CityData');
const Event = require('../models/Event');

// Existing functions (keep them)
const getLatestData = async (req, res) => {
  try {
    const zones = ['North', 'South', 'East', 'West', 'Central'];
    const latestData = [];
    
    for (const zone of zones) {
      const data = await CityData.findOne({ zone }).sort({ timestamp: -1 });
      if (data) latestData.push(data);
    }
    
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistoricalData = async (req, res) => {
  try {
    const { zone, hours = 24 } = req.query;
    const query = {};
    if (zone) query.zone = zone;
    
    const since = new Date();
    since.setHours(since.getHours() - hours);
    query.timestamp = { $gte: since };
    
    const data = await CityData.find(query).sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ timestamp: -1 }).limit(10);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get traffic data in format frontend expects
const getTrafficData = async (req, res) => {
  try {
    const latestData = await CityData.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.json({ traffic: 2500, zones: [] });
    }
    
    // Calculate average traffic level across zones
    const allData = await CityData.find().sort({ timestamp: -1 }).limit(5);
    const avgTraffic = allData.reduce((acc, curr) => acc + curr.traffic.level, 0) / allData.length;
    
    // Convert to traffic flow value (0-3000 vehicles per hour)
    const trafficFlow = Math.floor((avgTraffic / 100) * 3000);
    
    res.json({
      traffic: trafficFlow,
      zones: allData.map(d => ({ zone: d.zone, level: d.traffic.level, congestion: d.traffic.congestion }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get pollution data in format frontend expects
const getPollutionData = async (req, res) => {
  try {
    const allData = await CityData.find().sort({ timestamp: -1 }).limit(5);
    const avgAqi = allData.reduce((acc, curr) => acc + curr.pollution.aqi, 0) / allData.length;
    
    res.json({
      aqi: Math.floor(avgAqi),
      zones: allData.map(d => ({ zone: d.zone, aqi: d.pollution.aqi, pm25: d.pollution.pm25, pm10: d.pollution.pm10 }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get stats for dashboard cards
const getStats = async (req, res) => {
  try {
    const allData = await CityData.find().sort({ timestamp: -1 }).limit(5);
    const avgTraffic = allData.reduce((acc, curr) => acc + curr.traffic.level, 0) / allData.length;
    const avgAqi = allData.reduce((acc, curr) => acc + curr.pollution.aqi, 0) / allData.length;
    const trafficFlow = Math.floor((avgTraffic / 100) * 3000);
    
    // Count incidents (high traffic + high pollution)
    const incidents = allData.filter(d => d.traffic.level > 70 || d.pollution.aqi > 150).length;
    
    // Transit rate (mock calculation)
    const transitRate = Math.floor(70 + (100 - avgTraffic) * 0.3);
    
    res.json({
      traffic: trafficFlow,
      aqi: Math.floor(avgAqi),
      incidents: incidents,
      transitRate: Math.min(100, transitRate)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLatestData, getHistoricalData, getEvents, getTrafficData, getPollutionData, getStats };