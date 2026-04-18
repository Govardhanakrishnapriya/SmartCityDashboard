import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://smartcitydashboard.onrender.com',
      '/socket.io': { target: 'https://smartcitydashboard.onrender.com', ws: true }
    }
  }
})