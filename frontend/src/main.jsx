import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'
// Tipografías propias (empaquetadas con la app): sin pedirlas a Google, que en la app instalada del iPhone
// bloqueaba el primer pintado si la red tardaba.
import '@fontsource-variable/pixelify-sans'
import '@fontsource/jersey-10'
import '@fontsource-variable/literata'
import './index.css'
import './i18n'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { swrGlobalConfig } from './lib/swrConfig'
import { captureInstallEvents } from './lib/installStore'

// El evento de instalación puede llegar antes de que React monte nada: se escucha desde ya
captureInstallEvents()

// Se registra también en desarrollo: sin service worker Chrome no lanza el aviso de instalación y
// no se podría probar. En localhost el propio sw.js no cachea, así que no esconde cambios.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('No se pudo registrar el service worker:', error)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <SWRConfig value={swrGlobalConfig}>
        <Suspense fallback={<div className="min-h-screen bg-[#1c1b3a]" />}>
          <App />
        </Suspense>
      </SWRConfig>
    </HelmetProvider>
  </StrictMode>,
)
