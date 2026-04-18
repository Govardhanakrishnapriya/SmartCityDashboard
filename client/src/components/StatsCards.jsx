import React from 'react'

const styles = `
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 24px 0;
  }
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
    cursor: default;
  }
  .stat-card:hover {
    border-color: var(--border-bright);
    transform: translateY(-1px);
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--card-accent, var(--accent));
    opacity: 0.7;
  }
  .stat-icon {
    font-size: 18px;
    margin-bottom: 10px;
    opacity: 0.8;
  }
  .stat-label {
    font-size: 10px;
    font-family: var(--font-display);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 6px;
  }
  .stat-value {
    font-size: 26px;
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--text);
    line-height: 1;
    margin-bottom: 6px;
  }
  .stat-unit {
    font-size: 13px;
    font-family: var(--font-body);
    color: var(--text-muted);
    font-weight: 300;
  }
  .stat-delta {
    font-size: 11px;
    font-family: var(--font-display);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .delta-up { color: var(--danger); }
  .delta-down { color: var(--success); }
  .delta-neutral { color: var(--text-muted); }
  .stat-bar {
    margin-top: 10px;
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .stat-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--card-accent, var(--accent));
    transition: width 1s ease;
  }
`

const cards = [
  {
    label: 'Traffic Flow',
    key: 'traffic',
    unit: 'veh/hr',
    icon: '⬡',
    accent: '#00ffc8',
    format: v => v?.toLocaleString() ?? '—',
    getBar: v => Math.min((v / 3000) * 100, 100),
    getDelta: v => v > 2500 ? { text: '↑ Heavy', cls: 'delta-up' } : { text: '↓ Normal', cls: 'delta-down' }
  },
  {
    label: 'Air Quality',
    key: 'aqi',
    unit: 'AQI',
    icon: '◎',
    accent: '#f0a500',
    format: v => v ?? '—',
    getBar: v => Math.min((v / 200) * 100, 100),
    getDelta: v => v < 50 ? { text: 'Good', cls: 'delta-down' } : v < 100 ? { text: 'Moderate', cls: 'delta-neutral' } : { text: 'Unhealthy', cls: 'delta-up' }
  },
  {
    label: 'Active Incidents',
    key: 'incidents',
    unit: 'alerts',
    icon: '⚠',
    accent: '#ff4d6d',
    format: v => v ?? '—',
    getBar: v => Math.min((v / 10) * 100, 100),
    getDelta: v => v === 0 ? { text: 'All clear', cls: 'delta-down' } : { text: `${v} active`, cls: 'delta-up' }
  },
  {
    label: 'Transit On-Time',
    key: 'transitRate',
    unit: '%',
    icon: '⟳',
    accent: '#0af',
    format: v => v ?? '—',
    getBar: v => v ?? 0,
    getDelta: v => v >= 90 ? { text: 'Excellent', cls: 'delta-down' } : v >= 75 ? { text: 'Good', cls: 'delta-neutral' } : { text: 'Delays', cls: 'delta-up' }
  }
]

export default function StatsCards({ data = {} }) {
  return (
    <>
      <style>{styles}</style>
      <div className="stats-grid">
        {cards.map(card => {
          const val = data[card.key]
          const delta = card.getDelta(val)
          return (
            <div
              key={card.key}
              className="stat-card"
              style={{ '--card-accent': card.accent }}
            >
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">
                {card.format(val)}
                <span className="stat-unit"> {card.unit}</span>
              </div>
              <div className={`stat-delta ${delta.cls}`}>{delta.text}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${card.getBar(val)}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
