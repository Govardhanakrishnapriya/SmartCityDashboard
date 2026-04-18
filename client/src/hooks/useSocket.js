import { useEffect, useRef, useCallback } from 'react'
import {
  connectSocket,
  disconnectSocket,
  subscribeToCity,
  subscribeToTraffic,
  subscribeToPollution,
  subscribeToAlerts,
  socket
} from '../services/socket.js'
 
export default function useSocket({ onCityData, onTraffic, onPollution, onAlert } = {}) {
  const handlersRef = useRef({ onCityData, onTraffic, onPollution, onAlert })
 
  useEffect(() => {
    handlersRef.current = { onCityData, onTraffic, onPollution, onAlert }
  })
 
  useEffect(() => {
    connectSocket()
 
    const unsubs = []
    if (handlersRef.current.onCityData)
      unsubs.push(subscribeToCity(d => handlersRef.current.onCityData(d)))
    if (handlersRef.current.onTraffic)
      unsubs.push(subscribeToTraffic(d => handlersRef.current.onTraffic(d)))
    if (handlersRef.current.onPollution)
      unsubs.push(subscribeToPollution(d => handlersRef.current.onPollution(d)))
    if (handlersRef.current.onAlert)
      unsubs.push(subscribeToAlerts(d => handlersRef.current.onAlert(d)))
 
    return () => {
      unsubs.forEach(fn => fn())
      disconnectSocket()
    }
  }, [])
 
  const isConnected = useCallback(() => socket.connected, [])
 
  return { isConnected }
}