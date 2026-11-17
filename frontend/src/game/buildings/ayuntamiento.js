// Ayuntamiento de Córdoba, a partir de la lámina pixel art de la usuaria, que sigue el edificio real de la calle Capitulares:
// cubierta casi plana con losa de dentículos, alero de terracota y tres remates en forma de corona; galería continua de arcos;
// parapeto de sillería con bloques macizos y la inscripción en el centro; cinco vanos entre pilares de piedra, con grandes
// ventanales de carpintería dorada, balcón corrido de hierro negro y cuatro banderas colgadas de los pilares; y una planta baja
// con puertas de cristal, paños de ladrillo, la escultura de sillares y macetones con arbustos. La usuaria pidió acortarla: se
// quitaron los dos vanos de ladrillo de los extremos y los pilares de los lados rematan la fachada.
// Ocupa 19 × 9 teselas (304 × 144 px); la puerta cae en el centro del lienzo (ver `doorCol` en `shared.js`).
import { rect } from '../pixelKit.js'
import { finish, newSprite } from './shared.js'
import {
  archGallery,
  brickWall,
  clayBeam,
  crownFinial,
  eave,
  glassDoors,
  glassWall,
  hangingFlag,
  inscription,
  parapet,
  pier,
  plinth,
  railing,
  roofCap,
  shrubPlanter,
  stoneStack,
} from './ayuntamientoParts.js'

const WIDTH = 304
const HEIGHT = 144
const CENTER = WIDTH / 2
// Borde izquierdo de la fachada en el lienzo (el primer pilar). `world.js` lo usa para dejar las columnas del templo pegadas.
export const FACADE_LEFT = 4
// Filas de cada franja, de arriba abajo.
const ROW = { cap: 17, eaveBottom: 40, gallery: 27, parapet: 40, body: 64, glass: 70, rail: 87, slab: 95, lintel: 101, door: 104, ground: 136 }
// Pilares (borde izquierdo, 8 px de ancho) y los cinco vanos que quedan entre ellos: el de la escultura, las tres puertas (la
// central es la entrada) y el del friso de cristal. Los vanos miden lo mismo que antes de acortar la fachada.
const PIER_W = 8
const PIERS = [4, 60, 116, 180, 236, 292]
const BAYS = PIERS.slice(0, -1).map((x, i) => ({ x: x + PIER_W, w: PIERS[i + 1] - x - PIER_W }))
const [BAY_B, BAY_C, BAY_D, BAY_E, BAY_F] = BAYS
// Las banderas cuelgan de los cuatro pilares centrales: Córdoba, España, Andalucía y la Unión Europea, como en la lámina.
const FLAGS = [
  { pier: 1, stripes: ['#8a1f3c'], badge: '#f2c64a' },
  { pier: 2, stripes: ['#c8102e', '#f6c445', '#f6c445', '#c8102e'], badge: '#a8741c' },
  { pier: 3, stripes: ['#2f8f4e', '#f6f0e0', '#2f8f4e'], badge: '#c8961e' },
  { pier: 4, stripes: ['#2a4fa8'], stars: true },
]

// Cubierta: losa con dentículos, alero de terracota con el vuelo inclinado a los lados, galería de arcos y los tres remates. Con la
// fachada más corta, la galería pasa de catorce a once arcos y el alero se ajusta al nuevo ancho.
const ARCHES = 11
function roof(g) {
  const galleryW = ARCHES * 18 + 4
  const galleryX = CENTER - galleryW / 2
  archGallery(g, { x: galleryX, top: ROW.gallery, bottom: ROW.parapet + 6, count: ARCHES, archW: 14, gap: 4 })
  eave(g, { capLeft: 34, capRight: WIDTH - 34, innerLeft: galleryX, innerRight: galleryX + galleryW, top: ROW.cap + 6, bottom: ROW.eaveBottom })
  roofCap(g, 34, WIDTH - 68, ROW.cap)
  ;[CENTER - 56, CENTER, CENTER + 56].forEach((cx) => crownFinial(g, cx, ROW.cap + 1))
}

function crown(g) {
  const blockW = 20
  const blocks = PIERS.map((x) => Math.min(WIDTH - 2 - blockW, Math.max(2, x + PIER_W / 2 - blockW / 2)))
  parapet(g, { x: 2, w: WIDTH - 4, top: ROW.parapet, bottom: ROW.body, blocks, blockW })
  inscription(g, CENTER, ROW.body - 12, 184)
}

// Piso de arriba: dintel de terracota, ventanal, barandilla y losa del balcón en cada vano.
function upperFloor(s) {
  const { g } = s
  BAYS.forEach(({ x, w }) => {
    clayBeam(g, x, ROW.body + 1, w, 4)
    glassWall(s, x + 1, ROW.glass, w - 2, ROW.rail - ROW.glass + 1)
    // Tras los barrotes se ve el cristal en sombra, sin luz propia: así la capa de la noche no tapa la barandilla.
    rect(g, x + 1, ROW.rail + 1, w - 2, ROW.slab - ROW.rail - 1, '#7fbccc')
    railing(g, x, ROW.rail, w)
    clayBeam(g, x, ROW.slab, w, 5)
    clayBeam(g, x, ROW.lintel, w, 3)
  })
}

// Planta baja, de izquierda a derecha: cristal y la escultura de sillares, tres vanos de puertas (la central es la entrada) y
// el vano de la derecha con ladrillo y un friso de cristal encima. Sin el cartel azul de la foto real.
function groundFloor(s) {
  const { g } = s
  const doorH = ROW.ground - ROW.door
  const half = Math.floor(BAY_B.w / 2)
  glassWall(s, BAY_B.x + 1, ROW.door, half - 1, doorH, { pane: 7 })
  brickWall(g, BAY_B.x + half, ROW.door, BAY_B.w - half, doorH)
  stoneStack(g, BAY_B.x + half + 10, ROW.ground)
  ;[BAY_C, BAY_D, BAY_E].forEach(({ x, w }) => {
    glassWall(s, x + 1, ROW.door, w - 2, doorH, { pane: 8, transom: 0.25 })
    glassDoors(s, x + Math.floor(w / 2) - 12, 24, ROW.door + 4, ROW.ground)
  })
  glassWall(s, BAY_F.x + 1, ROW.door, BAY_F.w - 2, 8, { trees: false, transom: 1 })
  brickWall(g, BAY_F.x, ROW.door + 8, BAY_F.w, doorH - 8)
}

function piersAndFlags(g) {
  PIERS.forEach((x) => pier(g, x, ROW.body, ROW.ground, PIER_W))
  FLAGS.forEach(({ pier: i, ...flag }) => hangingFlag(g, PIERS[i] + 1, ROW.glass + 2, flag))
}

export function ayuntamientoSprite() {
  const s = newSprite(WIDTH, HEIGHT)
  const { g } = s
  roof(g)
  crown(g)
  upperFloor(s)
  groundFloor(s)
  piersAndFlags(g)
  plinth(g, 3, WIDTH - 6, ROW.ground, HEIGHT)
  ;[PIERS[0] + 4, PIERS[2] + 4, PIERS[4] + 4, PIERS[5] + 4].forEach((cx) => shrubPlanter(g, cx, ROW.ground + 1))
  s.doorCol = CENTER
  return finish(s)
}
