// Plano de la casa de Lupe: tamaño de la sala, dónde va cada mueble, quién vive en ella y qué se puede usar y desde dónde.
// Son solo datos y cuentas (sin Phaser ni lienzo), así se comprueba con pruebas que nada se pisa y que todo se alcanza.
// Las coordenadas son píxeles de la sala; un mueble o un personaje se coloca por el centro de su base.
//
// La sala se lee por zonas, con su suelo despejado entre ellas:
//   1. Atreus (setup gaming), arriba a la izquierda, junto a la escalera de la azotea.
//   2. Estantería de videoconsolas y recreativa arcade, en medio de la pared del fondo.
//   3. Relax (tele, minicadena, sofá y alfombra), a la derecha del centro.
//   4. Lupe (setup de trabajo), en la esquina derecha del fondo.
//   5. Impresión 3D (dos Bambu Lab y la vitrina de piezas), abajo a la izquierda y por delante. Las impresoras están
//      adelantadas unos píxeles respecto a la vitrina, sin llegar a la zona gaming de Atreus.
//   6. Khalessi (caja, rascador, comida y arenero), en el centro, con el recorrido hasta Atreus libre.
import { TILE } from '../world.js'

export const HOME_ID = 'about'

// Más grande que las demás salas (que siguen al tamaño del edificio): hace falta sitio para dos mesas de trabajo, la
// recreativa, la zona de ocio, el rincón maker y la zona de la gata sin amontonarlo. Pared del fondo de cuatro teselas.
export const HOME_SIZE = { cols: 33, rows: 17, wallRows: 4 }

// Fila de la pared del fondo contra la que se apoyan los muebles de pared (su base, el suelo que pisan).
export const WALL_BASE = 80

// Columna central de cada mueble de la pared del fondo, de izquierda a derecha. La decoración de la pared y las luces
// led leen estas cifras para quedar siempre sobre su mueble.
export const WALL_X = { stairs: 38, atreusDesk: 116, consoleShelf: 204, arcade: 266, tv: 338, hifi: 402, lupeDesk: 474 }

// Sitios de los muebles del suelo que otras piezas (zonas, cámara, decoración) necesitan conocer.
export const SPOTS = {
  sofa: { x: WALL_X.tv, y: 190 },
  coffeeTable: { x: WALL_X.tv, y: 140 },
  lamp: { x: WALL_X.tv - 42, y: 188 },
  box: { x: 236, y: 176 },
  scratcher: { x: 262, y: 172 },
  bowls: { x: 262, y: 210 },
  litter: { x: 222, y: 238 },
  printerA1: { x: 58, y: 256 },
  printerMini: { x: 122, y: 256 },
  makerShelf: { x: 176, y: 248 },
}

// La torre del PC de Lupe va pegada a la izquierda de su mesa, dentro del mismo dibujo: la mesa mide 14 píxeles más y su
// centro (el de la tabla, `WALL_X.lupeDesk`) se desplaza media torre.
export const LUPE_TOWER_W = 14

// La puerta de cristal de la escalera de la azotea: el tamaño del mueble y su cristal, relativo a su esquina.
export const ROOF_DOOR = { w: 36, h: 62, glass: { x: 7, y: 3, w: 22, h: 24 } }

// Cristales por los que se ve el exterior, en píxeles de la sala. La sala los deja huecos (el dibujo estático no pinta cielo)
// y `InteriorSky` pone detrás el cielo vivo del valle: la misma hora, estación y tiempo. `frame` es si el hueco lleva
// marco y repisa en la pared (la puerta de la azotea ya lo trae en su propio dibujo) y `curtains` si lleva cortinas.
export const WINDOWS = [
  { id: 'shelf', x: WALL_X.consoleShelf - 22, y: 6, w: 28, h: 14, frame: true, curtains: false },
  { id: 'tv', x: WALL_X.tv - 18, y: 7, w: 36, h: 18, frame: true, curtains: true },
  {
    id: 'roofDoor',
    x: WALL_X.stairs - ROOF_DOOR.w / 2 + ROOF_DOOR.glass.x,
    y: WALL_BASE - ROOF_DOOR.h + ROOF_DOOR.glass.y,
    w: ROOF_DOOR.glass.w,
    h: ROOF_DOOR.glass.h,
    frame: false,
    curtains: false,
  },
]

// `dz` ajusta el orden de dibujo respecto a otros elementos de la misma base (la caja de Khalessi va en dos capas).
export const FURNITURE_PLAN = [
  // Pared del fondo, de izquierda a derecha: escalera a la azotea (como la escalera exterior), mesa de Atreus, estantería de
  // consolas, recreativa, tele, minicadena y mesa de Lupe.
  { kind: 'roofStairs', x: WALL_X.stairs, y: WALL_BASE },
  { kind: 'atreusDesk', x: WALL_X.atreusDesk, y: WALL_BASE },
  { kind: 'consoleShelf', x: WALL_X.consoleShelf, y: WALL_BASE },
  { kind: 'arcade', x: WALL_X.arcade, y: WALL_BASE },
  { kind: 'tvUnit', x: WALL_X.tv, y: WALL_BASE },
  { kind: 'hifi', x: WALL_X.hifi, y: WALL_BASE },
  { kind: 'lupeDesk', x: WALL_X.lupeDesk - LUPE_TOWER_W / 2, y: WALL_BASE },
  // Cada silla va en dos capas (`dz`): persona sentada entre ellas.
  { kind: 'chairAtreus', x: 108, y: 108, dz: -0.5 },
  { kind: 'chairAtreusFront', x: 108, y: 108, dz: 0.5 },
  { kind: 'chairLupe', x: WALL_X.lupeDesk, y: 108, dz: -0.5 },
  { kind: 'chairLupeFront', x: WALL_X.lupeDesk, y: 108, dz: 0.5 },
  // Zona relax: la mesita entre la tele y el sofá, el sofá de espaldas a la sala mirando a la tele, y una planta a su lado.
  { kind: 'coffeeTable', ...SPOTS.coffeeTable },
  { kind: 'sofa', ...SPOTS.sofa, dz: -0.5 },
  { kind: 'sofaFront', ...SPOTS.sofa, dz: 0.5 },
  { kind: 'floorLamp', ...SPOTS.lamp },
  { kind: 'tallPlant', x: 418, y: 184 },
  // Rincón maker, abajo a la izquierda y por delante: dos impresoras Bambu Lab, la A1 (con el AMS arriba) y la A1 mini, y la
  // vitrina de las piezas ya impresas.
  { kind: 'printerA1', ...SPOTS.printerA1 },
  { kind: 'printerMini', ...SPOTS.printerMini },
  { kind: 'makerShelf', ...SPOTS.makerShelf },
  { kind: 'bigPlant', x: 496, y: 258 },
  // Zona de Khalessi: la caja de cartón (la capa de atrás, la gata y la capa de delante), el rascador, la comida y el arenero.
  { kind: 'boxBack', ...SPOTS.box, dz: -0.5 },
  { kind: 'boxFront', ...SPOTS.box, dz: 0.5 },
  { kind: 'scratcher', ...SPOTS.scratcher },
  { kind: 'catBowls', ...SPOTS.bowls },
  { kind: 'litterBox', ...SPOTS.litter },
]

// Personajes fijos de la sala. `facing` es hacia donde miran en reposo. Khalessi no está aquí: se mueve por toda la casa y
// se rige por `catBrain.js`, que parte de su caja.
export const NPC_PLAN = [{ id: 'atreus', x: 148, y: 106, facing: 'down' }]

// Cuerpo sólido de Atreus, para que no se le atraviese. Khalessi no lo necesita: anda por donde no hay muebles (ver `catNav.js`).
export const ATREUS_BODY = { l: -5, t: -4, r: 5, b: 0 }

// Asientos de la casa. `x, y` es el sitio de los pies al sentarse (la viajera se queda en él, con las piernas tapadas),
// `depth` el orden de dibujo (un poco por delante del mueble), `zone` el suelo desde el que se ofrece sentarse y `use` lo
// que se hace con E estando sentada: abrir el ordenador o encender la tele. Sin `use`, E levanta.
const SOFA = SPOTS.sofa
export const SEATS = [
  // Solo se ofrece sentarse desde delante: las zonas están ante la silla o el sofá, a su ancho y nunca a los lados ni detrás.
  { id: 'chairAtreus', x: 108, y: 106, facing: 'up', depth: 108, zone: { x: 98, y: 113, w: 20, h: 11 }, anchor: { x: 108, y: 118 } },
  { id: 'chairLupe', x: WALL_X.lupeDesk, y: 106, facing: 'up', depth: 108, zone: { x: WALL_X.lupeDesk - 10, y: 113, w: 20, h: 11 }, anchor: { x: WALL_X.lupeDesk, y: 118 }, use: 'pc' },
  { id: 'sofaLeft', x: SOFA.x - 12, y: SOFA.y - 22, facing: 'up', depth: SOFA.y, zone: { x: SOFA.x - 28, y: SOFA.y + 5, w: 24, h: 11 }, anchor: { x: SOFA.x - 16, y: SOFA.y + 11 }, use: 'television' },
  { id: 'sofaRight', x: SOFA.x + 14, y: SOFA.y - 22, facing: 'up', depth: SOFA.y, zone: { x: SOFA.x + 4, y: SOFA.y + 5, w: 24, h: 11 }, anchor: { x: SOFA.x + 16, y: SOFA.y + 11 }, use: 'television' },
]

// Desde dónde se juega a la recreativa y a dónde vuelve la viajera al salir del juego: ante la máquina, mirándola.
export const ARCADE_FRONT = { x: WALL_X.arcade, y: 96, facing: 'up' }

// Lo que se puede usar con E. Cada zona es el suelo desde el que se alcanza (los pies de la viajera dentro del rectángulo).
// Una interacción con varias zonas se alcanza desde cualquiera de ellas. `anchor` desempata cuando hay dos a la vez:
// gana la que tenga su ancla más cerca.
export const INTERACTIONS = [
  { id: 'atreus', anchor: { x: 148, y: 106 }, zones: [{ x: 124, y: 92, w: 50, h: 34 }] },
  { id: 'khalessi', anchor: { x: SPOTS.box.x, y: SPOTS.box.y + 10 }, zones: [{ x: 212, y: 164, w: 48, h: 30 }] },
  { id: 'lamp', anchor: { x: SPOTS.lamp.x - 2, y: SPOTS.lamp.y + 10 }, zones: [{ x: SPOTS.lamp.x - 22, y: SPOTS.lamp.y + 4, w: 32, h: 14 }] },
  { id: 'shelf', anchor: { x: WALL_X.consoleShelf, y: 90 }, zones: [{ x: 178, y: 82, w: 54, h: 16 }] },
  { id: 'arcade', anchor: { x: ARCADE_FRONT.x, y: ARCADE_FRONT.y }, zones: [{ x: 250, y: 82, w: 32, h: 26 }] },
  { id: 'television', anchor: { x: WALL_X.tv, y: 92 }, zones: [{ x: 302, y: 82, w: 72, h: 18 }] },
  { id: 'hifi', anchor: { x: WALL_X.hifi, y: 92 }, zones: [{ x: 384, y: 82, w: 36, h: 18 }] },
  { id: 'roof', anchor: { x: WALL_X.stairs, y: 92 }, zones: [{ x: 16, y: 82, w: 44, h: 24 }] },
  { id: 'pc', anchor: { x: WALL_X.lupeDesk, y: 96 }, zones: [{ x: WALL_X.lupeDesk - 38, y: 82, w: 76, h: 40 }] },
  { id: 'printer', anchor: { x: SPOTS.printerA1.x, y: 266 }, zones: [{ x: 28, y: 260, w: 62, h: 12 }] },
  { id: 'printerMini', anchor: { x: SPOTS.printerMini.x, y: 266 }, zones: [{ x: 98, y: 260, w: 46, h: 12 }] },
  { id: 'figures', anchor: { x: SPOTS.makerShelf.x, y: 258 }, zones: [{ x: 152, y: 252, w: 48, h: 20 }] },
  // Sentarse solo se ofrece de cara al asiento: `faces` es hacia dónde hay que mirar (el asiento está al norte de su zona).
  ...SEATS.map(({ id, anchor, zone, facing }) => ({ id, anchor, zones: [zone], faces: facing })),
]

// Interacción cuya zona contiene los pies en (x, y), o null. Si hay dos a la vez gana la de ancla más cercana. Con `facing`
// (hacia dónde mira la viajera) se descartan las que exigen mirar a otro lado: la silla y el sofá solo se ofrecen de cara.
// Sin `facing` no se filtra por orientación.
export function interactionAt(x, y, facing = null) {
  const inside = INTERACTIONS.filter(
    ({ zones, faces }) => (!faces || !facing || faces === facing) && zones.some((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h),
  )
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
