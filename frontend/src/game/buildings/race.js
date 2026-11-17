// Oficina de RACE dibujada en píxeles, copiando pieza a pieza la fachada que aportó la usuaria: albardilla de piedra,
// friso de ladrillo con su vierteaguas azul, pilares de ladrillo, puerta acristalada de dos hojas a la izquierda con el
// portero en la jamba, y tres ventanales con el cartel azul de la corona y "RACE", luces de techo y plantas dentro,
// alféizar blanco y zócalo de piedra. Conserva las medidas del PNG (176×46, apoyada abajo en un lienzo de tres teselas)
// y la columna de la puerta, que usan la escena y `world.test.js`.
import { PAL, shade } from '../palette.js'
import { dot, hash2, rect } from '../pixelKit.js'
import { drawText } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { finish, newSprite } from './shared.js'

export const RACE_FACADE = { w: 176, h: 46 }
const RACE_CANVAS_H = 48
const TOP = RACE_CANVAS_H - RACE_FACADE.h
// Centro de la puerta acristalada (el montante entre sus dos hojas), en píxeles desde el borde izquierdo de la fachada.
export const RACE_DOOR_COL = 21

// Ladrillo naranja del PNG: llaga, cuerpo, luz y el canto oscuro de los pilares. No hay un naranja así en la paleta.
const BRICK = ['#c26a3e', '#d27b47', '#df8851', '#7a4736']
// Piedra clara de jambas, dintel y zócalo, con sus juntas.
const STONE = ['#c0b0a8', '#d9c8be', '#e7d7ca']
const LINTEL = '#aea5a4'
// Aluminio azulado de vierteaguas, montantes y barras de las puertas.
const ALU = '#86a0c0'
const FRAME = '#363b47'
// Cristal: penumbra baja, cuerpo gris azulado, reflejo y el filo azul del marco interior.
const GLASS = ['#3b4d5e', '#5f656a', '#72899a', '#6b7f9f']
const DOOR_GLASS = ['#344551', '#7290ad']
// Plantas tras el cristal: verdes apagados, con menos saturación de la que la nieve toma por hierba (ver `isGreen`).
const LEAF = ['#46563e', '#56664c']
const NAVY = '#1e2c78'

// Albardilla de piedra que remata el edificio, sobre una línea oscura.
function coping(g) {
  rect(g, 1, 1, 174, 1, STONE[1])
  rect(g, 1, 2, 174, 1, STONE[2])
  rect(g, 1, 3, 174, 1, STONE[0])
  rect(g, 0, 4, 176, 1, BRICK[3])
}

// Paño de ladrillo: hiladas de dos filas con una de llaga, las juntas verticales a tresbolillo y algún ladrillo más claro.
function brick(g, x, y, w, h, seed) {
  rect(g, x, y, w, h, BRICK[1])
  for (let row = 0; row < h; row++) {
    const course = Math.floor((y + row) / 3)
    if ((y + row) % 3 === 2) {
      rect(g, x, y + row, w, 1, BRICK[0])
      continue
    }
    // Llagas verticales sueltas y algún ladrillo con luz: en el PNG el aparejo apenas se marca.
    const shift = course % 2 ? 3 : 0
    for (let bx = x - 6 + ((shift - x) % 6 + 6) % 6; bx < x + w; bx += 6) {
      if (bx >= x && hash2(bx, course, seed + 1) > 0.55) dot(g, bx, y + row, BRICK[0])
      if (hash2(bx, course, seed) > 0.72 && (y + row) % 3 === 0) rect(g, Math.max(x, bx + 1), y + row, Math.min(5, x + w - bx - 1), 1, BRICK[2])
    }
  }
}

// Friso de ladrillo bajo la albardilla, con el vierteaguas azulado y la sombra que da sobre la fachada.
function fascia(g) {
  brick(g, 1, 5, 174, 6, 3)
  rect(g, 1, 5, 174, 1, BRICK[0])
  rect(g, 2, 11, 172, 1, ALU)
  rect(g, 1, 12, 174, 1, FRAME)
}

// Pilar de ladrillo de la fachada con sus cantos oscuros.
function pillar(g, x, w) {
  brick(g, x, 13, w, 32, x)
  rect(g, x, 13, 1, 32, BRICK[3])
  rect(g, x + w - 1, 13, 1, 32, BRICK[3])
}

// Puerta de dos hojas de cristal con su montante y travesaño azulados, el cartelito de horario y el umbral de piedra.
function door(g) {
  rect(g, 7, 13, 5, 32, STONE[1])
  rect(g, 7, 13, 1, 32, STONE[2])
  rect(g, 30, 13, 5, 32, STONE[1])
  rect(g, 12, 13, 18, 1, LINTEL)
  rect(g, 12, 14, 19, 26, FRAME)
  rect(g, 13, 15, 16, 3, GLASS[1])
  rect(g, 16, 16, 5, 1, STONE[2])
  rect(g, 13, 18, 16, 1, PAL.ink)
  rect(g, 13, 19, 16, 1, ALU)
  rect(g, 13, 20, 16, 1, PAL.ink)
  ;[14, 22].forEach((x) => {
    rect(g, x, 21, 6, 17, DOOR_GLASS[0])
    for (let i = 0; i < 6; i++) rect(g, x + 5 - i, 22 + i, 1, 2, DOOR_GLASS[1])
  })
  rect(g, 13, 21, 1, 17, GLASS[3])
  rect(g, 20, 21, 1, 17, ALU)
  plant(g, 22, 27)
  rect(g, 14, 38, 15, 1, ALU)
  rect(g, 12, 40, 18, 1, STONE[2])
  rect(g, 12, 41, 18, 1, STONE[0])
  rect(g, 12, 42, 18, 1, GLASS[1])
  rect(g, 12, 43, 18, 1, STONE[1])
  rect(g, 12, 44, 18, 1, STONE[0])
}

// Placa clara y portero automático en la jamba derecha de la puerta.
function intercom(g) {
  rect(g, 31, 16, 4, 6, STONE[2])
  rect(g, 32, 17, 2, 3, '#ffffff')
  rect(g, 32, 22, 3, 4, FRAME)
  dot(g, 33, 23, ALU)
}

// Cartel azul de la ventana: marco oscuro, corona dorada y "RACE" en la letra de 3×5, con su peana.
function raceSign(g, x) {
  rect(g, x, 17, 17, 11, PAL.ink)
  rect(g, x + 1, 18, 15, 9, NAVY)
  ;[6, 8, 10].forEach((dx) => dot(g, x + dx, 18, PAL.saffron))
  rect(g, x + 6, 19, 5, 1, PAL.saffron)
  drawText(g, x + 1, 22, 'RACE', PAL.saffron)
  rect(g, x + 3, 28, 10, 1, NAVY)
}

// Planta en maceta tras el cristal: matas apagadas por la penumbra.
function plant(g, x, y) {
  ;[[1, 0], [0, 2], [3, 1], [2, 3], [4, 3], [1, 4], [3, 5]].forEach(([dx, dy]) => rect(g, x + dx, y + dy, 2, 2, LEAF[(dx + dy) % 2]))
  rect(g, x + 1, y + 7, 4, 2, shade(PAL.earthDark, 0.7))
}

// Ventanal: dintel de piedra, marco oscuro, interior en penumbra con dos luces de techo, una planta y una balda, reflejos
// en diagonal, el cartel en el centro y debajo el vierteaguas, el alféizar blanco y el zócalo. Devuelve el cristal y el
// hueco del cartel para encenderlo de noche.
function bay(g, x, w, plantRight) {
  rect(g, x, 13, w, 1, LINTEL)
  rect(g, x, 14, w, 19, FRAME)
  const glass = { x: x + 2, y: 15, w: w - 4, h: 17 }
  rect(g, glass.x - 1, glass.y - 1, glass.w + 2, glass.h + 1, GLASS[3])
  rect(g, glass.x, glass.y, glass.w, glass.h, GLASS[1])
  rect(g, glass.x, glass.y + 13, glass.w, glass.h - 13, GLASS[0])
  rect(g, x + 7, 16, 5, 1, STONE[2])
  rect(g, x + w - 12, 16, 5, 1, STONE[2])
  rect(g, x + 3, 22, 6, 1, PAL.earthDark)
  plant(g, plantRight ? x + w - 10 : x + 4, 23)
  // Tres bandas de reflejo en diagonal, recortadas al cristal para no pisar el marco.
  for (let row = 0; row < glass.h; row++) {
    const col = glass.w - 8 - (glass.h - row)
    ;[[col, 3], [col + 6, 2], [col - 18, 2]].forEach(([from, width]) => {
      const left = Math.max(0, from)
      const right = Math.min(glass.w, from + width)
      if (right > left) rect(g, glass.x + left, glass.y + row, right - left, 1, GLASS[2])
    })
  }
  const signX = x + Math.round((w - 17) / 2)
  raceSign(g, signX)
  rect(g, x, 33, w, 1, ALU)
  rect(g, x, 34, w, 1, PAL.bone)
  rect(g, x, 35, w, 1, LINTEL)
  rect(g, x, 36, w, 9, STONE[1])
  rect(g, x, 36, w, 1, STONE[2])
  for (let jx = x + 6; jx < x + w - 2; jx += 14) rect(g, jx, 36, 1, 9, STONE[0])
  return { glass, sign: { x: signX - glass.x, y: 17 - glass.y, w: 17, h: 12 } }
}

export function garageSprite() {
  const s = newSprite(RACE_FACADE.w, RACE_CANVAS_H)
  const { g } = s
  // Las piezas trabajan en píxeles de la fachada; el lienzo es más alto y la fachada se apoya abajo.
  g.translate(0, TOP)
  coping(g)
  fascia(g)
  pillar(g, 1, 6)
  door(g)
  intercom(g)
  pillar(g, 35, 7)
  const bays = [bay(g, 42, 37, false), bay(g, 87, 36, true), bay(g, 131, 37, true)]
  pillar(g, 79, 8)
  pillar(g, 123, 8)
  pillar(g, 168, 7)
  g.setTransform(1, 0, 0, 1, 0, 0)
  s.doorCol = RACE_DOOR_COL
  // De noche se encienden los ventanales, con el cartel en silueta, y el cristal de la puerta.
  bays.forEach(({ glass, sign }) => s.windows.push(...litPane(glass.x, TOP + glass.y, glass.w, glass.h, [sign])))
  s.windows.push(...litPane(14, TOP + 21, 15, 17, [{ x: 6, y: 0, w: 2, h: 17 }]))
  return finish(s)
}
