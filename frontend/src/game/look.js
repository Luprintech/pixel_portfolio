// Aspecto de la viajera: se guarda en el navegador y lo comparten juego, título y editor.
export const LOOK_OPTIONS = {
  hair: ['#8a3f2c', '#1c1b3a', '#e0b04a', '#c9c9d8', '#b8527a', '#3a6a3a'],
  skin: ['#f6d9c0', '#f0c09a', '#d9a07a', '#a8714f', '#6b4430'],
  dress: ['#2f8f8b', '#7a3f8f', '#d4503a', '#3e6fb0', '#4f7f3f', '#f1e6cf'],
  trim: ['#f2b134', '#cfd6e6', '#d4503a', '#4cb3c9'],
}

export const LOOK_LABELS = {
  es: { hair: 'Pelo', skin: 'Piel', dress: 'Vestido', trim: 'Aro y ribetes' },
  en: { hair: 'Hair', skin: 'Skin', dress: 'Dress', trim: 'Circlet and trim' },
}

const STORAGE_KEY = 'valle-del-bucle:look'

const pick = (list) => list[Math.floor(Math.random() * list.length)]

export function randomLook() {
  return {
    hair: pick(LOOK_OPTIONS.hair),
    skin: pick(LOOK_OPTIONS.skin),
    dress: pick(LOOK_OPTIONS.dress),
    trim: pick(LOOK_OPTIONS.trim),
  }
}

export function isValidLook(look) {
  return (
    !!look &&
    Object.keys(LOOK_OPTIONS).every((key) => LOOK_OPTIONS[key].includes(look[key]))
  )
}

export function loadLook() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const look = JSON.parse(raw)
    return isValidLook(look) ? look : null
  } catch {
    return null
  }
}

export function saveLook(look) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(look))
  } catch {
    // Sin almacenamiento disponible: la viajera dura solo esta visita.
  }
}
