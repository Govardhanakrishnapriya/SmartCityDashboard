const axios = require('axios');

// Store current city data
let currentCityData = {
    name: 'Hyderabad',
    lat: 17.385,
    lon: 78.486,
    displayName: 'Hyderabad, India'
};

// Get coordinates for any city using OpenStreetMap Nominatim
async function getCityCoordinates(cityName) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
            {
                headers: { 'User-Agent': 'SmartCityDashboard/1.0' },
                timeout: 8000
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

// Fetch real traffic events from OpenEventDatabase
async function fetchTrafficEvents(lat, lon, cityName) {
    try {
        // Create a bounding box around the city (approx 50km radius)
        const buffer = 0.5;
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer}`;
        
        const response = await axios.get(
            `https://api.openeventdatabase.org/event?what=traffic&bbox=${bbox}&limit=30`,
            { timeout: 10000 }
        );
        
        if (response.data && response.data.features) {
            console.log(`✅ Found ${response.data.features.length} traffic events near ${cityName}`);
            return response.data.features;
        }
        return [];
    } catch (error) {
        console.log('⚠️ Traffic API error:', error.message);
        return [];
    }
}

// Fetch traffic event locations for map markers
async function fetchTrafficMarkers(lat, lon, cityName) {
    try {
        const buffer = 0.5;
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer}`;
        
        const response = await axios.get(
            `https://api.openeventdatabase.org/event?what=traffic&bbox=${bbox}&limit=30`,
            { timeout: 10000 }
        );
        
        if (response.data && response.data.features) {
            // Convert to map marker format
            const markers = response.data.features.map((feature, index) => {
                const props = feature.properties;
                const coords = feature.geometry?.coordinates;
                
                let color = '#00ffc8'; // Default green (clear)
                let size = 8;
                let severity = 'Normal';
                
                if (props.what?.includes('accident')) {
                    color = '#ff4d6d'; // Red for accidents
                    size = 16;
                    severity = 'Severe';
                } else if (props.what?.includes('jam')) {
                    color = '#f0a500'; // Orange for jams
                    size = 12;
                    severity = 'Heavy';
                } else if (props.what?.includes('roadwork')) {
                    color = '#f0a500'; // Orange for roadwork
                    size = 10;
                    severity = 'Moderate';
                }
                
                return {
                    lat: coords ? coords[1] : lat + (Math.random() - 0.5) * 0.05,
                    lng: coords ? coords[0] : lon + (Math.random() - 0.5) * 0.05,
                    label: props.what?.replace(/\./g, ' ') || 'Traffic Event',
                    color: color,
                    size: size,
                    severity: severity
                };
            });
            
            console.log(`📍 Generated ${markers.length} map markers for ${cityName}`);
            return markers.slice(0, 10); // Limit to 10 markers
        }
        return [];
    } catch (error) {
        console.log('⚠️ Traffic markers error:', error.message);
        return [];
    }
}

// Fetch real air quality from Open-Meteo
async function fetchAirQuality(lat, lon, cityName) {
    try {
        const response = await axios.get(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5&timezone=auto`,
            { timeout: 10000 }
        );
        
        if (response.data && response.data.current) {
            console.log(`✅ Got air quality for ${cityName}: AQI ${response.data.current.us_aqi}`);
            return {
                aqi: response.data.current.us_aqi || 50,
                pm25: response.data.current.pm2_5 || 30,
                pm10: response.data.current.pm10 || 50
            };
        }
        return null;
    } catch (error) {
        console.log('⚠️ Air quality API error:', error.message);
        return null;
    }
}

// Fetch real events (concerts, festivals, etc.) from OpenEventDatabase
async function fetchCityEvents(lat, lon, cityName) {
    try {
        const buffer = 0.3;
        const bbox = `${lon - buffer},${lat - buffer},${lon + buffer},${lat + buffer}`;
        
        // Fetch various event types
        const eventTypes = ['music.concert', 'music.festival', 'tourism.exhibition', 'community'];
        let allEvents = [];
        
        for (const eventType of eventTypes) {
            try {
                const response = await axios.get(
                    `https://api.openeventdatabase.org/event?what=${eventType}&bbox=${bbox}&limit=10`,
                    { timeout: 5000 }
                );
                
                if (response.data && response.data.features) {
                    allEvents = [...allEvents, ...response.data.features];
                }
            } catch (e) {
                // Skip individual type errors
            }
        }
        
        if (allEvents.length > 0) {
            console.log(`✅ Found ${allEvents.length} events near ${cityName}`);
            
            // Transform to frontend format
            const events = allEvents.slice(0, 6).map((feature, index) => {
                const props = feature.properties;
                let impact = 'low';
                let type = 'Event';
                
                if (props.what?.includes('concert')) {
                    impact = 'med';
                    type = 'Concert';
                } else if (props.what?.includes('festival')) {
                    impact = 'high';
                    type = 'Festival';
                } else if (props.what?.includes('exhibition')) {
                    impact = 'med';
                    type = 'Exhibition';
                }
                
                return {
                    id: index,
                    name: props.what?.replace(/\./g, ' ') || 'Local Event',
                    location: props.location || cityName,
                    time: 'Today',
                    impact: impact,
                    type: type,
                    attendees: Math.floor(Math.random() * 5000) + 100
                };
            });
            
            return events;
        }
        return getFallbackEvents(cityName);
    } catch (error) {
        console.log('⚠️ Events API error:', error.message);
        return getFallbackEvents(cityName);
    }
}

// Fallback events if API fails
function getFallbackEvents(cityName) {
    return [
        { id: 1, name: `${cityName} Cultural Festival`, location: cityName, time: 'Today', impact: 'high', type: 'Festival', attendees: 2500 },
        { id: 2, name: `Local Market Day`, location: cityName, time: 'Today', impact: 'low', type: 'Market', attendees: 500 },
        { id: 3, name: `Community Meeting`, location: cityName, time: 'Today', impact: 'low', type: 'Civic', attendees: 150 },
        { id: 4, name: `${cityName} Tech Meetup`, location: cityName, time: 'Today', impact: 'med', type: 'Conference', attendees: 300 }
    ];
}

// Generate alerts based on real traffic and air quality
function generateAlerts(trafficEvents, airQuality, cityName) {
    const alerts = [];
    let id = 1;
    
    // Count high severity traffic events
    const highTrafficEvents = trafficEvents.filter(e => 
        e.properties?.what?.includes('accident') || 
        e.properties?.what?.includes('jam') ||
        e.properties?.severity === 'high'
    );
    
    if (highTrafficEvents.length > 0) {
        alerts.push({
            id: id++,
            type: 'danger',
            msg: `${highTrafficEvents.length} active traffic incidents in ${cityName}`,
            meta: `Traffic · Just now`
        });
    }
    
    // Check for traffic jams
    const jams = trafficEvents.filter(e => e.properties?.what?.includes('jam'));
    if (jams.length > 0) {
        alerts.push({
            id: id++,
            type: 'warn',
            msg: `${jams.length} traffic jams reported`,
            meta: `Traffic · Just now`
        });
    }
    
    // Air quality alerts
    if (airQuality) {
        if (airQuality.aqi > 150) {
            alerts.push({
                id: id++,
                type: 'danger',
                msg: `Poor Air Quality in ${cityName} (AQI ${airQuality.aqi})`,
                meta: `Pollution · Just now`
            });
        } else if (airQuality.aqi > 100) {
            alerts.push({
                id: id++,
                type: 'warn',
                msg: `Moderate Air Quality in ${cityName} (AQI ${airQuality.aqi})`,
                meta: `Pollution · Just now`
            });
        }
    }
    
    // If no alerts, add a default info alert
    if (alerts.length === 0) {
        alerts.push({
            id: id++,
            type: 'info',
            msg: `All systems normal in ${cityName}`,
            meta: `System · Just now`
        });
    }
    
    return alerts;
}

// Calculate traffic stats from events
function calculateTrafficStats(trafficEvents, cityName) {
    // Base traffic flow
    let trafficFlow = 2000;
    let incidents = 0;
    
    // Adjust based on number of events
    if (trafficEvents.length > 20) {
        trafficFlow = 3800;
        incidents = 5;
    } else if (trafficEvents.length > 10) {
        trafficFlow = 3200;
        incidents = 3;
    } else if (trafficEvents.length > 5) {
        trafficFlow = 2800;
        incidents = 2;
    } else if (trafficEvents.length > 0) {
        trafficFlow = 2400;
        incidents = 1;
    }
    
    // Check for accidents (increase traffic)
    const hasAccident = trafficEvents.some(e => e.properties?.what?.includes('accident'));
    if (hasAccident) {
        trafficFlow += 500;
        incidents += 1;
    }
    
    // Transit rate (inversely related to traffic)
    const transitRate = Math.min(95, Math.max(65, 90 - Math.floor(trafficFlow / 200)));
    
    return {
        traffic: trafficFlow,
        incidents: incidents,
        transitRate: transitRate
    };
}

// Main function to get all real data for a city
async function generateRealTimeCityData(cityName) {
    console.log(`\n📍 Fetching real data for: ${cityName}`);
    
    // Step 1: Get city coordinates
    const coords = await getCityCoordinates(cityName);
    if (!coords) {
        console.log(`❌ Could not find coordinates for ${cityName}`);
        throw new Error(`City "${cityName}" not found`);
    }
    
    console.log(`📍 Coordinates: ${coords.lat}, ${coords.lon}`);
    
    // Step 2: Fetch all data in parallel (including markers)
    const [trafficEvents, airQuality, events, markers] = await Promise.all([
        fetchTrafficEvents(coords.lat, coords.lon, cityName),
        fetchAirQuality(coords.lat, coords.lon, cityName),
        fetchCityEvents(coords.lat, coords.lon, cityName),
        fetchTrafficMarkers(coords.lat, coords.lon, cityName)
    ]);
    
    // Step 3: Calculate stats from real data
    const trafficStats = calculateTrafficStats(trafficEvents, cityName);
    
    // Step 4: Generate alerts from real data
    const alerts = generateAlerts(trafficEvents, airQuality, cityName);
    
    // Step 5: Prepare response
    const response = {
        city: cityName,
        coordinates: {
            lat: coords.lat,
            lng: coords.lon,
            displayName: coords.displayName
        },
        stats: {
            traffic: trafficStats.traffic,
            aqi: airQuality?.aqi || 50,
            incidents: trafficStats.incidents,
            transitRate: trafficStats.transitRate
        },
        alerts: alerts,
        events: events,
        markers: markers,
        trafficEventsCount: trafficEvents.length,
        airQuality: airQuality
    };
    
    console.log(`✅ Data ready for ${cityName}:`);
    console.log(`   - Traffic: ${response.stats.traffic} veh/hr`);
    console.log(`   - AQI: ${response.stats.aqi}`);
    console.log(`   - Events: ${response.events.length}`);
    console.log(`   - Alerts: ${response.alerts.length}`);
    console.log(`   - Markers: ${response.markers.length}`);
    
    return response;
}

// Function to update current city (called from API)
async function updateCity(cityName) {
    const coords = await getCityCoordinates(cityName);
    if (coords) {
        currentCityData = {
            name: cityName,
            lat: coords.lat,
            lon: coords.lon,
            displayName: coords.displayName
        };
        return true;
    }
    return false;
}

module.exports = { generateRealTimeCityData, updateCity, getCityCoordinates };