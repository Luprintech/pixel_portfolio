// Estado compartido de la instalación de la app. Vive fuera de React por dos motivos: el navegador
// lanza `beforeinstallprompt` una sola vez y puede hacerlo antes de que ningún componente se haya
// montado, y el cartel y el botón de Opciones deben ver el mismo evento.
import { isStandalone, rememberDismissal, wasRecentlyDismissed } from './pwaInstall'

const listeners = new Set()
let captureStarted = false
let state = initialState()

function initialState() {
  return { event: null, installed: isStandalone(), dismissed: wasRecentlyDismissed(), forced: false }
}

function update(patch) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export const subscribeInstall = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const getInstallState = () => state

// Idempotente: se llama al arrancar la app y otra vez desde el hook por si acaso.
export function captureInstallEvents() {
  if (captureStarted || typeof window === 'undefined') return
  captureStarted = true
  window.addEventListener('beforeinstallprompt', (event) => {
    // Se guarda el evento para lanzarlo desde nuestros botones y no desde la mini-barra de Chrome
    event.preventDefault()
    update({ event })
  })
  window.addEventListener('appinstalled', () => update({ event: null, installed: true, forced: false }))
}

export function dismissInstall() {
  rememberDismissal()
  update({ dismissed: true, forced: false })
}

// Lanza el diálogo del navegador. Solo se puede una vez por evento.
export async function promptNativeInstall() {
  const { event } = state
  if (!event) return
  update({ event: null })
  event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'dismissed') dismissInstall()
}

// Botón "Instalar app" de Opciones: salta el retardo y el descarte anterior. Con diálogo nativo
// lo abre directamente; sin él (iPhone, Android sin aviso) fuerza que salga el cartel con los pasos.
export function requestInstall() {
  if (state.event) return promptNativeInstall()
  update({ forced: true })
  return undefined
}

// Solo para las pruebas: vuelve al estado de una visita nueva.
export function resetInstallStore() {
  state = initialState()
  listeners.forEach((listener) => listener())
}
