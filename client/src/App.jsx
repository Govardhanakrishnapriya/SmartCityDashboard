import React from 'react'
import Dashboard from './pages/Dashboard.jsx'

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --bg-panel: #0d1117;
    --bg-card: #111820;
    --bg-card-hover: #141e28;
    --border: rgba(0,255,200,0.1);
    --border-bright: rgba(0,255,200,0.25);
    --accent: #00ffc8;
    --accent2: #0af;
    --accent3: #f0a500;
    --danger: #ff4d6d;
    --warn: #f0a500;
    --success: #00ffc8;
    --text: #e2eaf3;
    --text-muted: #6b8096;
    --text-dim: #3d5166;
    --font-display: 'Space Mono', monospace;
    --font-body: 'DM Sans', sans-serif;
    --radius: 8px;
    --radius-lg: 12px;
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.5;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

  .leaflet-container { background: #0d1117 !important; }
  .leaflet-tile { filter: brightness(0.35) saturate(0.3) hue-rotate(180deg); }
`

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <Dashboard />
    </>
  )
}