// Plano de la casa de Lupe: tamaño de la sala, dónde va cada mueble, quién vive en ella y qué se puede usar y desde dónde.
// Son solo datos y cuentas (sin Phaser ni lienzo), así se comprueba con pruebas que nada se pisa y que todo se alcanza.
// Las coordenadas son píxeles de la sala; un mueble o un personaje se coloca por el centro de su base.
import { TILE } from '../world.js'

export const HOME_ID = 'about'

// Más grande que las demás salas (que siguen al tamaño del edificio): hace falta sitio para dos mesas de trabajo, la zona
// de ocio, la estantería, el rincón maker y la escalera sin amontonarlo. Pared del fondo de cuatro teselas, para que los
// monitores y los cuadros respiren sobre los muebles.
export const HOME_SIZE = { cols: 24, rows: 14, wallRows: 4 }

// Fila de la pared del fondo contra la que se apoyan los muebles de pared (su base, el suelo que pisan).
const WALL_BASE = 80

// `dz` ajusta el orden de dibujo respecto a otros elementos de la misma base (la caja de Khalessi va en dos capas).
export const FURNITURE_PLAN = [
  // Pared del fondo, de izquierda a derecha: mesa de Atreus, estantería de consolas, tele y mesa de Lupe. El hueco de la
  // izquierda queda libre: ahí está el acceso a la azotea, una zona de suelo sin mueble (ver `INTERACTIONS`).
  { kind: 'atreusDesk', x: 100, y: WALL_BASE },
  { kind: 'consoleShelf', x: 176, y: WALL_BASE },
  { kind: 'tvUnit', x: 248, y: WALL_BASE },
  { kind: 'lupeDesk', x: 326, y: WALL_BASE },
  { kind: 'chairAtreus', x: 92, y: 108 },
  { kind: 'chairLupe', x: 326, y: 108 },
  // Zona de ocio: la mesita entre la tele y el sofá, y el sofá de espaldas a la sala, mirando a la tele.
  { kind: 'coffeeTable', x: 248, y: 124 },
  { kind: 'sofa', x: 248, y: 164 },
  { kind: 'tallPlant', x: 200, y: 150 },
  // Rincón maker, a la izquierda: dos impresoras Bambu Lab, la A1 (con el AMS arriba) y la A1 mini, y la lámpara de pie.
  { kind: 'printerA1', x: 52, y: 164 },
  { kind: 'printerMini', x: 112, y: 164 },
  { kind: 'floorLamp', x: 156, y: 196 },
  { kind: 'hifi', x: 292, y: 198 },
  { kind: 'bigPlant', x: 34, y: 210 },
  // Vitrina de piezas impresas en la zona derecha, bajo la mesa de Lupe, y una planta en la esquina.
  { kind: 'makerShelf', x: 344, y: 162 },
  { kind: 'bigPlant', x: 352, y: 214 },
  // La caja de cartón de Khalessi, con ella dentro: la capa de atrás, la gata y la capa de delante.
  { kind: 'boxBack', x: 172, y: 118, dz: -0.5 },
  { kind: 'boxFront', x: 172, y: 118, dz: 0.5 },
]

// Personajes de la sala. `facing` es hacia donde miran en reposo.
export const NPC_PLAN = [
  { id: 'atreus', x: 132, y: 106, facing: 'down' },
  { id: 'khalessi', x: 172, y: 117 },
]

// Cuerpo sólido de Atreus, para que no se le atraviese. Khalessi no lo necesita: la caja en la que está ya es sólida.
export const ATREUS_BODY = { l: -5, t: -4, r: 5, b: 0 }

// Asientos de la casa. `x, y` es el sitio de los pies al sentarse (la viajera se queda en él, con las piernas tapadas),
// `depth` el orden de dibujo (un poco por delante del mueble), `zone` el suelo desde el que se ofrece sentarse y `use` lo
// que se hace con E estando sentada: abrir el ordenador o encender la tele. Sin `use`, E levanta.
export const SEATS = [
  { id: 'chairAtreus', x: 92, y: 105, facing: 'up', depth: 108.5, zone: { x: 72, y: 112, w: 40, h: 14 }, anchor: { x: 92, y: 118 } },
  { id: 'chairLupe', x: 326, y: 105, facing: 'up', depth: 108.5, zone: { x: 306, y: 112, w: 40, h: 14 }, anchor: { x: 326, y: 118 }, use: 'pc' },
  { id: 'sofaLeft', x: 236, y: 158, facing: 'up', depth: 164.5, zone: { x: 216, y: 170, w: 30, h: 14 }, anchor: { x: 232, y: 176 }, use: 'television' },
  { id: 'sofaRight', x: 262, y: 158, facing: 'up', depth: 164.5, zone: { x: 248, y: 170, w: 30, h: 14 }, anchor: { x: 264, y: 176 }, use: 'television' },
]

// Lo que se puede usar con E. Cada zona es el suelo desde el que se alcanza (los pies de la viajera dentro del rectángulo).
// Una interacción con varias zonas se alcanza desde cualquiera de ellas. `anchor` desempata cuando hay dos a la vez:
// gana la que tenga su ancla más cerca.
export const INTERACTIONS = [
  { id: 'atreus', anchor: { x: 132, y: 106 }, zones: [{ x: 108, y: 92, w: 52, h: 34 }] },
  { id: 'khalessi', anchor: { x: 172, y: 117 }, zones: [{ x: 150, y: 106, w: 46, h: 28 }] },
  { id: 'shelf', anchor: { x: 176, y: 90 }, zones: [{ x: 148, y: 82, w: 56, h: 16 }] },
  { id: 'television', anchor: { x: 248, y: 92 }, zones: [{ x: 212, y: 82, w: 72, h: 18 }] },
  { id: 'roof', anchor: { x: 38, y: 92 }, zones: [{ x: 16, y: 82, w: 44, h: 24 }] },
  { id: 'pc', anchor: { x: 326, y: 96 }, zones: [{ x: 290, y: 82, w: 76, h: 40 }] },
  { id: 'printer', anchor: { x: 52, y: 172 }, zones: [{ x: 22, y: 168, w: 62, h: 20 }] },
  { id: 'printerMini', anchor: { x: 112, y: 172 }, zones: [{ x: 90, y: 168, w: 46, h: 20 }] },
  { id: 'figures', anchor: { x: 344, y: 176 }, zones: [{ x: 322, y: 168, w: 44, h: 18 }] },
  { id: 'hifi', anchor: { x: 292, y: 208 }, zones: [{ x: 272, y: 202, w: 40, h: 14 }] },
  ...SEATS.map(({ id, anchor, zone }) => ({ id, anchor, zones: [zone] })),
]

// Interacción cuya zona contiene los pies en (x, y), o null. Si hay dos a la vez gana la de ancla más cercana.
export function interactionAt(x, y) {
  const inside = INTERACTIONS.filter(({ zones }) => zones.some((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h))
  const distance = ({ anchor }) => Math.hypot(anchor.x - x, anchor.y - y)
  return inside.sort((a, b) => distance(a) - distance(b))[0]?.id ?? null
}

// Datos de la sala para la escena y el plano de salas (`interiors.js`): mismas claves que una sala genérica.
export function homeRoom() {
  const { cols, rows, wallRows } = HOME_SIZE
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
    home: true,
  }
}
