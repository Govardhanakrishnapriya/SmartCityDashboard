import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'  // ADD THIS IMPORT
import Navbar from '../components/Navbar.jsx'
import StatsCards from '../components/StatsCards.jsx'
import { TrafficChart, PollutionChart } from '../components/Charts.jsx'
import Map from '../components/Map.jsx'
import Alerts from '../components/Alerts.jsx'
import useSocket from '../hooks/useSocket.js'
import { getCityData } from '../api/axios.js'

const styles = `
  .dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
  }
  .dash-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-bottom: 24px;
    animation: dashIn 0.4s ease;
  }
  @keyframes dashIn { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform: none } }
  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 12px;
    padding: 12px 24px 0;
    align-items: stretch;
  }
  .bottom-left {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 12px;
  }
  .events-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .events-header {
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .events-today {
    font-size: 10px;
    font-family: var(--font-display);
    background: rgba(0,255,200,0.08);
    color: var(--accent);
    border: 1px solid rgba(0,255,200,0.2);
    padding: 2px 8px;
    border-radius: 20px;
  }
  .events-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
  }
  .event-cell {
    background: var(--bg-card);
    padding: 12px 14px;
    transition: background 0.2s;
    cursor: default;
  }
  .event-cell:hover { background: var(--bg-card-hover); }
  .event-type {
    font-size: 9px;
    font-family: var(--font-display);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .event-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .event-detail {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.4;
  }
  .event-pill {
    display: inline-block;
    font-size: 9px;
    font-family: var(--font-display);
    padding: 2px 6px;
    border-radius: 3px;
    margin-top: 5px;
  }
  .pill-high { background: rgba(255,77,109,0.15); color: #ff4d6d; }
  .pill-med { background: rgba(240,165,0,0.12); color: #f0a500; }
  .pill-low { background: rgba(0,255,200,0.08); color: #00ffc8; }
  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 24px;
    margin-top: 12px;
    border-top: 1px solid var(--border);
    font-family: var(--font-display);
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
  }
`

function generateMockData(city) {
  if (city.toLowerCase().includes("delhi")) {
    return { traffic: 4000, aqi: 180, incidents: 4, transitRate: 70 }
  }
  if (city.toLowerCase().includes("bangalore")) {
    return { traffic: 3000, aqi: 120, incidents: 2, transitRate: 85 }
  }
  return { traffic: 2500, aqi: 90, incidents: 1, transitRate: 88 }
}

export default function Dashboard() {
  const [city, setCity] = useState("Hyderabad")
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(generateMockData(city))
  const [trafficData, setTrafficData] = useState(null)
  const [pollutionData, setPollutionData] = useState(null)
  const [alerts, setAlerts] = useState([])  // Start empty, will be filled by API
  const [events, setEvents] = useState([])   // ADD THIS - for dynamic events
  const [mapCenter, setMapCenter] = useState({ lat: 17.385, lng: 78.486 })  // ADD THIS
  const [isLive, setIsLive] = useState(false)

  useSocket({
    onCityData: useCallback(d => {
      setStats(s => ({ ...s, ...d }))
      setIsLive(true)
    }, []),
    onTraffic: useCallback(d => setTrafficData(d), []),
    onPollution: useCallback(d => setPollutionData(d), []),
    onAlert: useCallback(a => setAlerts(prev => [a, ...prev].slice(0, 20)), []),
  })

  useEffect(() => {
    getCityData().catch(() => {})
  }, [])

  // Fetch real data when city changes
  useEffect(() => {
    console.log("Fetching real data for city:", city);
    
    const fetchRealCityData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/city?city=${encodeURIComponent(city)}`);
        const realData = response.data;
        
        setStats(realData.stats);
        setAlerts(realData.alerts);
        setEvents(realData.events);
        setMapCenter({ lat: realData.coordinates.lat, lng: realData.coordinates.lon });
        setIsLive(true);
      } catch (error) {
        console.error('Error fetching city data:', error);
        // Fallback to mock data if API fails
        setStats(generateMockData(city));
        setAlerts([
          { id: 1, type: 'danger', msg: `No real-time data available for ${city}`, meta: 'Using fallback data' }
        ]);
        setEvents([
          { name: 'Local Event', location: city, time: 'Today', impact: 'low', type: 'Community', attendees: 100 }
        ]);
      }
    };
    
    fetchRealCityData();
  }, [city]);

  const impactPill = (impact) => {
    if (impact === 'high') return 'pill-high High Impact'
    if (impact === 'med') return 'pill-med Moderate'
    return 'pill-low Low Impact'
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLive={isLive}
          city={city}
          onCityChange={setCity}
        />
        <h3 style={{ color: "white", padding: "10px 24px" }}>
          City: {city}
        </h3>
        <div className="dash-content">
          {activeTab === "overview" && (
            <>
              <StatsCards data={stats} />

              <div style={{ padding: '12px 24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TrafficChart data={trafficData} />
                <PollutionChart data={pollutionData} />
              </div>

              <div className="bottom-row">
                <div className="bottom-left">
                  <Map center={[mapCenter.lat, mapCenter.lng]} city={city} />

                  <div className="events-card">
                    <div className="events-header">
                      Today's Events - {city}
                      <span className="events-today">{events.length} scheduled</span>
                    </div>
                    <div className="events-grid">
                      {events.length > 0 ? events.map((e, i) => {
                        const [pillCls, pillText] = impactPill(e.impact).split(' ')
                        return (
                          <div key={i} className="event-cell">
                            <div
                              className="event-type"
                              style={{
                                color: e.impact === 'high' ? '#ff4d6d' : e.impact === 'med' ? '#f0a500' : '#3d5166'
                              }}
                            >
                              {e.type}
                            </div>
                            <div className="event-name">{e.name}</div>
                            <div className="event-detail">
                              {e.location}<br />
                              {e.time} · {e.attendees} ppl
                            </div>
                            <span className={`event-pill ${pillCls}`}>{pillText}</span>
                          </div>
                        )
                      }) : (
                        <div className="event-cell" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                          No events found for {city}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Alerts alerts={alerts} />
              </div>
            </>
          )}

          {activeTab === "traffic" && (
            <div style={{ padding: 20, minHeight: "70vh" }}>
              <h2 style={{ color: "white" }}>Traffic Analysis - {city}</h2>
              <div style={{ maxWidth: "800px", margin: "auto" }}>
                <TrafficChart data={trafficData} />
              </div>
            </div>
          )}

          {activeTab === "pollution" && (
            <div style={{ padding: 20, minHeight: "70vh" }}>
              <h2 style={{ color: "white" }}>Pollution Analysis - {city}</h2>
              <div style={{ maxWidth: "800px", margin: "auto" }}>
                <PollutionChart data={pollutionData} />
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div style={{ padding: 20 }}>
              <h2 style={{ color: "white" }}>City Events - {city}</h2>
              <div className="events-grid">
                {events.length > 0 ? events.map((e, i) => {
                  const [pillCls, pillText] = impactPill(e.impact).split(' ')
                  return (
                    <div key={i} className="event-cell">
                      <div
                        className="event-type"
                        style={{
                          color: e.impact === 'high' ? '#ff4d6d' : e.impact === 'med' ? '#f0a500' : '#3d5166'
                        }}
                      >
                        {e.type}
                      </div>
                      <div className="event-name">{e.name}</div>
                      <div className="event-detail">
                        {e.location}<br />
                        {e.time} · {e.attendees} ppl
                      </div>
                      <span className={`event-pill ${pillCls}`}>{pillText}</span>
                    </div>
                  )
                }) : (
                  <div className="event-cell" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                    No events found for {city}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="footer-bar">
          <span>SMART CITY DASHBOARD v1.0 — {city.toUpperCase()}</span>
          <span>DATA REFRESH: 60s · SOCKET: {isLive ? 'CONNECTED' : 'SIMULATION MODE'}</span>
        </div>
      </div>
    </>
  )
}