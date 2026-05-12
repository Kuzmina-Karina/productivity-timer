import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ЗАМЕНИ 'productivity-timer' на точное название твоего репозитория на GitHub
  base: '/productivity-timer/', 
})