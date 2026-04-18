import React, { useState, useEffect, useCallback } from 'react'
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

const EVENTS = [
  { name: 'Tech Summit 2026', location: 'Convention Centre', time: '9am–6pm', impact: 'high', type: 'Conference', attendees: '2,400' },
  { name: 'Half-marathon', location: 'Ring Road East', time: '6am–12pm', impact: 'high', type: 'Sports', attendees: '800' },
  { name: 'Farmers Market', location: 'Central Plaza', time: '7am–2pm', impact: 'low', type: 'Market', attendees: '400' },
  { name: 'Open-air Cinema', location: 'Riverside Park', time: '7:30pm', impact: 'low', type: 'Culture', attendees: '800' },
  { name: 'Street Festival', location: 'Old Town', time: '12pm–10pm', impact: 'med', type: 'Festival', attendees: '3,000' },
  { name: 'Council Meeting', location: 'City Hall', time: '10am–1pm', impact: 'low', type: 'Civic', attendees: '120' },
]

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
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'danger', msg: 'Heavy congestion — Ring Road East', meta: 'Traffic · 2 min ago' },
    { id: 2, type: 'danger', msg: 'Accident reported — NH-44 Km 12', meta: 'Incident · 8 min ago' },
    { id: 3, type: 'warn', msg: 'AQI elevated — Industrial Zone (112)', meta: 'Pollution · 15 min ago' },
    { id: 4, type: 'warn', msg: 'Road closure — Marathon route active', meta: 'Event · 22 min ago' },
    { id: 5, type: 'info', msg: 'Metro Line 2 minor delays (~5 min)', meta: 'Transit · 30 min ago' },
    { id: 6, type: 'info', msg: 'Parking near Convention Centre full', meta: 'Parking · 35 min ago' },
  ])
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

  // Existing one (keep it)
useEffect(() => {
  const id = setInterval(() => {
    setStats(generateMockData())
  }, 4000)
  return () => clearInterval(id)
}, [])

// NEW one (add this below)
useEffect(() => {
  console.log("City changed:", city)

  setStats(generateMockData(city))

}, [city])

  const impactPill = impact =>
    impact === 'high' ? 'pill-high High Impact' :
    impact === 'med' ? 'pill-med Moderate' : 'pill-low Low Impact'

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
  <Map />

  <div className="events-card">
    <div className="events-header">
      Today's Events
      <span className="events-today">{EVENTS.length} scheduled</span>
    </div>

    <div className="events-grid">
      {EVENTS.map((e, i) => {
        const [pillCls, pillText] = impactPill(e.impact).split(' ')
        return (
          <div key={i} className="event-cell">
            <div
              className="event-type"
              style={{
                color:
                  e.impact === 'high'
                    ? '#ff4d6d'
                    : e.impact === 'med'
                    ? '#f0a500'
                    : '#3d5166'
              }}
            >
              {e.type}
            </div>

            <div className="event-name">{e.name}</div>

            <div className="event-detail">
              {e.location}
              <br />
              {e.time} · {e.attendees} ppl
            </div>

            <span className={`event-pill ${pillCls}`}>
              {pillText}
            </span>
          </div>
        )
      })}
    </div>
  </div>
</div>
        <Alerts alerts={alerts} />
      </div>
    </>
  )}

  {activeTab === "traffic" && (
  <div style={{
    padding: 20,
    minHeight: "70vh"
  }}>
    <h2 style={{ color: "white" }}>Traffic Analysis</h2>

    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <TrafficChart data={trafficData} />
    </div>
  </div>
)}

 {activeTab === "pollution" && (
  <div style={{
    padding: 20,
    minHeight: "70vh"
  }}>
    <h2 style={{ color: "white" }}>Pollution Analysis</h2>

    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <PollutionChart data={pollutionData} />
    </div>
  </div>
)}

  {activeTab === "events" && (
  <div style={{ padding: 20 }}>
    <h2 style={{ color: "white" }}>City Events</h2>

    <div className="events-grid">
      {EVENTS.map((e, i) => {
        const [pillCls, pillText] = impactPill(e.impact).split(' ')
        return (
          <div key={i} className="event-cell">
            <div
              className="event-type"
              style={{
                color:
                  e.impact === 'high'
                    ? '#ff4d6d'
                    : e.impact === 'med'
                    ? '#f0a500'
                    : '#3d5166'
              }}
            >
              {e.type}
            </div>

            <div className="event-name">{e.name}</div>

            <div className="event-detail">
              {e.location}
              <br />
              {e.time} · {e.attendees} ppl
            </div>

            <span className={`event-pill ${pillCls}`}>
              {pillText}
            </span>
          </div>
        )
      })}
    </div>
  </div>
)}

</div>
        <div className="footer-bar">
          <span>SMART CITY DASHBOARD v1.0 — {city.toUpperCase()}</span>
          <span>DATA REFRESH: 4s · SOCKET: {isLive ? 'CONNECTED' : 'SIMULATION MODE'}</span>
        </div>
      </div>
    </>
  )
}
