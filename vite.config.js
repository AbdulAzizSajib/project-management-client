import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,        // সবসময় এই port এ চলবে
    strictPort: true,  // port ব্যস্ত থাকলে অন্য port এ না গিয়ে error দেবে
    proxy: {
      // prod e vercel.json er /api rewrite jeta kore, dev e সেটাই এখানে —
      // tahole VITE_API_BASE_PATH=/api/v1 dui jaygay-i same-origin thake,
      // Google OAuth callback (FRONTEND_URL based) o localhost e kaj kore।
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
