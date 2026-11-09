// Decide si toca ofrecer instalar la web como app y con qué instrucciones. Solo lógica: el
// componente y el hook se ocupan de pintar y de escuchar el navegador.
const DISMISSED_KEY = 'valle-del-bucle:install-dismissed'
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000

// iPadOS 13+ se presenta como Mac: solo lo delata que tiene pantalla táctil.
export function isIos({ userAgent = '', platform = '', maxTouchPoints = 0 } = {}) {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true
  return platform === 'MacIntel' && maxTouchPoints > 1
}

export function isAndroid({ userAgent = '' } = {}) {
  return /Android/.test(userAgent)
}

// En iOS cada navegador coloca el botón de compartir en un sitio distinto, y solo Safari y Chrome
// permiten "Añadir a pantalla de inicio". Firefox y Edge no: para ellos se pide abrir Safari.
export function iosBrowser(userAgent = '') {
  if (/CriOS/.test(userAgent)) return 'chrome'
  if (/FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(userAgent)) return 'other'
  return 'safari'
}

// 'ios', 'android' o null cuando no hay nada que ofrecer (escritorio u otro sistema).
export function installPlatform(env) {
  if (isIos(env)) return 'ios'
  if (isAndroid(env)) return 'android'
  return null
}

// `navigator.standalone` es la señal propia de iOS; el resto usa la media query.
export function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.navigator.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true
}

export function wasRecentlyDismissed(now = Date.now()) {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY))
    return Number.isFinite(at) && at > 0 && now - at < SNOOZE_MS
  } catch {
    return false
  }
}

export function rememberDismissal(now = Date.now()) {
  try {
    localStorage.setItem(DISMISSED_KEY, String(now))
  } catch {
    // Sin almacenamiento el aviso vuelve a salir en la próxima visita: no es grave
  }
}
