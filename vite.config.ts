import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // './' = every file is linked relative to the page, so the same build works at
  // https://<user>.github.io/kids-learning-studio/, on a fork with another name, or at a domain's root.
  base: './',
  plugins: [react()],
  resolve: {
    // "@/..." means "src/...". Keep in sync with "paths" in tsconfig.app.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
