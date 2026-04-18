const { generateRealTimeCityData, fetchRealEvents } = require('./utils/realDataFetcher');

async function test() {
    console.log('🧪 Testing Real APIs...\n');
    
    // Test city data
    const cityData = await generateRealTimeCityData();
    console.log('\n📊 City Data Sample:');
    console.log(JSON.stringify(cityData[0], null, 2));
    
    // Test events
    const events = await fetchRealEvents();
    console.log('\n🎉 Events Sample:');
    console.log(events.slice(0, 2));
}

test();