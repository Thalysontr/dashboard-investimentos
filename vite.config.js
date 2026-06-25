import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the build work both locally and on GitHub Pages
// (under any repository sub-path) without extra configuration.
export default defineConfig({
  plugins: [react()],
  base: './',
})
