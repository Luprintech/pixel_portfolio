// Partida guardada en el navegador. Es una sola clave versionada: si el formato cambia,
// se sube `version` y se migra aquí, sin que el resto del código se entere.
import { upgradeLook } from './look.js'

const SAVE_KEY = 'valle-del-bucle:save'
// Clave de antes del creador de personaje: solo guardaba el aspecto, sin nombre.
const LEGACY_LOOK_KEY = 'valle-del-bucle:look'
export const SAVE_VERSION = 1
export const NAME_MAX = 16

// Deja solo letras, números, espacios, guion y apóstrofo, sin espacios repetidos ni sobrantes.
// El nombre se pinta en pantalla y nunca se envía a ningún servidor.
export function sanitizeName(value) {
  return String(value ?? '')
    .replace(/[^\p{L}\p{N} '-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim()
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Devuelve { version, name, look } o null si no hay partida o está dañada.
export function loadSave() {
  const saved = readJson(SAVE_KEY)
  if (saved && saved.version === SAVE_VERSION) {
    const look = upgradeLook(saved.look)
    if (look) return { version: SAVE_VERSION, name: sanitizeName(saved.name), look }
  }
  const legacy = upgradeLook(readJson(LEGACY_LOOK_KEY))
  return legacy ? { version: SAVE_VERSION, name: '', look: legacy } : null
}

export function writeSave({ name, look }) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, name: sanitizeName(name), look }))
    localStorage.removeItem(LEGACY_LOOK_KEY)
  } catch {
    // Sin almacenamiento disponible: la partida dura solo esta visita.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
    localStorage.removeItem(LEGACY_LOOK_KEY)
  } catch {
    // Nada que borrar si el navegador no deja acceder al almacenamiento.
  }
}
