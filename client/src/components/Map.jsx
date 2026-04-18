import React, { useEffect, useRef } from 'react'

const styles = `
  .map-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .map-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .map-title {
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .map-legend {
    display: flex;
    gap: 10px;
  }
  .map-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-family: var(--font-display);
    color: var(--text-muted);
  }
  .map-legend-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }
  #city-map {
    flex: 1;
    min-height: 280px;
  }
`

const MARKERS = [
  { lat: 17.385, lng: 78.486, label: 'Heavy — Ring Rd E', color: '#ff4d6d', size: 14 },
  { lat: 17.395, lng: 78.475, label: 'Moderate — HITEC', color: '#f0a500', size: 10 },
  { lat: 17.375, lng: 78.495, label: 'Normal — Airport Rd', color: '#00ffc8', size: 8 },
  { lat: 17.405, lng: 78.468, label: 'Heavy — Jubilee Hills', color: '#ff4d6d', size: 12 },
  { lat: 17.365, lng: 78.505, label: 'Normal — LB Nagar', color: '#00ffc8', size: 8 },
  { lat: 17.445, lng: 78.460, label: 'Moderate — Secunderabad', color: '#f0a500', size: 10 },
  { lat: 17.425, lng: 78.490, label: 'Normal — Begumpet', color: '#00ffc8', size: 8 },
]

export default function Map({ center = [17.385, 78.486] }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (instanceRef.current) return

    const L = window.L
    if (!L) { console.warn('Leaflet not loaded'); return }

    const map = L.map('city-map', {
      center,
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(map)

    MARKERS.forEach(m => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${m.size}px;height:${m.size}px;
          background:${m.color};
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.2);
          box-shadow:0 0 8px ${m.color}88;
        "></div>`,
        iconSize: [m.size, m.size],
        iconAnchor: [m.size / 2, m.size / 2]
      })
      L.marker([m.lat, m.lng], { icon })
        .addTo(map)
        .bindPopup(`<b style="font-family:monospace;font-size:11px">${m.label}</b>`)
    })

    instanceRef.current = map
    return () => { map.remove(); instanceRef.current = null }
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="map-card">
        <div className="map-header">
          <span className="map-title">Live Traffic Map — Hyderabad</span>
          <div className="map-legend">
            <div className="map-legend-item"><div className="map-legend-dot" style={{ background: '#ff4d6d' }} />Heavy</div>
            <div className="map-legend-item"><div className="map-legend-dot" style={{ background: '#f0a500' }} />Moderate</div>
            <div className="map-legend-item"><div className="map-legend-dot" style={{ background: '#00ffc8' }} />Clear</div>
          </div>
        </div>
        <div id="city-map" />
      </div>
    </>
  )
}
