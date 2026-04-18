const { generateRealTimeCityData, fetchRealEvents } = require('../utils/realDataFetcher');
const CityData = require('../models/CityData');
const Event = require('../models/Event');

const setupSocket = (io) => {
    console.log('🔄 Socket.IO initialized - Fetching REAL data from APIs');
    console.log('📊 Traffic: OpenEventDatabase (real-time)');
    console.log('🌫️ Air Quality: Open-Meteo AQ (hourly updates)');
    
    let updateCount = 0;
    
    // Send updates every 60 seconds
    setInterval(async () => {
        updateCount++;
        console.log(`\n🕐 Update #${updateCount} - ${new Date().toLocaleTimeString()}`);
        
        try {
            // Fetch real-time data from APIs
            const newData = await generateRealTimeCityData();
            
            // Save to MongoDB
            for (const data of newData) {
                await CityData.create(data);
            }
            
            // Calculate aggregate values for stats
            const avgTraffic = newData.reduce((acc, curr) => acc + curr.traffic.level, 0) / newData.length;
            const avgAqi = newData.reduce((acc, curr) => acc + curr.pollution.aqi, 0) / newData.length;
            const trafficFlow = Math.floor((avgTraffic / 100) * 3000);
            const incidents = newData.filter(d => d.traffic.level > 70 || d.pollution.aqi > 150).length;
            const transitRate = Math.min(100, Math.floor(70 + (100 - avgTraffic) * 0.3));
            
            // Emit to all connected clients (multiple events for frontend)
            // 1. cityData event - for main dashboard
            io.emit('cityData', {
                traffic: trafficFlow,
                aqi: Math.floor(avgAqi),
                incidents: incidents,
                transitRate: transitRate
            });
            
            // 2. trafficUpdate event - for traffic page
            io.emit('trafficUpdate', {
                traffic: trafficFlow,
                zones: newData.map(d => ({ zone: d.zone, level: d.traffic.level, congestion: d.traffic.congestion }))
            });
            
            // 3. pollutionUpdate event - for pollution page
            io.emit('pollutionUpdate', {
                aqi: Math.floor(avgAqi),
                zones: newData.map(d => ({ zone: d.zone, aqi: d.pollution.aqi, pm25: d.pollution.pm25, pm10: d.pollution.pm10 }))
            });
            
            console.log('📡 All data events sent to clients');
            
            // Fetch and send events every 3rd update
            if (updateCount % 3 === 0) {
                const events = await fetchRealEvents();
                if (events && events.length > 0) {
                    for (const event of events.slice(0, 3)) {
                        await Event.create(event);
                        
                        // Emit alert event
                        io.emit('alert', {
                            id: Date.now(),
                            type: event.severity === 'High' ? 'danger' : (event.severity === 'Medium' ? 'warn' : 'info'),
                            msg: event.title,
                            meta: `${event.location} · ${new Date().toLocaleTimeString()}`
                        });
                    }
                    console.log(`🎉 ${events.length} alert(s) sent`);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in update cycle:', error.message);
        }
        
    }, 60000);
};

module.exports = setupSocket;