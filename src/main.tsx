import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Andika (SIL): a font made for children learning to read. Fredoka: rounded headings. Both SIL OFL, bundled,
// so no font service is contacted at runtime.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/fredoka/latin-500.css'
import '@fontsource/fredoka/latin-600.css'
import './styles/global.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Offline start (public/sw.js). Not in dev: Vite serves files itself and a cache would hide changes.
// The path is relative, so on GitHub Pages it registers /kids-learning-studio/sw.js.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('service worker:', err))
}
