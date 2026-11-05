import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  // The supplied assets folder is named "Public"; reference it exactly so it also works on case-sensitive hosts.
  publicDir: 'Public',
  server: { port: 5173 },
})
