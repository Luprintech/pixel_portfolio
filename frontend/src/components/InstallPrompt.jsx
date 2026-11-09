import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EllipsisVertical, Share, SquarePlus } from 'lucide-react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { iosBrowser } from '../lib/pwaInstall'
import { COOKIE_CONSENT_EVENT, hasCookieDecision } from '../lib/cookieConsent'

// Se espera a que haya decisión sobre las cookies y unos segundos de visita: dos avisos a la vez
// en la misma franja tapan la página, y el de cookies es el obligatorio.
const SHOW_DELAY_MS = 4000

// En /valle la parte baja es del joystick y el panel de zona: ahí el aviso estorbaría jugando.
const HIDDEN_ROUTES = ['/valle']

function IosSteps({ browser, t }) {
  if (browser === 'other') return <p className="text-sm text-[var(--text-secondary)]">{t('install.ios.other')}</p>
  const shareWhere = browser === 'chrome' ? t('install.ios.share_chrome') : t('install.ios.share_safari')
  return (
    <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
      <li className="flex items-start gap-2">
        <Share className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-secondary)]" aria-hidden="true" />
        <span>{shareWhere}</span>
      </li>
      <li className="flex items-start gap-2">
        <SquarePlus className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-secondary)]" aria-hidden="true" />
        <span>{t('install.ios.add')}</span>
      </li>
    </ol>
  )
}

function AndroidSteps({ t }) {
  return (
    <p className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
      <EllipsisVertical className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-secondary)]" aria-hidden="true" />
      <span>{t(window.isSecureContext === false ? 'install.android.insecure' : 'install.android.manual')}</span>
    </p>
  )
}

export default function InstallPrompt() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { mode, forced, install, dismiss } = useInstallPrompt()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!mode) return undefined
    let timer = null
    const startTimer = () => {
      timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS)
    }
    if (hasCookieDecision()) startTimer()
    else window.addEventListener(COOKIE_CONSENT_EVENT, startTimer, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(COOKIE_CONSENT_EVENT, startTimer)
    }
  }, [mode])

  // Pedido a mano desde Opciones: sale ya, sin esperar ni mirar la ruta
  const visible = mode && (forced || (ready && !HIDDEN_ROUTES.includes(pathname)))
  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="install-prompt-title"
      className="fixed inset-x-0 bottom-0 z-40 p-4 sm:left-auto sm:w-[28rem]"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="px-frame mx-auto max-w-md p-5">
        <h2 id="install-prompt-title" className="px-title mb-2 text-3xl">
          {t('install.title')}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">{t('install.recommend')}</p>
        {mode === 'ios' && <IosSteps browser={iosBrowser(navigator.userAgent)} t={t} />}
        {mode === 'android-manual' && <AndroidSteps t={t} />}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={dismiss} className="px-btn px-btn--bone">
            {t(mode === 'native' ? 'install.later' : 'install.close')}
          </button>
          {mode === 'native' && (
            <button type="button" onClick={install} className="px-btn">
              {t('install.action')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
