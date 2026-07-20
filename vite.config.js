import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,        // সবসময় এই port এ চলবে
    strictPort: true,  // port ব্যস্ত থাকলে অন্য port এ না গিয়ে error দেবে
  },
})
