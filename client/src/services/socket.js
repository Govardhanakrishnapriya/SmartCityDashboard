import { io } from 'socket.io-client'
 
const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
 
export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionAttempts: 5
})
 
export const connectSocket = () => {
  if (!socket.connected) socket.connect()
}
 
export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect()
}
 
export const subscribeToCity = (callback) => {
  socket.on('cityData', callback)
  return () => socket.off('cityData', callback)
}
 
export const subscribeToTraffic = (callback) => {
  socket.on('trafficUpdate', callback)
  return () => socket.off('trafficUpdate', callback)
}
 
export const subscribeToPollution = (callback) => {
  socket.on('pollutionUpdate', callback)
  return () => socket.off('pollutionUpdate', callback)
}
 
export const subscribeToAlerts = (callback) => {
  socket.on('alert', callback)
  return () => socket.off('alert', callback)
}
 
export default socket
 