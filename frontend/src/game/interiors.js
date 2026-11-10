// Plano de las salas interiores, en teselas de 16 px. Sin dependencias de Phaser.
// Por ahora todas las casas son una sala vacía: solo cambia el tamaño, que sigue al del edificio de fuera.
import { TILE } from './world.js'

// Filas de pared del fondo (se ven de frente) antes de empezar el suelo.
export const WALL_ROWS = 3
// Id de la puerta de salida que publica la escena: no coincide con ningún edificio.
export const EXIT_ID = 'exit'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

// Tamaño y puntos de la sala de un edificio. `bounds` es el rectángulo donde pueden estar los pies de la viajera
// (la pared del fondo y las laterales quedan fuera) y `exit` la zona del felpudo, centrada abajo.
export function roomOf(building) {
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
    bounds: { x: TILE, y: WALL_ROWS * TILE, width: width - 2 * TILE, height: height - WALL_ROWS * TILE },
    // Se nace sobre el felpudo pero fuera de su zona: así el botón de salir no sale nada más entrar.
    spawn: { x: centre + TILE / 2, y: height - TILE * 1.5 },
    exit: { x: centre - 8, y: height - TILE - 4, width: TILE + 16, height: TILE + 4 },
  }
}
