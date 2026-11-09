// Decisión del visitante sobre las cookies. Vive aquí, y no dentro del banner, para que otros
// avisos (como el de instalar la app) esperen a que ya esté tomada.
export const COOKIE_CONSENT_KEY = 'user_cookie_consent'
export const COOKIE_CONSENT_EVENT = 'cookie-consent-saved'

export function hasCookieDecision() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) !== null
  } catch {
    return false
  }
}

export function saveCookieConsent(consent) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
}
