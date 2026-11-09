// Opciones del juego que elige el visitante, guardadas en el navegador. Con `reduceMotion`
// la portada se pinta como una imagen quieta aunque el sistema no pida reducir el movimiento.
const STORAGE_KEY = 'valle-del-bucle:options'
const DEFAULTS = { reduceMotion: false }

export function loadGameOptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { reduceMotion: JSON.parse(raw).reduceMotion === true }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveGameOptions(options) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ reduceMotion: options.reduceMotion === true }))
  } catch {
    // Sin almacenamiento disponible: la elección dura solo esta visita.
  }
}
