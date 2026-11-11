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
//   6. Khalessi (caja, rascador, comedero y arenero), pegada a la pared derecha, bajo la zona de Lupe.
import { TILE } from '../world.js'

export const HOME_ID = 'about'

// Más grande que las demás salas (que siguen al tamaño del edificio): hace falta sitio para dos mesas de trabajo, la
// recreativa, la zona de ocio, el rincón maker y la zona de la gata sin amontonarlo. Pared del fondo de cuatro teselas.
export const HOME_SIZE = { cols: 33, rows: 17, wallRows: 4 }

// Fila de la pared del fondo contra la que se apoyan los muebles de pared (su base, el suelo que pisan).
export const WALL_BASE = 80

// Columna central de cada mueble de la pared del fondo, de izquierda a derecha. La decoración de la pared y las luces
// led leen estas cifras para quedar siempre sobre su mueble.
export const WALL_X = { stairs: 38, atreusDesk: 116, consoleShelf: 204, arcade: 266, tv: 338, hifi: 396, lupeDesk: 474 }

// Sitios de los muebles del suelo que otras piezas (zonas, cámara, decoración) necesitan conocer.
export const SPOTS = {
  sofa: { x: WALL_X.tv, y: 198 },
  coffeeTable: { x: WALL_X.tv, y: 148 },
  lamp: { x: WALL_X.tv - 42, y: 196 },
  // Rincón de Khalessi, contra la pared derecha y bajo la mesa de Lupe: la caja de cartón a la izquierda, el rascador arriba, el
  // comedero en medio y el arenero abajo.
  box: { x: 452, y: 186 },
  scratcher: { x: 494, y: 166 },
  bowls: { x: 490, y: 202 },
  litter: { x: 480, y: 238 },
  printerA1: { x: 58, y: 220 },
  printerMini: { x: 122, y: 220 },
  makerShelf: { x: 176, y: 208 },
}

// La torre del PC de Lupe va pegada a la izquierda de su mesa, dentro del mismo dibujo: la mesa mide 14 píxeles más y su
// centro (el de la tabla, `WALL_X.lupeDesk`) se desplaza media torre.
export const LUPE_TOWER_W = 14

// Centro de la torre del PC de Lupe (y del NAS que lleva encima): la torre es lo primero de la mesa, de 14 de ancho.
export const LUPE_TOWER_X = WALL_X.lupeDesk - 45

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

// `dz` ajusta el orden de dibujo respecto a otros elementos de la misma base (las sillas, el sofá y la caja de Khalessi van en dos capas).
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
  { kind: 'tallPlant', x: WALL_X.tv + 44, y: SPOTS.sofa.y - 4 },
  // Rincón maker, abajo a la izquierda y por delante: dos impresoras Bambu Lab, la A1 (con el AMS arriba) y la A1 mini, y la
  // vitrina de las piezas ya impresas.
  { kind: 'printerA1', ...SPOTS.printerA1 },
  { kind: 'printerMini', ...SPOTS.printerMini },
  { kind: 'makerShelf', ...SPOTS.makerShelf },
  // Zona de Khalessi: la caja de cartón (la capa de atrás, la gata y la capa de delante), el rascador, la comida y el arenero.
  { kind: 'boxBack', ...SPOTS.box, dz: -0.5 },
  { kind: 'boxFront', ...SPOTS.box, dz: 0.5 },
  { kind: 'scratcher', ...SPOTS.scratcher },
  { kind: 'catBowls', ...SPOTS.bowls },
  { kind: 'litterBox', ...SPOTS.litter },
  { kind: 'bigPlant', x: 498, y: 272 },
]

// Personajes fijos de la sala. `facing` es hacia donde miran en reposo. Khalessi no está aquí: se mueve por toda la casa y
// se rige por `catBrain.js`, que parte del rascador.
export const NPC_PLAN = [{ id: 'atreus', x: 148, y: 106, facing: 'down' }]

// Cuerpo sólido de Atreus, para que no se le atraviese. Khalessi no lo necesita: anda por donde no hay muebles (ver `catNav.js`).
export const ATREUS_BODY = { l: -5, t: -4, r: 5, b: 0 }

// Asientos de la casa. `x, y` es el sitio de los pies al sentarse (la viajera se queda en él, con las piernas tapadas), `facing`
// hacia dónde mira sentada y `depth` el orden de dibujo (entre las dos capas del mueble). Se entra por delante del asiento, por
// el lado al que mira: `zone` es el suelo desde el que se ofrece sentarse, `anchor` desempata entre dos zonas y `exit` el sitio
// libre en el que aparece la viajera al levantarse. Todas las sillas y el sofá miran a su mesa o a la tele, al norte, así que
// la entrada está entre el asiento y esa mesa y hay que mirar hacia el sur, hacia el asiento. `use` es lo que se hace con E
// estando sentada: abrir el ordenador o encender la tele. Sin `use`, E levanta.
const SOFA = SPOTS.sofa
// `y` es la fila de la base del dibujo de la viajera sentada, que de espaldas no lleva piernas: se elige para que sus hombros
// queden justo por encima del respaldo (el tablón de delante del sofá y la parte alta de la silla), que le tapa el resto del
// cuerpo, y la cabeza asome sobre él. Con los pies en esa fila parecía de pie sobre el asiento.
const CHAIR_SEAT_Y = 96
const SOFA_SEAT_Y = SOFA.y - 11
// Entre el escritorio y la silla queda un pasillo: los pies (cuerpo de 8×4) caben en él sin tocar ninguno de los dos.
const DESK_FRONT_Y = 93
// Entre la mesita y el sofá, igual.
const SOFA_FRONT_Y = SOFA.y - 38
// Hacia dónde hay que mirar para tener el asiento delante, según hacia dónde mira quien se sienta.
export const FACE_TO_SEAT = { up: 'down', down: 'up', left: 'right', right: 'left' }

const deskChair = (id, x, use) => ({
  id, x, y: CHAIR_SEAT_Y, facing: 'up', depth: 108, use,
  zone: { x: x - 12, y: DESK_FRONT_Y - 9, w: 24, h: 16 }, anchor: { x, y: DESK_FRONT_Y }, exit: { x, y: DESK_FRONT_Y },
})

const sofaSeat = (id, x, use) => ({
  id, x, y: SOFA_SEAT_Y, facing: 'up', depth: SOFA.y, use,
  zone: { x: x - 12, y: SOFA_FRONT_Y - 9, w: 24, h: 16 }, anchor: { x, y: SOFA_FRONT_Y }, exit: { x, y: SOFA_FRONT_Y },
})

export const SEATS = [
  deskChair('chairAtreus', 108),
  deskChair('chairLupe', WALL_X.lupeDesk, 'pc'),
  sofaSeat('sofaLeft', SOFA.x - 12, 'television'),
  sofaSeat('sofaRight', SOFA.x + 14, 'television'),
]

// Desde dónde se juega a la recreativa y a dónde vuelve la viajera al salir del juego: ante la máquina, mirándola.
export const ARCADE_FRONT = { x: WALL_X.arcade, y: 96, facing: 'up' }

// Lo que se puede usar con E. Cada zona es el suelo desde el que se alcanza (los pies de la viajera dentro del rectángulo).
// Una interacción con varias zonas se alcanza desde cualquiera de ellas. `anchor` desempata cuando hay dos a la vez:
// gana la que tenga su ancla más cerca.
export const INTERACTIONS = [
  { id: 'atreus', anchor: { x: 148, y: 106 }, zones: [{ x: 124, y: 92, w: 50, h: 34 }] },
  // Ante el rascador, su sitio de siempre; si anda por la sala se la saluda donde esté (ver `InteriorScene.catNear`).
  {
    id: 'khalessi',
    anchor: { x: SPOTS.scratcher.x - 6, y: SPOTS.scratcher.y + 14 },
    zones: [
      { x: SPOTS.scratcher.x - 34, y: SPOTS.scratcher.y + 6, w: 52, h: 22 },
      // Ante su caja, donde se asoma a verla.
      { x: SPOTS.box.x - 18, y: SPOTS.box.y + 8, w: 36, h: 22 },
    ],
  },
  { id: 'lamp', anchor: { x: SPOTS.lamp.x - 2, y: SPOTS.lamp.y + 10 }, zones: [{ x: SPOTS.lamp.x - 22, y: SPOTS.lamp.y + 4, w: 32, h: 14 }] },
  { id: 'shelf', anchor: { x: WALL_X.consoleShelf, y: 90 }, zones: [{ x: 178, y: 82, w: 54, h: 16 }] },
  { id: 'arcade', anchor: { x: ARCADE_FRONT.x, y: ARCADE_FRONT.y }, zones: [{ x: 250, y: 82, w: 32, h: 26 }] },
  { id: 'television', anchor: { x: WALL_X.tv, y: 92 }, zones: [{ x: 302, y: 82, w: 72, h: 18 }] },
  { id: 'hifi', anchor: { x: WALL_X.hifi, y: 92 }, zones: [{ x: WALL_X.hifi - 18, y: 82, w: 36, h: 18 }] },
  { id: 'roof', anchor: { x: WALL_X.stairs, y: 92 }, zones: [{ x: 16, y: 82, w: 44, h: 24 }] },
  // El ordenador de Lupe se enciende de pie desde los lados de la silla y desde detrás de ella; desde delante de la silla se ofrece
  // sentarse (y, sentada, se enciende con E).
  {
    id: 'pc',
    anchor: { x: WALL_X.lupeDesk - 28, y: 96 },
    zones: [
      // Los lados llegan hasta unos pasos de la mesa y bajan hasta el borde de la alfombra: basta con acercarse a ella, no hace falta
      // pegarse a la cajonera ni a la torre.
      // Ante la torre, pegada a ella, es el NAS (`nas`): más abajo y a sus lados sigue siendo el ordenador.
      { x: WALL_X.lupeDesk - 76, y: 82, w: 21, h: 44 },
      { x: LUPE_TOWER_X - 10, y: 98, w: 20, h: 28 },
      { x: LUPE_TOWER_X + 10, y: 82, w: 23, h: 44 },
      { x: WALL_X.lupeDesk + 12, y: 82, w: 48, h: 44 },
      { x: WALL_X.lupeDesk - 38, y: 104, w: 76, h: 18 },
    ],
  },
  // El NAS de Lupe, sobre su torre: se mira desde el suelo de delante de ella, sin pisar la silla ni la zona del ordenador.
  { id: 'nas', anchor: { x: LUPE_TOWER_X, y: 90 }, zones: [{ x: LUPE_TOWER_X - 10, y: 82, w: 20, h: 16 }] },
  { id: 'printer', anchor: { x: SPOTS.printerA1.x, y: SPOTS.printerA1.y + 10 }, zones: [{ x: 28, y: SPOTS.printerA1.y + 4, w: 62, h: 8 }] },
  { id: 'printerMini', anchor: { x: SPOTS.printerMini.x, y: SPOTS.printerMini.y + 10 }, zones: [{ x: 98, y: SPOTS.printerMini.y + 4, w: 46, h: 8 }] },
  { id: 'figures', anchor: { x: SPOTS.makerShelf.x, y: SPOTS.makerShelf.y + 10 }, zones: [{ x: 152, y: SPOTS.makerShelf.y + 4, w: 48, h: 20 }] },
  // Sentarse solo se ofrece de cara al asiento: `faces` es hacia dónde hay que mirar (el asiento está al sur de su zona).
  ...SEATS.map(({ id, anchor, zone, facing }) => ({ id, anchor, zones: [zone], faces: FACE_TO_SEAT[facing] })),
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
