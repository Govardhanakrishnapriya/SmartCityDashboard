const zones = ['North', 'South', 'East', 'West', 'Central'];

const generateTrafficData = () => {
  const level = Math.floor(Math.random() * 101);
  let congestion = 'Low';
  if (level > 70) congestion = 'Severe';
  else if (level > 50) congestion = 'High';
  else if (level > 30) congestion = 'Medium';
  
  return { level, congestion };
};

const generatePollutionData = () => {
  const aqi = Math.floor(Math.random() * 301);
  return {
    aqi,
    pm25: Math.floor(Math.random() * 200),
    pm10: Math.floor(Math.random() * 300)
  };
};

const generateCityData = () => {
  return zones.map(zone => ({
    zone,
    traffic: generateTrafficData(),
    pollution: generatePollutionData(),
    timestamp: new Date()
  }));
};

const generateEvent = () => {
  const events = [
    'Road Construction', 'Protest March', 'Concert', 'Sports Event',
    'Festival', 'Accident', 'Power Outage', 'Water Supply Issue'
  ];
  
  return {
    title: events[Math.floor(Math.random() * events.length)],
    description: 'Automated system alert',
    location: `${zones[Math.floor(Math.random() * zones.length)]} Zone`,
    zone: zones[Math.floor(Math.random() * zones.length)],
    severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
  };
};

module.exports = { generateCityData, generateEvent };