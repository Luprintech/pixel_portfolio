// Plano del IES Gran Capitán por dentro (edificio `daw`): el aula de DAW. Solo datos y cuentas, sin Phaser ni lienzo, para
// comprobar con pruebas que nada se pisa y que todo se alcanza. Coordenadas en píxeles de la sala; un mueble se coloca por el
// centro de su base. Distribución: pared del fondo con el tablón del itinerario, la pizarra del proyecto y tres ventanas; delante,
// dos filas de mesas con ordenadores (la del centro de la primera abre la ficha de DAW) y un pasillo libre entre ellas.
import { TILE } from '../world.js'
import { pickInteraction } from './interactions.js'

export const GRAN_ID = 'daw'
export const GRAN_SIZE = { cols: 22, rows: 14, wallRows: 4 }

// Cristales por los que se ve el cielo vivo del valle (los dibuja `InteriorSky`). Todos llevan marco y repisa.
export const GRAN_WINDOWS = [
  { id: 'a', x: 28, y: 8, w: 36, h: 24, frame: true, curtains: false },
  { id: 'b', x: 236, y: 8, w: 36, h: 24, frame: true, curtains: false },
  { id: 'c', x: 284, y: 8, w: 36, h: 24, frame: true, curtains: false },
]

// Lo que cuelga de la pared del fondo (no es sólido: está por encima de donde se pisa).
export const GRAN_WALL = {
  notice: { x: 76, y: 10, w: 40, h: 30 },
  board: { x: 128, y: 8, w: 96, h: 38 },
}

const DESK_X = [72, 176, 280]
const DESK_ROWS = [122, 172]

export const GRAN_PLAN = [
  ...DESK_ROWS.flatMap((y, row) => DESK_X.map((x, col) => ({ kind: row === 0 && col === 1 ? 'sheetDesk' : 'classDesk', x, y }))),
  { kind: 'tallPlant', x: 34, y: 100 },
  { kind: 'tallPlant', x: 318, y: 100 },
]

// Puestos preparados para personas que llegarán más adelante. De momento no hay sprite, rutina ni diálogo: solo el sitio, libre y
// alcanzable (lo comprueba la prueba del plano) para que ponerlas no obligue a recolocar nada. Grace espera retrato y diálogos.
export const RESERVED_SPOTS = [
  { id: 'ylonem', x: 228, y: 142, facing: 'left' },
  { id: 'grace', x: 124, y: 142, facing: 'right' },
]

export const GRAN_INTERACTIONS = [
  { id: 'granCartel', anchor: { x: 96, y: 78 }, zones: [{ x: 70, y: 66, w: 52, h: 30 }] },
  { id: 'granPizarra', anchor: { x: 176, y: 80 }, zones: [{ x: 124, y: 66, w: 104, h: 34 }] },
  { id: 'granOrdenador', anchor: { x: 176, y: 130 }, zones: [{ x: 146, y: 122, w: 60, h: 16 }] },
]

export const granInteractionAt = (x, y) => pickInteraction(GRAN_INTERACTIONS, x, y)

// Datos de la sala para la escena y el plano de salas (`interiors.js`): mismas claves que una sala genérica, más `plan` (lo que
// la distingue de una sala vacía) y `windows`.
export function granRoom() {
  const { cols, rows, wallRows } = GRAN_SIZE
  const width = cols * TILE
  const height = rows * TILE
  const centre = Math.floor(cols / 2) * TILE
  return {
    cols,
    rows,
    width,
    height,
    wallRows,
    bounds: { x: TILE, y: wallRows * TILE, width: width - 2 * TILE, height: height - wallRows * TILE },
    spawn: { x: centre + TILE / 2, y: height - TILE * 1.5 },
    exit: { x: centre - 8, y: height - TILE - 4, width: TILE + 16, height: TILE + 4 },
    windows: GRAN_WINDOWS,
    plan: { furniture: GRAN_PLAN, interactions: GRAN_INTERACTIONS, wall: GRAN_WALL, reserved: RESERVED_SPOTS },
  }
}
