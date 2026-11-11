// Logros del valle. Cada uno tiene un id estable (el texto está en `lib/valleCopy.js`, `achievements.items`) y se
// guarda en el navegador junto a la partida: «Borrar partida» los borra también. Más adelante se irán sumando (huevos de
// pascua) añadiendo su id aquí y su texto en los dos idiomas. Sin dependencias de Phaser ni de React.
const KEY = 'valle-del-bucle:achievements'

// En el orden en que se enseñan en Opciones.
export const ACHIEVEMENT_IDS = ['maker', 'retro']

export function loadAchievements() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return new Set(Array.isArray(raw) ? raw.filter((id) => ACHIEVEMENT_IDS.includes(id)) : [])
  } catch {
    return new Set()
  }
}

// Desbloquea un logro: devuelve el conjunto nuevo y si es la primera vez. Sin almacenamiento, solo vale en memoria.
export function unlockAchievement(current, id) {
  if (!ACHIEVEMENT_IDS.includes(id) || current.has(id)) return { next: current, isNew: false }
  const next = new Set(current).add(id)
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]))
  } catch {
    // Almacenamiento bloqueado o lleno: el logro dura hasta recargar.
  }
  return { next, isNew: true }
}

export function clearAchievements() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}
