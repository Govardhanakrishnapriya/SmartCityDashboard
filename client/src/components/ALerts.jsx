import React from 'react'

 
const styles = `
  .alerts-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .alerts-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .alerts-title {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .alerts-count {
    font-family: var(--font-display);
    font-size: 10px;
    background: rgba(255,77,109,0.15);
    color: var(--danger);
    border: 1px solid rgba(255,77,109,0.3);
    padding: 2px 8px;
    border-radius: 20px;
  }
  .alerts-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .alert-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius);
    border: 1px solid transparent;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity:0; transform: translateX(-4px) } to { opacity:1; transform: none } }
  .alert-row.danger {
    background: rgba(255,77,109,0.08);
    border-color: rgba(255,77,109,0.2);
  }
  .alert-row.warn {
    background: rgba(240,165,0,0.08);
    border-color: rgba(240,165,0,0.2);
  }
  .alert-row.info {
    background: rgba(0,170,255,0.06);
    border-color: rgba(0,170,255,0.15);
  }
  .alert-indicator {
    width: 6px; height: 6px;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
  }
  .danger .alert-indicator { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
  .warn .alert-indicator { background: var(--warn); box-shadow: 0 0 6px var(--warn); }
  .info .alert-indicator { background: var(--accent2); }
  .alert-content { flex: 1; min-width: 0; }
  .alert-msg {
    font-size: 12px;
    color: var(--text);
    line-height: 1.4;
    margin-bottom: 2px;
  }
  .alert-meta {
    font-size: 10px;
    font-family: var(--font-display);
    color: var(--text-dim);
  }
  .alerts-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: var(--text-dim);
  }
  .alerts-empty-icon { font-size: 24px; opacity: 0.3; }
`
 
const DEFAULT_ALERTS = [
  { id: 1, type: 'danger', msg: 'Heavy congestion — Ring Road East', meta: 'Traffic · 2 min ago' },
  { id: 2, type: 'danger', msg: 'Accident reported — NH-44 Km 12', meta: 'Incident · 8 min ago' },
  { id: 3, type: 'warn', msg: 'AQI elevated — Industrial Zone (112)', meta: 'Pollution · 15 min ago' },
  { id: 4, type: 'warn', msg: 'Road closure — Marathon route active', meta: 'Event · 22 min ago' },
  { id: 5, type: 'info', msg: 'Metro Line 2 minor delays (~5 min)', meta: 'Transit · 30 min ago' },
  { id: 6, type: 'info', msg: 'Parking near Convention Centre full', meta: 'Parking · 35 min ago' },
]
 
export default function Alerts({ alerts = DEFAULT_ALERTS }) {
  const dangerCount = alerts.filter(a => a.type === 'danger').length
 
  return (
    <>
      <style>{styles}</style>
      <div className="alerts-card">
        <div className="alerts-header">
          <span className="alerts-title">Active Alerts</span>
          {dangerCount > 0 && <span className="alerts-count">{dangerCount} critical</span>}
        </div>
        <div className="alerts-body">
          {alerts.length === 0 ? (
            <div className="alerts-empty">
              <div className="alerts-empty-icon">✓</div>
              <span style={{ fontSize: 12 }}>All clear</span>
            </div>
          ) : (
            alerts.map(a => (
              <div key={a.id} className={`alert-row ${a.type}`}>
                <div className="alert-indicator" />
                <div className="alert-content">
                  <div className="alert-msg">{a.msg}</div>
                  <div className="alert-meta">{a.meta}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}