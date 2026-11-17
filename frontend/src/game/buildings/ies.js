// IES Gran Capitán dibujado en píxeles, copiando la fachada que aportó la usuaria: tejado de teja con sus dos chimeneas, dos
// plantas de ladrillo con pilares de hormigón y ventanas con las persianas a distintas alturas, el aparato de aire, el aula
// anexa a la izquierda, el cartel de la Junta de Andalucía con el nombre sobre la entrada acristalada, el aparcabicis con
// tres bicicletas y la acera. Conserva las medidas del PNG (208×89), la columna de la puerta y los cuerpos sólidos.
import { PAL } from '../palette.js'
import { dot, hash2, rect } from '../pixelKit.js'
import { ROUNDED_GLYPHS, drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { finish, newSprite } from './shared.js'

export const IES_FACADE = { w: 208, h: 89 }
const IES_CANVAS_H = 96
const IES_TOP = IES_CANVAS_H - IES_FACADE.h
// Centro de la entrada acristalada, bajo el cartel.
export const IES_DOOR_COL = 111
// Cuerpos sólidos en píxeles de la fachada: el muro (los pies llegan a su base, fila 79), el aula anexa (sobresale hasta la fila 83)
// y el aparcabicis, que llega hasta la acera para que nadie quede detrás de las bicis, tapado por la pared.
export const IES_BODIES = [
  { x: 70, y: 0, w: 138, h: 76 },
  { x: 0, y: 0, w: 72, h: 80 },
  { x: 148, y: 76, w: 60, h: 8 },
]

// Colores sacados del PNG: el ladrillo naranja, el hormigón de los pilares y el verde de la Junta no están en la paleta.
const TILE = ['#863533', '#d46d43', '#ee7750']
const BRICK = ['#a15638', '#d46d43', '#dc7944', '#e88648']
const CONCRETE = ['#9a9180', '#b49b8a', '#c0a593', '#d7c4af']
const BLIND = ['#d7c4ad', '#f6ebda']
const GLASS = ['#1a2837', '#304d71', '#4a6f96']
const FRAME = '#35353b'
const DARK = '#392724'
const INK = '#090708'
const JUNTA = '#008040'
const BOARD = '#f4f0e6'
const WALK = ['#35353b', '#715f5c', '#b39991', '#cfb4a4']

// Pilares de hormigón de las plantas altas; los dos de la derecha bajan hasta la acera.
const PILLARS = [5, 31, 58, 88, 117, 145, 173, 199]
// Vanos entre pilares: columna izquierda y ancho.
const BAYS = [[9, 22], [35, 23], [62, 26], [92, 25], [121, 24], [149, 24], [176, 23]]
// Símbolo de la Junta de Andalucía: '#' en verde, '.' en blanco.
const JUNTA_MARK = ['####....####', '##..####..##', '#.##....##.#', '###.####.###', '#####..#####', '############', '##........##', '############', '############']

// Tejado a dos aguas visto de frente: teja con sus juntas, alero oscuro, frente naranja y la viga de debajo.
function roof(g) {
  rect(g, 97, 0, 5, 3, DARK)
  rect(g, 108, 0, 6, 3, DARK)
  rect(g, 98, 0, 3, 1, TILE[0])
  rect(g, 109, 0, 4, 1, TILE[0])
  for (let r = 0; r < 3; r++) {
    const x0 = 8 - r * 2
    const w = 192 + r * 4
    rect(g, x0, 3 + r, w, 1, r === 0 ? TILE[1] : TILE[2])
    for (let tx = x0 + (r % 2) * 3; tx < x0 + w; tx += 6) if (r > 0) dot(g, tx, 3 + r, TILE[0])
  }
  rect(g, 3, 6, 202, 1, DARK)
  rect(g, 3, 7, 202, 1, BRICK[3])
  rect(g, 8, 8, 196, 1, DARK)
}

// Paño de ladrillo: hiladas de cuatro filas con la llaga abajo y juntas verticales a tresbolillo.
function brick(g, x, y, w, h) {
  rect(g, x, y, w, h, BRICK[3])
  for (let py = y; py < y + h; py++) {
    if (py % 4 === 0) {
      rect(g, x, py, w, 1, BRICK[1])
      continue
    }
    const shift = Math.floor(py / 4) % 2 ? 4 : 0
    for (let jx = x - ((x - shift) % 8 + 8) % 8; jx < x + w; jx += 8) if (jx >= x && py % 4 === 2) dot(g, jx, py, BRICK[2])
  }
}

// Persiana enrollable del PNG: tela beige con lamas apenas marcadas y la barra blanca de abajo.
const SHADE = ['#e3d3bf', '#ece0cc', '#fbf0db']
const MULLION = '#f6ebda'
const GLASS_EDGE = '#121925'

// Ventanal de un vano, como en la ilustración: dintel, cajón gris de la persiana, hojas separadas por montantes blancos con la
// persiana bajada a distinta altura en cada una (en alguna, del todo), travesaño blanco, la franja baja de cristal, el
// alféizar y la sombra en el ladrillo. Devuelve el cristal que queda a la vista para encenderlo de noche.
function bayWindow(g, lit, x, w, top) {
  rect(g, x, top, w, 1, BRICK[0])
  rect(g, x, top + 1, w, 1, BRICK[3])
  rect(g, x, top + 2, w, 2, CONCRETE[1])
  rect(g, x, top + 3, w, 1, CONCRETE[0])
  rect(g, x, top + 4, w, 11, MULLION)
  rect(g, x, top + 4, 1, 11, GLASS_EDGE)
  const panes = Math.max(2, Math.round(w / 8))
  const pw = Math.floor((w - 1 - 2 * (panes - 1)) / panes)
  for (let i = 0; i < panes; i++) {
    const px = x + 1 + i * (pw + 2)
    const roll = hash2(px, top, 11)
    // Altura de la persiana en filas (de 0 a 8): la mayoría a media altura, alguna recogida y alguna bajada del todo.
    const blind = roll > 0.88 ? 8 : roll < 0.15 ? 0 : 1 + Math.floor(roll * 5)
    rect(g, px, top + 4, pw, 8, GLASS[1])
    rect(g, px, top + 4, 1, 8, GLASS_EDGE)
    for (let k = 0; k < Math.min(pw - 1, 4); k++) dot(g, px + pw - 1 - k, top + 6 + k, GLASS[2])
    for (let r = 0; r < blind; r++) rect(g, px, top + 4 + r, pw, 1, r % 2 ? SHADE[1] : SHADE[0])
    if (blind < 8) {
      rect(g, px, top + 4 + blind, pw, 1, SHADE[2])
      if (blind < 7) rect(g, px, top + 5 + blind, pw, 1, GLASS[0])
      if (blind < 6) lit.push({ x: px, y: top + 6 + blind, w: pw, h: 6 - blind })
    }
    rect(g, px, top + 13, pw, 1, GLASS[0])
    rect(g, px, top + 14, pw, 1, GLASS[1])
    dot(g, px, top + 14, GLASS_EDGE)
    lit.push({ x: px, y: top + 13, w: pw, h: 2 })
  }
  rect(g, x, top + 15, w, 1, SHADE[2])
  rect(g, x, top + 16, w, 1, BRICK[0])
}

function pillar(g, x, bottom) {
  rect(g, x, 9, 4, bottom - 9, CONCRETE[2])
  rect(g, x, 9, 1, bottom - 9, CONCRETE[3])
  rect(g, x + 3, 9, 1, bottom - 9, CONCRETE[1])
}

// Aparato de aire acondicionado colgado bajo la primera ventana del segundo vano.
function airConditioner(g) {
  rect(g, 37, 26, 8, 6, BLIND[1])
  rect(g, 37, 31, 8, 1, CONCRETE[1])
  rect(g, 39, 27, 3, 3, CONCRETE[0])
  dot(g, 40, 28, BLIND[1])
}

// Aula anexa: albardilla, ladrillo y dos ventanas con la persiana recogida arriba y cuatro hojas.
function annex(g, lit) {
  brick(g, 3, 50, 69, 34)
  rect(g, 6, 50, 66, 1, DARK)
  rect(g, 4, 51, 68, 1, CONCRETE[3])
  rect(g, 2, 52, 69, 1, CONCRETE[1])
  rect(g, 3, 53, 68, 1, BRICK[0])
  ;[11, 43].forEach((x) => {
    rect(g, x - 1, 65, 23, 14, BLIND[1])
    rect(g, x, 66, 21, 12, FRAME)
    rect(g, x + 1, 67, 19, 2, BLIND[1])
    for (let i = 0; i < 4; i++) {
      const px = x + 1 + i * 5
      rect(g, px, 69, 4, 8, GLASS[1])
      dot(g, px + 3, 70, GLASS[2])
      dot(g, px + 2, 71, GLASS[2])
      lit.push({ x: px, y: 69, w: 4, h: 8 })
    }
    rect(g, x, 78, 21, 1, BLIND[1])
  })
  rect(g, 3, 79, 69, 1, BRICK[0])
  rect(g, 72, 60, 5, 20, BRICK[0])
}

// Cartel sobre la entrada: marco negro, el símbolo de la Junta en verde y el nombre con su tilde.
function sign(g) {
  rect(g, 72, 49, 81, 11, INK)
  JUNTA_MARK.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) dot(g, 73 + dx, 50 + dy, row[dx] === '#' ? JUNTA : BOARD)
  })
  rect(g, 85, 50, 67, 9, BOARD)
  drawText(g, 87, 52, 'IES GRAN CAPITAN', INK, ROUNDED_GLYPHS)
  dot(g, 145, 50, INK)
  dot(g, 144, 51, INK)
}

// Entrada acristalada: cerco oscuro, montantes y travesaños, reflejos y los tiradores de las puertas centrales.
function entrance(g, lit) {
  rect(g, 77, 60, 63, 20, DARK)
  rect(g, 82, 60, 53, 19, GLASS[0])
  ;[88, 94, 101, 110, 118, 127].forEach((x) => rect(g, x, 60, 2, 19, FRAME))
  ;[63, 72, 77].forEach((y) => rect(g, 82, y, 53, 1, FRAME))
  for (let i = 0; i < 6; i++) {
    dot(g, 86 - i, 65 + i, GLASS[1])
    dot(g, 133 - i, 65 + i, GLASS[1])
  }
  rect(g, 108, 67, 1, 3, CONCRETE[1])
  rect(g, 113, 67, 1, 3, CONCRETE[1])
  lit.push({ x: 82, y: 64, w: 53, h: 8, holes: [88, 94, 101, 110, 118, 127].map((x) => ({ x: x - 82, y: 0, w: 2, h: 8 })) })
  rect(g, 140, 64, 3, 16, TILE[0])
}

// Bicicleta de perfil: dos ruedas, cuadro del color dado, sillín y manillar.
function bike(g, x, color) {
  const tire = '#2b2523'
  ;[x + 4, x + 13].forEach((cx) => {
    for (let a = 0; a < 24; a++) {
      const ang = (Math.PI * 2 * a) / 24
      dot(g, Math.round(cx + 4 * Math.cos(ang)), Math.round(75 + 4 * Math.sin(ang)), tire)
    }
    dot(g, cx, 75, CONCRETE[0])
  })
  for (let i = 0; i <= 5; i++) rect(g, x + 4 + i, 74 - i, 1, 2, color)
  for (let i = 0; i <= 4; i++) rect(g, x + 9 + i, 70 + i, 1, 2, color)
  rect(g, x + 8, 69, 6, 2, color)
  rect(g, x + 7, 67, 4, 1, tire)
  rect(g, x + 13, 67, 1, 2, tire)
  rect(g, x + 12, 66, 4, 1, tire)
}

// Aparcabicis: la barra con sus arcos y las tres bicis aparcadas.
function bikeRack(g) {
  rect(g, 149, 72, 53, 1, CONCRETE[0])
  for (let x = 152; x < 200; x += 12) {
    rect(g, x, 71, 1, 8, CONCRETE[1])
    rect(g, x + 7, 71, 1, 8, CONCRETE[1])
    rect(g, x, 70, 8, 1, CONCRETE[1])
  }
  bike(g, 149, '#3a6fc4')
  bike(g, 167, PAL.tile)
  bike(g, 184, PAL.saffron)
}

// Acera: baldosas claras con sus juntas, el bordillo y la sombra; bajo el aula anexa empieza cuatro filas más abajo.
function sidewalk(g) {
  rect(g, 72, 80, 135, 7, WALK[2])
  rect(g, 1, 84, 71, 3, WALK[2])
  rect(g, 72, 80, 135, 1, WALK[3])
  rect(g, 1, 84, 71, 1, WALK[3])
  for (let x = 4; x < 206; x += 9) rect(g, x, x < 72 ? 85 : 81, 1, x < 72 ? 2 : 6, WALK[1])
  rect(g, 72, 83, 135, 1, WALK[3])
  rect(g, 1, 87, 206, 1, WALK[1])
  rect(g, 1, 88, 201, 1, WALK[0])
}

export function iesSprite() {
  const s = newSprite(IES_FACADE.w, IES_CANVAS_H)
  const { g } = s
  const lit = []
  // Las piezas trabajan en píxeles de la fachada; el lienzo es más alto y la fachada se apoya abajo.
  g.translate(0, IES_TOP)
  roof(g)
  brick(g, 5, 9, 198, 71)
  BAYS.forEach(([x, w]) => {
    bayWindow(g, lit, x, w, 9)
    bayWindow(g, lit, x, w, 32)
  })
  PILLARS.forEach((x) => pillar(g, x, x === 145 || x === 199 ? 80 : 49))
  airConditioner(g)
  rect(g, 9, 48, 194, 1, BRICK[0])
  annex(g, lit)
  sign(g)
  entrance(g, lit)
  bikeRack(g)
  sidewalk(g)
  g.setTransform(1, 0, 0, 1, 0, 0)
  s.doorCol = IES_DOOR_COL
  // De noche se encienden el cristal que dejan ver las persianas, las ventanas del aula y la entrada.
  lit.forEach(({ x, y, w, h, holes }) => s.windows.push(...litPane(x, y + IES_TOP, w, h, holes)))
  const sprite = finish(s)
  return {
    ...sprite,
    bodies: IES_BODIES.map((b) => ({ ...b, y: b.y + IES_TOP })),
    // Zona de `E` sobre la acera, ante las puertas acristaladas: la viajera llega hasta la base del muro, más arriba que la
    // tesela de puerta. La salida del interior la deja donde pulsó `E`, delante de la puerta.
    doorZone: { x: IES_DOOR_COL - 14, y: IES_TOP + 76, w: 28, h: 18 },
    // Por debajo de la viajera en cuanto pisa la acera.
    depthRows: { back: IES_TOP + 79 },
    // El verde de la Junta no es hierba: sin esto la nieve lo pintaría de blanco.
    painted: true,
  }
}
