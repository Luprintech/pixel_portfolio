import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { SWRConfig } from 'swr'
import './index.css'
import './i18n'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { swrGlobalConfig } from './lib/swrConfig'

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
