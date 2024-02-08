import { defineConfig } from 'vite'
import dns from 'dns'

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  server: {
    proxy: {
      // Proxying websockets or socket.io: ws://localhost:3000/socket.io -> ws://localhost:3000/socket.io
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
})