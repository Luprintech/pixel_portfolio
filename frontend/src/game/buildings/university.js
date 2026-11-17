// Universidad de Burgos (Facultad de Educación) dibujada en píxeles, copiando la fachada que aportó la usuaria: bloque de
// sillería con dos alas de ventanas, logias a los lados de la torre redonda del centro, rótulo con el escudo, zócalo
// adelantado con los ventanales grandes, portada con marquesina y banderas, escalinata con su pasamanos central y la rampa
// con barandilla a la izquierda. Conserva las medidas del PNG (240×119) y la geometría de `ubuLayout.js`, de donde salen
// los cuerpos sólidos, la rampa y la zona de `E`: lo que se ve tiene que coincidir con lo que se pisa.
//
// Son dos capas, como con el PNG: el edificio y, aparte, las barandillas de la rampa y el pasamanos de la escalinata, que
// van por delante de quien sube.
import { dot, hash2, makeCanvas, outline, rect } from '../pixelKit.js'
import { ROUNDED_GLYPHS, drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { UBU_BACK_ROW, UBU_DOOR_COL, UBU_DOOR_ZONE, UBU_FACADE, UBU_RAMP, rampFeet, ubuBodies } from './ubuLayout.js'

const UBU_CANVAS_H = 128
const UBU_TOP = UBU_CANVAS_H - UBU_FACADE.h
const shiftDown = (r) => ({ ...r, y: r.y + UBU_TOP })

// Piedra arenisca del PNG, de la sombra honda a la luz. La paleta del valle no tiene este tono.
const SAND = ['#c9a27c', '#edc293', '#f5ca9b', '#fad3a8', '#fddeb9']
const DARK = '#3a281e'
const DEEP = '#69503c'
const FRAME = '#222021'
const GLASS = ['#1f2c3c', '#264360', '#3c6a90']
const STEP = ['#a48e88', '#d9cbc4', '#fff2e2']
const COPING = '#e6e3d9'
const METAL = ['#4d4543', '#8a8f96', '#c8ccd2']
const CANOPY = '#2a1f1c'
const HERALD = { k: '#281e28', b: '#2a48a0', w: '#f0ece2', y: '#ecba28', r: '#c42824' }

// Escudo de la universidad: corona dorada, cuartel azul con la cruz y cuartel rojo con el castillo.
const SHIELD = ['..y.y.y..', '.yyyyyyy.', '.yrryrry.', 'kkkkkkkkk', 'kbbbwbbbk', 'kbbwwwbbk', 'kbbbwbbbk', 'kkkkkkkkk', 'krrryrrrk', 'kryyyyyrk', 'kryryryrk', '.kryyyrk.', '..krrrk..', '...kkk...']

// Ventanas de las alas, por planta: columna izquierda y ancho. Las de las plantas bajas que caen tras el zócalo se tapan al
// dibujarlo, como en la ilustración.
const WING_UPPER = [[5, 19], [27, 19], [49, 18], [172, 19], [194, 18], [216, 18]]
const WING_LOWER = [[5, 19], [27, 19], [194, 18], [216, 18]]
const PODIUM_WINDOWS = [[37, 23], [65, 24], [151, 23], [180, 23]]

// Sillería: hiladas de cinco filas con la junta abajo, llagas a tresbolillo cada doce píxeles y alguna pieza más clara.
function ashlar(g, x, y, w, h, light = 3) {
  rect(g, x, y, w, h, SAND[light])
  for (let py = y; py < y + h; py++) {
    const course = Math.floor(py / 5)
    if (py % 5 === 4) {
      rect(g, x, py, w, 1, SAND[light - 1])
      continue
    }
    const shift = course % 2 ? 6 : 0
    for (let jx = x - ((x - shift) % 12 + 12) % 12; jx < x + w; jx += 12) {
      if (jx >= x) dot(g, jx, py, SAND[light - 1])
      if (py % 5 === 0 && hash2(jx, course, 7) > 0.7) rect(g, Math.max(x, jx + 1), py, Math.min(11, x + w - jx - 1), 1, SAND[Math.min(4, light + 1)])
    }
  }
}

// Ventana doble: marco oscuro, dos hojas con travesaño, cristal azul con un reflejo y el alféizar claro debajo.
function windowPair(g, lit, x, y, w, h) {
  rect(g, x, y, w, h, FRAME)
  const pane = Math.floor((w - 3) / 2)
  ;[x + 1, x + w - 1 - pane].forEach((px) => {
    rect(g, px, y + 1, pane, h - 2, GLASS[1])
    rect(g, px, y + 1, pane, 1, GLASS[0])
    rect(g, px, y + Math.floor(h / 2), pane, 1, FRAME)
    for (let i = 0; i < Math.min(pane, h - 3); i++) dot(g, px + pane - 2 - i, y + 2 + i, GLASS[2])
    lit.push({ x: px, y: y + 1, w: pane, h: h - 2, holes: [{ x: 0, y: Math.floor(h / 2) - 1, w: pane, h: 1 }] })
  })
  rect(g, x, y + h, w, 1, SAND[4])
}

// Logia: hueco retranqueado bajo una viga clara, con el fondo en sombra, la pared lateral en escorzo hacia la torre, el
// antepecho del balcón saliendo y dos ventanas al fondo. `side` es -1 si la pared en escorzo queda a la derecha (logia
// izquierda) y 1 si queda a la izquierda.
function loggia(g, lit, x, side) {
  const w = 25
  rect(g, x, 13, w, 2, SAND[4])
  rect(g, x, 15, w, 2, DEEP)
  rect(g, x, 17, w, 30, SAND[1])
  for (let i = 0; i < 7; i++) {
    const col = side < 0 ? x + w - 7 + i : x + 6 - i
    rect(g, col, 17, 1, 30, i < 3 ? SAND[2] : SAND[0])
  }
  const winX = x + 6
  windowPair(g, lit, winX, 24, 13, 6)
  const boxX = side < 0 ? x : x + 7
  rect(g, boxX, 31, 18, 7, SAND[3])
  rect(g, boxX, 31, 18, 1, SAND[4])
  rect(g, side < 0 ? boxX + 17 : boxX, 31, 1, 7, SAND[1])
  rect(g, boxX, 38, 18, 2, DARK)
  windowPair(g, lit, winX, 40, 13, 5)
  rect(g, x, 46, w, 1, SAND[4])
  rect(g, x, 47, w, 1, DEEP)
}

// Mitad del ancho del mirador redondo en cada fila: la tapa se abre en curva, el fuste es recto y el fondo se recoge.
const ORIEL_CX = 119.5
function orielHalf(y) {
  if (y < 17) return 10 + (y - 12) * 2
  if (y <= 40) return 19
  return 19 - (y - 40) * 1.6
}

// Torre del centro: el remate que asoma sobre la cubierta y, debajo, el mirador redondo que sale del machón, con luz a
// la izquierda, sombra a la derecha, contorno oscuro arriba y abajo y tres ventanas (la del frente doble, las de los lados
// en escorzo).
function tower(g, lit) {
  const cap = [[118, 4], [116, 8], [114, 12], [111, 17], [110, 20]]
  cap.forEach(([x, w], y) => rect(g, x, y, w, 1, y < 2 ? SAND[4] : SAND[3]))
  rect(g, 110, 5, 20, 8, SAND[3])
  rect(g, 110, 5, 6, 8, SAND[4])
  rect(g, 126, 5, 4, 8, SAND[1])
  rect(g, 96, 5, 1, 45, SAND[1])
  rect(g, 143, 5, 1, 45, SAND[1])
  for (let y = 12; y <= 48; y++) {
    const hw = Math.round(orielHalf(y))
    const left = Math.round(ORIEL_CX - hw)
    const right = Math.round(ORIEL_CX + hw)
    for (let x = left; x <= right; x++) {
      // Por debajo de la fila 42 se ve el vientre del mirador, en sombra.
      if (y >= 42) {
        dot(g, x, y, y >= 46 ? DARK : DEEP)
        continue
      }
      const t = (x - ORIEL_CX) / hw
      const tone = t < -0.7 ? 3 : t < -0.1 ? 4 : t < 0.35 ? 3 : t < 0.7 ? 1 : 0
      dot(g, x, y, y % 5 === 4 && tone > 0 ? SAND[tone - 1] : SAND[tone])
    }
    dot(g, left, y, DARK)
    dot(g, right, y, DARK)
    if (y === 41) rect(g, left + 1, y, right - left - 1, 1, SAND[4])
  }
  rect(g, 110, 12, 20, 1, DARK)
  rect(g, 111, 22, 18, 13, FRAME)
  ;[[112, 7], [122, 6]].forEach(([px, pw]) => {
    rect(g, px, 23, pw, 11, GLASS[1])
    rect(g, px, 23, pw, 1, GLASS[0])
    for (let i = 0; i < 5; i++) dot(g, px + pw - 2 - i, 25 + i, GLASS[2])
    lit.push({ x: px, y: 23, w: pw, h: 11, holes: [] })
  })
  rect(g, 104, 24, 5, 12, FRAME)
  rect(g, 105, 25, 3, 10, GLASS[0])
  rect(g, 131, 25, 4, 11, FRAME)
  rect(g, 132, 26, 2, 9, GLASS[0])
  rect(g, 119, 35, 2, 2, DARK)
}

// Placa del rótulo con el escudo y las dos líneas. Los espacios entre palabras miden dos píxeles, como en el PNG.
function sign(g) {
  rect(g, 1, 42, 94, 17, SAND[2])
  SHIELD.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) if (row[dx] !== '.') dot(g, 1 + dx, 43 + dy, HERALD[row[dx]])
  })
  ;[['UNIVERSIDAD', 12], ['DE', 58], ['BURGOS', 68]].forEach(([word, x]) => drawText(g, x, 45, word, DARK, ROUNDED_GLYPHS))
  ;[['FACULTAD', 12], ['DE', 46], ['EDUCACION', 56]].forEach(([word, x]) => drawText(g, x, 52, word, DARK, ROUNDED_GLYPHS))
  dot(g, 86, 51, DARK)
}

// Portada: paredes laterales en escorzo, arco oscuro que baja desde las logias, marquesina en cuenco con las banderas
// delante, dintel claro y la puerta acristalada de dos hojas con sus travesaños.
function entrance(g, lit) {
  rect(g, 96, 50, 49, 50, SAND[2])
  for (let i = 0; i < 12; i++) {
    rect(g, 96 + i, 54 + i, 1, 46 - i, i % 4 === 3 ? SAND[0] : SAND[1])
    rect(g, 144 - i, 54 + i, 1, 46 - i, i % 4 === 3 ? SAND[0] : SAND[1])
  }
  for (let i = 0; i <= 8; i++) {
    const y = 50 + Math.round(6 * Math.sin((Math.PI / 2) * (i / 8)))
    rect(g, 95 + i, y, 1, 2, DARK)
    rect(g, 144 - i, y, 1, 2, DARK)
  }
  for (let x = 103; x <= 136; x++) {
    const sag = Math.round(2 * Math.sin((Math.PI * (x - 103)) / 33))
    rect(g, x, 55, 1, 6 + sag, CANOPY)
  }
  rect(g, 103, 55, 34, 1, DEEP)
  flags(g)
  ashlar(g, 107, 63, 26, 8, 3)
  rect(g, 107, 63, 26, 1, DEEP)
  rect(g, 108, 71, 24, 30, FRAME)
  ;[[110, 9], [121, 9]].forEach(([px, pw]) => {
    rect(g, px, 72, pw, 28, GLASS[0])
    rect(g, px, 72, pw, 9, GLASS[1])
    ;[81, 90].forEach((y) => rect(g, px, y, pw, 1, FRAME))
    for (let i = 0; i < 6; i++) dot(g, px + pw - 2 - i, 73 + i, GLASS[2])
    lit.push({ x: px, y: 72, w: pw, h: 28, holes: [81, 90].map((y) => ({ x: 0, y: y - 72, w: pw, h: 1 })) })
  })
  rect(g, 119, 72, 2, 28, FRAME)
}

// Banderas sobre la marquesina: España, Castilla y León y la de la universidad, cayendo de sus astas.
function flags(g) {
  const set = [
    [111, ['#c42824', '#ffe84e', '#ffe84e', '#c42824']],
    [119, ['#4f0e08', '#c45c56', '#c45c56', '#4f0e08']],
    [127, ['#48142e', '#bb6550', '#48142e']],
  ]
  set.forEach(([poleX, colors]) => {
    rect(g, poleX, 51, 1, 11, METAL[0])
    dot(g, poleX, 50, METAL[2])
    for (let row = 0; row < 9; row++) colors.forEach((color, i) => dot(g, poleX + 1 + i - Math.floor(row / 4), 52 + row, color))
  })
}

// Zócalo adelantado: sillería más clara, albardilla gris, caras laterales en sombra y los cuatro ventanales.
function podium(g, lit) {
  ;[[32, 64], [145, 63]].forEach(([x, w]) => {
    ashlar(g, x, 60, w, 54, 3)
    rect(g, x, 60, w, 1, SAND[4])
    rect(g, x, 61, w, 1, COPING)
    rect(g, x, 62, w, 1, SAND[1])
  })
  for (let y = 62; y < 114; y++) {
    const left = 32 - Math.min(6, Math.floor((y - 62) / 6))
    rect(g, left, y, 32 - left, 1, y % 5 === 4 ? SAND[0] : SAND[1])
  }
  rect(g, 208, 60, 4, 54, SAND[1])
  rect(g, 211, 60, 1, 54, SAND[0])
  PODIUM_WINDOWS.forEach(([x, w]) => windowPair(g, lit, x, 85, w, 12))
}

// Farol de pared: brazo en diagonal y la pantalla clara.
function lamp(g, x, y) {
  for (let i = 0; i < 4; i++) dot(g, x + i, y + 3 - i, METAL[0])
  rect(g, x + 3, y - 2, 3, 2, METAL[2])
  rect(g, x + 3, y, 3, 1, METAL[0])
}

// Rellano y escalinata: huella clara y tabica gris cada dos filas, con los bordes de `ubuLayout.js`.
function stairs(g) {
  rect(g, 97, 98, 54, 6, STEP[1])
  rect(g, 97, 98, 54, 1, STEP[2])
  rect(g, 97, 103, 54, 1, STEP[0])
  for (let y = 104; y <= 118; y++) {
    const left = Math.round(95 - (y - 104) * 2)
    const right = Math.round(150 + (y - 104) * 1.3)
    rect(g, left, y, right - left + 1, 1, (y - 104) % 2 ? STEP[0] : STEP[2])
    dot(g, left, y, STEP[0])
    dot(g, right, y, STEP[0])
  }
}

// Rampa: el piso claro sobre la línea de los pies y, debajo, su muro de piedra hasta el zócalo.
function ramp(g) {
  for (let x = 0; x <= 97; x++) {
    const feet = Math.round(rampFeet(x))
    rect(g, x, feet - 1, 1, 1, STEP[2])
    rect(g, x, feet, 1, 1, STEP[1])
    rect(g, x, feet + 1, 1, 114 - feet - 1, x % 12 === 0 ? SAND[0] : SAND[1])
  }
}

// Zócalo de piedra a ras de suelo, por delante de toda la fachada.
function plinth(g) {
  rect(g, 5, 114, 204, 3, SAND[1])
  rect(g, 5, 114, 204, 1, SAND[2])
  rect(g, 5, 116, 204, 1, SAND[0])
}

function backLayer() {
  const canvas = makeCanvas(UBU_FACADE.w, UBU_CANVAS_H)
  const g = canvas.getContext('2d')
  const lit = []
  g.translate(0, UBU_TOP)
  ashlar(g, 0, 5, 240, 109)
  rect(g, 2, 5, 236, 1, SAND[4])
  rect(g, 0, 6, 240, 1, SAND[1])
  ;[15, 34].forEach((y) => WING_UPPER.forEach(([x, w]) => windowPair(g, lit, x, y, w, y === 34 && x < 100 ? 8 : 10)))
  ;[65, 90].forEach((y) => WING_LOWER.forEach(([x, w]) => windowPair(g, lit, x, y, w, y === 90 ? 9 : 10)))
  loggia(g, lit, 71, -1)
  loggia(g, lit, 144, 1)
  tower(g, lit)
  sign(g)
  entrance(g, lit)
  podium(g, lit)
  ;[[60, 60], [170, 60], [212, 56]].forEach(([x, y]) => lamp(g, x, y))
  ramp(g)
  plinth(g)
  stairs(g)
  g.setTransform(1, 0, 0, 1, 0, 0)
  // Contorno de color, como el resto de edificios del valle.
  outline(canvas, 0.5)
  return { canvas, lit }
}

// Barandilla de la rampa (pasamanos, barra media y postes) y pasamanos central de la escalinata: van por delante de quien sube.
function frontLayer() {
  const canvas = makeCanvas(UBU_FACADE.w, UBU_CANVAS_H)
  const g = canvas.getContext('2d')
  g.translate(0, UBU_TOP)
  for (let x = 5; x <= 93; x++) {
    const top = Math.round(rampFeet(x) - 7)
    dot(g, x, top, METAL[2])
    dot(g, x, top + 1, METAL[0])
    dot(g, x, top + 4, METAL[1])
  }
  for (let x = 6; x <= 93; x += 11) {
    const top = Math.round(rampFeet(x) - 7)
    rect(g, x, top, 2, 7, METAL[0])
    dot(g, x, top, METAL[2])
  }
  rect(g, 119, 97, 3, 22, METAL[1])
  rect(g, 119, 97, 1, 22, METAL[2])
  rect(g, 121, 97, 1, 22, METAL[0])
  rect(g, 118, 97, 5, 1, METAL[0])
  g.setTransform(1, 0, 0, 1, 0, 0)
  return canvas
}

export function universitySprite() {
  const { canvas, lit } = backLayer()
  return {
    canvas,
    overlay: { x: 0, y: 0, canvas: frontLayer() },
    doorCol: UBU_DOOR_COL,
    // De noche se encienden las ventanas, la torre y la puerta.
    windows: lit.flatMap(({ x, y, w, h, holes }) => litPane(x, y + UBU_TOP, w, h, holes)),
    bodies: ubuBodies().map(shiftDown),
    doorZone: shiftDown(UBU_DOOR_ZONE),
    ramp: { ...UBU_RAMP, y0: UBU_RAMP.y0 + UBU_TOP, y1: UBU_RAMP.y1 + UBU_TOP },
    depthRows: { back: UBU_TOP + UBU_BACK_ROW, front: UBU_CANVAS_H - 1 },
    // Las banderas moradas no son flores de cerezo: sin esto el invierno las teñiría de escarcha.
    painted: true,
  }
}
