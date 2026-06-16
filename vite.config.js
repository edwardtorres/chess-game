import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The repo will be hosted at https://<user>.github.io/chess-game/
// so the base path must match the repository name for GitHub Pages.
// https://vite.dev/config/
export default defineConfig({
  base: '/chess-game/',
  plugins: [react()],
})
