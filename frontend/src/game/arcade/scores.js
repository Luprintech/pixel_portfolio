// Mejores puntuaciones y juegos completados de la recreativa. Se guardan en el navegador junto a la partida («Borrar
// partida» los borra, ver `save.js`) con el mismo patrón que los logros: una clave propia y tolerancia a un almacenamiento
// bloqueado o dañado (entonces solo duran esta visita). Sin dependencias de Phaser ni de React.
import { GAME_IDS } from './games.js'

const KEY = 'valle-del-bucle:arcade'

const empty = () => Object.fromEntries(GAME_IDS.map((id) => [id, { best: 0, cleared: false, plays: 0 }]))

const cleanEntry = (raw) => ({
  best: Number.isFinite(raw?.best) && raw.best > 0 ? Math.floor(raw.best) : 0,
  cleared: raw?.cleared === true,
  plays: Number.isFinite(raw?.plays) && raw.plays > 0 ? Math.floor(raw.plays) : 0,
})

// Lee lo guardado, descartando juegos desconocidos y valores raros.
export function loadScores() {
  const scores = empty()
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    GAME_IDS.forEach((id) => {
      scores[id] = cleanEntry(raw?.[id])
    })
  } catch {
    // Datos dañados o sin almacenamiento: se parte de cero.
  }
  return scores
}

// Anota el resultado de una partida y devuelve las puntuaciones nuevas y si es un récord. Una partida perdida suma a la
// cuenta de partidas y puede mejorar la puntuación; solo una ganada marca el juego como completado.
export function recordResult(scores, id, { score, won }) {
  if (!GAME_IDS.includes(id)) return { next: scores, record: false }
  const before = scores[id] ?? cleanEntry()
  const points = Math.max(0, Math.floor(score) || 0)
  const record = points > before.best
  const next = { ...scores, [id]: { best: record ? points : before.best, cleared: before.cleared || Boolean(won), plays: before.plays + 1 } }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Almacenamiento bloqueado o lleno: el récord dura hasta recargar.
  }
  return { next, record }
}

export function clearScores() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}
