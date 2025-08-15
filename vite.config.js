import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Corrigido aqui

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})