import React, { useState, useEffect } from 'react'

const styles = `
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 56px;
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display);
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--accent);
    text-transform: uppercase;
  }
  .nav-logo-icon {
    width: 28px; height: 28px;
    border: 1.5px solid var(--accent);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
  }
  .nav-center {
    display: flex;
    gap: 4px;
  }
  .nav-tab {
    padding: 5px 14px;
    font-size: 12px;
    font-family: var(--font-display);
    letter-spacing: 0.05em;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .nav-tab:hover { color: var(--text); background: var(--bg-card); }
  .nav-tab.active {
    color: var(--accent);
    border-color: var(--border-bright);
    background: rgba(0,255,200,0.04);
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nav-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-family: var(--font-display);
    color: var(--text-muted);
  }
  .status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    animation: blink 2s infinite;
  }
  .status-dot.live { background: var(--accent); }
  .status-dot.offline { background: var(--danger); animation: none; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .nav-clock {
    font-family: var(--font-display);
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    min-width: 72px;
    text-align: right;
  }
`

export default function Navbar({
  activeTab = 'overview',
  onTabChange,
  isLive = true,
  city,
  onCityChange
}) {
  const [time, setTime] = useState('')
  const [inputCity, setInputCity] = useState(city)

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const tabs = ['Overview', 'Traffic', 'Pollution', 'Events']

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-icon">⬡</div>
          SmartCity
        </div>

        <div className="nav-center">
          {tabs.map(t => (
            <button
              key={t}
              className={`nav-tab ${activeTab === t.toLowerCase() ? 'active' : ''}`}
              onClick={() => onTabChange?.(t.toLowerCase())}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="nav-right">

 <input
  value={inputCity}
  onChange={(e) => setInputCity(e.target.value)}
  placeholder="Enter city..."
  style={{
    background: "#0b1220",
    color: "white",
    border: "1px solid #333",
    padding: "4px 8px",
    borderRadius: "4px"
  }}
/>

<button
  onClick={() => onCityChange(inputCity)}
  style={{
    padding: "4px 10px",
    background: "#00ffc8",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Go
</button>

  <div className="nav-status">
    <div className={`status-dot ${isLive ? 'live' : 'offline'}`} />
    {isLive ? 'LIVE FEED' : 'OFFLINE'}
  </div>

  <div className="nav-clock">{time}</div>
</div>
      </nav>
    </>
  )
}
