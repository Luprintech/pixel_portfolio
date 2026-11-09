// Preferencias de sonido del visitante, guardadas en el navegador.
// La música empieza apagada: los navegadores no dejan sonar nada sin un gesto del usuario
// y, además, no se le impone sonido a nadie al entrar.
const STORAGE_KEY = 'valle-del-bucle:audio'
const DEFAULTS = { on: false, volume: 0.5 }

export const clampVolume = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return DEFAULTS.volume
  return Math.min(1, Math.max(0, number))
}

export function loadAudioPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const saved = JSON.parse(raw)
    return { on: saved.on === true, volume: clampVolume(saved.volume ?? DEFAULTS.volume) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveAudioPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ on: prefs.on === true, volume: clampVolume(prefs.volume) }))
  } catch {
    // Sin almacenamiento disponible: las preferencias duran solo esta visita.
  }
}
