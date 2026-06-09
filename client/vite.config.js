import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        open: false,          // do NOT auto-open browser on npm run dev
        proxy: {
            '/api': {
                target: 'http://localhost:5003', // matches PORT=5003 in backend/.env
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://localhost:5003',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
