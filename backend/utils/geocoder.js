const axios = require('axios');

// Convert any city name to coordinates using OpenStreetMap Nominatim
async function getCoordinates(cityName) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'SmartCityDashboard/1.0' // Required by Nominatim
                },
                timeout: 5000
            }
        );
        
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
                displayName: response.data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

// Get bounding box for a city (to fetch events in the area)
async function getCityBoundingBox(cityName) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&polygon_geojson=1`,
            {
                headers: { 'User-Agent': 'SmartCityDashboard/1.0' },
                timeout: 5000
            }
        );
        
        if (response.data && response.data[0] && response.data[0].boundingbox) {
            const bbox = response.data[0].boundingbox;
            return {
                minLat: parseFloat(bbox[0]),
                maxLat: parseFloat(bbox[1]),
                minLon: parseFloat(bbox[2]),
                maxLon: parseFloat(bbox[3])
            };
        }
        return null;
    } catch (error) {
        console.error('Bounding box error:', error.message);
        return null;
    }
}

module.exports = { getCoordinates, getCityBoundingBox };