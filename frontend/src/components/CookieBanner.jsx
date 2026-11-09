import { useState, useEffect } from 'react';
import { loadGoogleAnalytics, disableGoogleAnalytics } from '../utils/analytics';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { COOKIE_CONSENT_KEY, saveCookieConsent } from '../lib/cookieConsent';

// Sustituye con tu ID real de medición de GA4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Opciones de configuración
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    // 1. Revisar si hay una decisión previa en localStorage
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent);
      // 2. Si fue aceptado (total o parcialmente con analíticas), cargar GA4
      if (parsedConsent.status === 'accepted' || (parsedConsent.status === 'configured' && parsedConsent.analytics)) {
        loadGoogleAnalytics(GA_MEASUREMENT_ID);
      } else {
        disableGoogleAnalytics(GA_MEASUREMENT_ID);
      }
    } else {
      // Si no hay decisión, mostrar el banner
      setShowBanner(true);
    }

    // Listener para reabrir el banner desde el footer u otro lado
    const handleReopen = () => setShowBanner(true);
    window.addEventListener('open-cookie-banner', handleReopen);
    return () => window.removeEventListener('open-cookie-banner', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const consentObj = { status: 'accepted', analytics: true, timestamp: new Date().toISOString() };
    saveCookieConsent(consentObj);
    setShowBanner(false);
    loadGoogleAnalytics(GA_MEASUREMENT_ID);
  };

  const handleRejectAll = () => {
    const consentObj = { status: 'rejected', analytics: false, timestamp: new Date().toISOString() };
    saveCookieConsent(consentObj);
    setShowBanner(false);
    disableGoogleAnalytics(GA_MEASUREMENT_ID);
  };

  const handleSaveConfig = () => {
    const consentObj = { status: 'configured', analytics: analyticsEnabled, timestamp: new Date().toISOString() };
    saveCookieConsent(consentObj);
    setShowBanner(false);
    setShowConfig(false);

    if (analyticsEnabled) {
      loadGoogleAnalytics(GA_MEASUREMENT_ID);
    } else {
      disableGoogleAnalytics(GA_MEASUREMENT_ID);
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6"
        role="dialog"
        aria-live="polite"
        aria-labelledby="cookie-banner-title"
      >
        <div className="px-frame mx-auto max-w-4xl p-5 sm:p-6">

          {!showConfig ? (
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 id="cookie-banner-title" className="px-title mb-2 flex items-center gap-2 text-3xl">
                  <svg className="h-5 w-5 text-[var(--accent-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 10.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Valoramos tu privacidad
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Utilizamos cookies propias necesarias para el funcionamiento de la web y cookies de terceros (Google Analytics 4) para analizar el tráfico, sin fines publicitarios y totalmente anonimizadas. Puedes aceptar todas, rechazarlas o configurar tus preferencias. 
                  Más información en la <Link to="/politica-cookies" className="px-link">Política de Cookies</Link> y <Link to="/politica-privacidad" className="px-link">Política de Privacidad</Link>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-btn px-btn--bone"
                >
                  Configurar
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-btn px-btn--bone"
                >
                  Rechazar no esenciales
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-btn"
                >
                  Aceptar todas
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <h2 className="px-title mb-4 text-3xl">Configuración de Cookies</h2>
              <div className="space-y-4 mb-6">
                
                {/* Estrictamente necesarias */}
                <div className="flex items-start justify-between p-4 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div className="pr-4">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Cookies Estrictamente Necesarias</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Son imprescindibles para que la página web funcione correctamente. Por ejemplo, guardar tu preferencia de tema oscuro/claro de forma local o tus propias preferencias sobre cookies.</p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span className="text-xs font-bold text-[var(--text-muted)] cursor-not-allowed">Siempre activas</span>
                  </div>
                </div>

                {/* Analíticas */}
                <div className="flex items-start justify-between p-4 border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
                  <div className="pr-4">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">Cookies de Análisis (GA4)</h3>
                    <p className="text-xs text-[var(--text-secondary)]">Nos permiten medir de forma anónima cuántos usuarios visitan la web y qué secciones leen más. Nos ayuda enormemente a mejorar el contenido del portfolio. No cruzamos perfiles ni vendemos datos.</p>
                  </div>
                  <div className="shrink-0 pt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={analyticsEnabled} 
                        onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                        aria-label="Habilitar o deshabilitar cookies analíticas"
                      />
                      <div className="h-6 w-11 border-2 border-[var(--px-ink)] bg-[var(--bg-primary)] peer peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-[var(--accent-secondary)] peer-checked:after:translate-x-5 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:bg-[var(--text-primary)] after:content-[''] peer-checked:bg-[var(--accent-primary)]"></div>
                    </label>
                  </div>
                </div>

              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-btn px-btn--bone"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-btn"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
