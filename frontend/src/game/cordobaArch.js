// Puerta del Puente de Córdoba (el Arco del Triunfo), entrada del valle: una portada de piedra arenisca con cuatro columnas sobre
// pedestales, entablamento con friso, placa de inscripción sobre el hueco y un remate semicircular con el escudo. El dibujo
// ocupa justo el hueco de la valla (7 teselas) y la abertura queda transparente: la viajera pasa por detrás de la imagen y
// el entablamento la tapa de cintura para arriba sin necesitar una capa aparte. Sin lógica de juego.
import { dot, makeCanvas, outline, rect } from './pixelKit.js'
import { SAND, SAND_SHADE } from './buildings/mosqueParts.js'

const [DARK, MID, LIGHT] = SAND
const DEEP = SAND_SHADE
// Juntas de la sillería: translúcidas para que se lean como línea fina sobre cualquier tono de la piedra.
const JOINT = 'rgba(148, 108, 62, 0.4)'
const PLAQUE = ['#7c8196', '#aeb2c2', '#d6d9e4']

const WIDTH = 112
const HEIGHT = 112
const CENTRE = WIDTH / 2
// Abertura central: 32 px, el ancho del camino, y 52 de alto (la viajera mide 34).
const OPENING = { x: 40, w: 32, top: 60 }
// Columnas: x de cada una (7 de ancho). Dos a cada lado, simétricas respecto al centro.
const COLUMNS = [11, 27, 78, 94]
// Nichos con relieve entre los pares de columnas (7 de ancho).
const NICHES = [19, 86]

function wall(g) {
  rect(g, 8, 37, 96, 75, MID)
  for (let row = 0, y = 44; y < HEIGHT; row++, y += 8) {
    rect(g, 8, y, 96, 1, JOINT)
    for (let x = 8 + (row % 2 ? 6 : 0); x < 104; x += 12) rect(g, x, y + 1, 1, 7, JOINT)
  }
  rect(g, 8, 37, 1, 67, LIGHT)
  rect(g, 103, 37, 1, 67, DARK)
  // Zócalo corrido al pie de toda la portada.
  rect(g, 8, 104, 96, 8, DARK)
  rect(g, 8, 104, 96, 1, LIGHT)
}

function niche(g, x) {
  rect(g, x, 46, 7, 38, DARK)
  rect(g, x - 1, 45, 9, 1, LIGHT)
  rect(g, x - 1, 84, 9, 1, LIGHT)
  // Figura en relieve: cabeza, cuerpo y pliegues de la túnica.
  rect(g, x + 2, 50, 3, 3, LIGHT)
  rect(g, x + 1, 54, 5, 14, MID)
  rect(g, x + 1, 54, 1, 14, LIGHT)
  rect(g, x + 2, 68, 3, 12, MID)
  rect(g, x + 3, 70, 1, 9, DARK)
}

// Marco de la abertura: dintel de tres molduras y pilastras a los lados. El hueco se recorta después.
function portal(g) {
  rect(g, 38, 54, 36, 2, LIGHT)
  rect(g, 38, 56, 36, 2, MID)
  rect(g, 38, 58, 36, 2, LIGHT)
  rect(g, 38, 60, 2, 52, LIGHT)
  rect(g, 72, 60, 2, 52, MID)
}

// Placa de inscripción sobre el dintel: marco de piedra, chapa gris azulada y tres renglones de letras.
function plaque(g) {
  rect(g, 41, 39, 30, 14, LIGHT)
  rect(g, 42, 40, 28, 12, DEEP)
  rect(g, 43, 41, 26, 10, PLAQUE[1])
  rect(g, 43, 41, 26, 1, PLAQUE[2])
  rect(g, 43, 50, 26, 1, PLAQUE[0])
  ;[43, 46, 49].forEach((y) => {
    for (let x = 45; x < 67; x += 4) rect(g, x, y, 3, 1, PLAQUE[0])
  })
}

// Recorta la abertura (transparente: se ve el camino) y le da fondo al dintel y a las jambas.
function cutOpening(g) {
  g.clearRect(OPENING.x, OPENING.top, OPENING.w, HEIGHT - OPENING.top)
  rect(g, OPENING.x, OPENING.top, OPENING.w, 2, DARK)
  rect(g, OPENING.x, OPENING.top + 2, 1, HEIGHT - OPENING.top - 2, DARK)
  rect(g, OPENING.x + OPENING.w - 1, OPENING.top + 2, 1, HEIGHT - OPENING.top - 2, MID)
}

function pedestal(g, x) {
  rect(g, x - 3, 94, 13, 2, LIGHT)
  rect(g, x - 2, 96, 11, 16, MID)
  rect(g, x - 2, 96, 1, 16, LIGHT)
  rect(g, x + 7, 96, 2, 16, DARK)
  rect(g, x, 99, 7, 10, JOINT)
}

function column(g, x) {
  // Capitel: ábaco y dos filas de hojas.
  rect(g, x - 2, 37, 11, 2, LIGHT)
  rect(g, x - 2, 39, 11, 1, DARK)
  rect(g, x - 1, 40, 9, 2, MID)
  ;[1, 3, 5].forEach((dx) => dot(g, x + dx, 41, DARK))
  // Fuste con luz a la izquierda, un acanalado y el borde sombreado.
  rect(g, x, 42, 7, 48, LIGHT)
  rect(g, x + 2, 43, 1, 46, MID)
  rect(g, x + 5, 42, 2, 48, MID)
  rect(g, x + 6, 42, 1, 48, DARK)
  // Basa.
  rect(g, x - 1, 90, 9, 3, LIGHT)
  rect(g, x - 1, 92, 9, 1, DARK)
}

// Entablamento corrido: cornisa, friso con sus resaltes y arquitrabe. Sobresale un poco por encima de cada par de columnas.
function entablature(g) {
  ;[6, 70].forEach((x) => rect(g, x, 22, 36, 2, LIGHT))
  rect(g, 3, 24, 106, 3, LIGHT)
  rect(g, 3, 27, 106, 1, DARK)
  rect(g, 4, 28, 104, 6, MID)
  for (let x = 8; x < 104; x += 8) rect(g, x, 30, 4, 2, DARK)
  rect(g, 4, 34, 104, 3, LIGHT)
  rect(g, 4, 37, 104, 1, DEEP)
}

// Semicírculo del remate: aro de piedra, fondo hundido y, encima de todo, un pequeño pináculo.
function pediment(g) {
  const base = 24
  const half = (radius, y) => Math.floor(Math.sqrt(Math.max(0, radius * radius - (base - y - 0.5) ** 2)))
  for (let y = 4; y < base; y++) {
    const outer = half(20, y)
    rect(g, CENTRE - outer, y, outer * 2, 1, LIGHT)
    dot(g, CENTRE + outer - 1, y, DARK)
    const ring = half(18, y)
    if (ring > 0) rect(g, CENTRE - ring, y, ring * 2, 1, MID)
    const inner = half(15, y)
    if (inner > 0) rect(g, CENTRE - inner, y, inner * 2, 1, DARK)
  }
  rect(g, 34, 21, 44, 3, LIGHT)
  // Rampas que bajan desde el semicírculo hasta la cornisa.
  for (let i = 0; i < 9; i++) {
    const h = 5 - Math.floor((i * 5) / 9)
    ;[34 - i, 77 + i].forEach((x) => {
      rect(g, x, 24 - h, 1, h, MID)
      dot(g, x, 24 - h, LIGHT)
    })
  }
  rect(g, CENTRE - 1, 1, 2, 3, MID)
  rect(g, CENTRE - 1, 1, 2, 1, LIGHT)
}

// Escudo en relieve claro sobre el fondo hundido: corona, campo partido y ramas a los lados.
function crest(g) {
  rect(g, CENTRE - 2, 9, 4, 2, LIGHT)
  dot(g, CENTRE - 2, 8, LIGHT)
  dot(g, CENTRE + 1, 8, LIGHT)
  rect(g, CENTRE - 4, 12, 8, 7, LIGHT)
  ;[[1, 19], [2, 20], [3, 21]].forEach(([d, y]) => rect(g, CENTRE - 4 + d, y, 8 - d * 2, 1, LIGHT))
  rect(g, CENTRE - 3, 13, 6, 3, MID)
  rect(g, CENTRE - 3, 16, 6, 4, DARK)
  rect(g, CENTRE - 1, 13, 2, 7, LIGHT)
  ;[[49, 19], [48, 17], [48, 15], [49, 13], [50, 11]].forEach(([x, y]) => {
    dot(g, x, y, LIGHT)
    dot(g, WIDTH - 1 - x, y, LIGHT)
  })
}

export function cordobaArch() {
  const canvas = makeCanvas(WIDTH, HEIGHT)
  const g = canvas.getContext('2d')
  wall(g)
  NICHES.forEach((x) => niche(g, x))
  portal(g)
  plaque(g)
  cutOpening(g)
  COLUMNS.forEach((x) => pedestal(g, x))
  COLUMNS.forEach((x) => column(g, x))
  entablature(g)
  pediment(g)
  crest(g)
  // Cuerpo sólido: las dos alas de la portada, de la valla a las jambas; la abertura (32 px) queda libre.
  const wing = (l, r) => ({ l, t: -12, r, b: -1 })
  return { canvas: outline(canvas, 0.5), body: [wing(-48, -16), wing(16, 48)] }
}
