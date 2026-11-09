import { useState, useSyncExternalStore } from 'react'
import { installPlatform } from '../lib/pwaInstall'
import {
  captureInstallEvents,
  dismissInstall,
  getInstallState,
  promptNativeInstall,
  requestInstall,
  subscribeInstall,
} from '../lib/installStore'

const browserEnv = () => ({
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints,
})

// Cómo se puede instalar la web en este dispositivo, o null si no se puede (ya instalada o
// navegador sin soporte):
// - 'native': el navegador (Chrome o Edge, en móvil o en escritorio) ha ofrecido instalar; `install()`
//   abre su diálogo.
// - 'ios': Safari y Chrome de iPhone no tienen diálogo; hay que explicar los pasos a mano.
// - 'android-manual': Android sin aviso del navegador (otro navegador, o aún no ha saltado).
function installMode(platform, { event, installed }) {
  if (installed) return null
  if (event) return 'native'
  if (platform === 'ios') return 'ios'
  if (platform === 'android') return 'android-manual'
  return null
}

// `available` dice si hay forma de instalar; `mode` solo vale cuando toca enseñar el cartel (no
// descartado hace poco), salvo que se haya pedido a mano desde Opciones (`forced`).
export function useInstallPrompt() {
  captureInstallEvents()
  const store = useSyncExternalStore(subscribeInstall, getInstallState)
  const [platform] = useState(() => (typeof navigator === 'undefined' ? null : installPlatform(browserEnv())))

  const available = installMode(platform, store)
  const mode = store.dismissed && !store.forced ? null : available

  return {
    available,
    mode,
    forced: store.forced,
    install: promptNativeInstall,
    dismiss: dismissInstall,
    request: requestInstall,
  }
}
