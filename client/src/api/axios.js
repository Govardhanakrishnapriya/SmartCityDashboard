import axios from 'axios'
 
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})
 
api.interceptors.response.use(
  res => res.data,
  err => {
    console.error('[API Error]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)
 
export const getCityData = () => api.get('/data')
export const getTrafficData = () => api.get('/data/traffic')
export const getPollutionData = () => api.get('/data/pollution')
export const getEvents = () => api.get('/data/events')
 
export default api