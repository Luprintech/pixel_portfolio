// Estado del valle que se guarda con la partida: la hora del mundo y dónde está la viajera. Sin dependencias de Phaser.
// `seed` hace falta junto a la hora: de ella salen el tiempo (lluvia, nubes, rayos) y la fase del día.
import { BUILDINGS, COLS, ROWS, SPAWN, TILE, blockedWaterTiles } from './world.js'

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

// Lo guardado puede venir de otra versión o estar manipulado: solo se acepta lo que tiene forma y rango de mundo.
export function sanitizeWorld(raw) {
  if (!raw || typeof raw !== 'object') return null
  const { seed, ms, x, y } = raw
  if (![seed, ms, x, y].every(isNumber)) return null
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || ms < 0) return null
  if (x < 0 || y < 0 || x > COLS * TILE || y > ROWS * TILE) return null
  return { seed, ms, x, y }
}

// Dónde se reanuda. Si el punto guardado cae dentro de un edificio (la cubierta de la casa de Lupe, o un cambio del
// mapa desde que se guardó), la viajera sale por la puerta de ese edificio; si cae en el agua, en la entrada del valle.
export function resumePoint({ x, y }) {
  const tx = Math.floor(x / TILE)
  const ty = Math.floor(y / TILE)
  const building = BUILDINGS.find((b) => tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h)
  if (building) return { x: building.door.x * TILE + TILE / 2, y: building.door.y * TILE + 6 }
  if (blockedWaterTiles().has(`${tx},${ty}`)) return { x: SPAWN.x, y: SPAWN.y }
  return { x, y }
}
