import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Le dice a Vite que "@" significa "src"
      '@': path.resolve(__dirname, './src'),
    },
  },
})