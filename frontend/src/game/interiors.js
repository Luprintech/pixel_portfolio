// Plano de las salas interiores, en teselas de 16 px. Sin dependencias de Phaser.
// Las casas sin interior propio son una sala vacía que sigue al tamaño del edificio de fuera; la casa de Lupe tiene el suyo
// (`interior/homeLayout.js`).
import { HOME_ID, homeRoom } from './interior/homeLayout.js'
import { TILE } from './world.js'

// Filas de pared del fondo (se ven de frente) antes de empezar el suelo.
export const WALL_ROWS = 3
// Id de la puerta de salida que publica la escena: no coincide con ningún edificio.
export const EXIT_ID = 'exit'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// Tamaño y puntos de la sala de un edificio. `bounds` es el rectángulo donde pueden estar los pies de la viajera
// (la pared del fondo y las laterales quedan fuera) y `exit` la zona del felpudo, centrada abajo.
export function roomOf(building) {
  if (building.id === HOME_ID) return homeRoom()
  const cols = clamp(building.w, 8, 14)
  const rows = clamp(building.h + 1, 7, 10)
  const width = cols * TILE
  const height = rows * TILE
  const centre = Math.floor(cols / 2) * TILE
  return {
    cols,
    rows,
    width,
    height,
    wallRows: WALL_ROWS,
    bounds: { x: TILE, y: WALL_ROWS * TILE, width: width - 2 * TILE, height: height - WALL_ROWS * TILE },
    // Se nace sobre el felpudo pero fuera de su zona: así el botón de salir no sale nada más entrar.
    spawn: { x: centre + TILE / 2, y: height - TILE * 1.5 },
    exit: { x: centre - 8, y: height - TILE - 4, width: TILE + 16, height: TILE + 4 },
  }
}
