// El SEAT Córdoba blanco de la usuaria (primera generación, berlina de cuatro puertas), aparcado delante del ala derecha de la
// Universidad de Burgos, con el frontal a la izquierda. Antes salía de un PNG reducido; ahora se pinta con código copiando su
// silueta pieza a pieza: capó bajo, parabrisas muy tendido, techo corto, luneta inclinada, maletero recto con el piloto rojo,
// antena en la trasera del techo y tapacubos claros. Mide 66×31, algo más que el PNG (56×26), y es lo más que cabe entre la
// escalinata y el borde de la fachada (ver `world.test.js`).
import { dot, line, makeCanvas, rect } from './pixelKit.js'

export const SEAT_CORDOBA_SIZE = { w: 66, h: 31 }

// Cuerpo sólido: la huella de la carrocería junto a las ruedas, de parachoques a parachoques. La parte alta (techo y ventanillas)
// no choca: se dibuja por delante de la fachada.
export const SEAT_CORDOBA_BODY = [{ l: -31, t: -8, r: 31, b: -1 }]

// Blanco de la carrocería, de la sombra baja al brillo del hombro, y el contorno gris oscuro. No hay un blanco así en la paleta:
// el de la paleta tira a crema y el coche es blanco frío.
const PAINT = ['#8e949c', '#bcc1c7', '#dadde1', '#eef0f1', '#fbfbfa']
const INK = '#30333a'
// Cristal: borde en penumbra, cuerpo azul grisáceo y reflejo.
const GLASS = ['#2c3f4a', '#4d6f80', '#7ea3b4']
const TIRE = ['#1d1f24', '#33363c']
const HUB = ['#8d9399', '#c4c8cd', '#e6e8ea']
const TAIL = ['#9e2a26', '#d8463e']
const AMBER = '#e08a2c'
const LAMP = '#f3f0dc'

// Silueta de la carrocería fila a fila (primera y última columna, ambas incluidas), del techo (fila 4) al estribo (fila 26).
const PROFILE = {
  4: [31, 47], 5: [27, 49], 6: [26, 51], 7: [24, 53], 8: [23, 54], 9: [21, 55], 10: [20, 57], 11: [18, 63], 12: [17, 64],
  13: [12, 65], 14: [8, 65], 15: [5, 65], 16: [3, 65], 17: [2, 65], 18: [1, 65], 19: [1, 65], 20: [0, 65], 21: [0, 65],
  22: [0, 65], 23: [0, 65], 24: [1, 65], 25: [1, 64], 26: [1, 62],
}
const WHEELS = [12.5, 51.5]
const WHEEL_Y = 25.5

const inBody = (x, y) => Boolean(PROFILE[y]) && x >= PROFILE[y][0] && x <= PROFILE[y][1]

// Tono de la chapa según la altura: el hombro bajo la ventanilla recoge la luz y la falda queda en sombra, con la arista de
// la puerta (fila 17) marcada un punto más oscura.
function paintAt(y) {
  if (y <= 6) return PAINT[3]
  if (y <= 14) return PAINT[4]
  if (y === 17) return PAINT[2]
  if (y <= 19) return PAINT[3]
  if (y <= 23) return PAINT[2]
  return PAINT[1]
}

// Carrocería: la silueta rellena con su tono por fila y contorneada donde toca el vacío.
function body(g) {
  for (const [row, [from, to]] of Object.entries(PROFILE)) {
    const y = Number(row)
    for (let x = from; x <= to; x++) {
      const edge = !inBody(x - 1, y) || !inBody(x + 1, y) || !inBody(x, y - 1) || !inBody(x, y + 1)
      dot(g, x, y, edge ? INK : paintAt(y))
    }
  }
  // Estribo oscuro bajo las puertas y faldón del parachoques.
  rect(g, 2, 25, 62, 1, PAINT[0])
}

// Ventanillas de la fila `y`: el parabrisas tendido, el montante A, la ventanilla delantera, el pilar B, la trasera, el pilar
// C en chapa y la luneta, que sigue la caída del techo hasta el maletero.
const reflex = (x, y) => (x + y) % 9 < 2
// Primera columna de la ventanilla delantera en la fila `y`: tras el parabrisas y el montante A. Llega hasta la columna 33.
const frontPaneFrom = (y) => PROFILE[y][0] + 5
const FRONT_PANE_TO = 33

function windowRow(g, y) {
  const [left, right] = PROFILE[y]
  rect(g, left + 1, y, 2, 1, GLASS[2])
  rect(g, left + 3, y, 2, 1, PAINT[2])
  for (let x = frontPaneFrom(y); x <= FRONT_PANE_TO; x++) dot(g, x, y, reflex(x, y) ? GLASS[2] : GLASS[1])
  rect(g, 34, y, 2, 1, INK)
  for (let x = 36; x <= 46; x++) dot(g, x, y, reflex(x, y) ? GLASS[2] : GLASS[1])
  rect(g, 47, y, Math.max(0, right - 49), 1, PAINT[3])
  if (y >= 7) rect(g, right - 2, y, 2, 1, GLASS[1])
}

function windows(g) {
  // Junta superior de las ventanillas, bajo el techo.
  rect(g, 28, 6, 21, 1, GLASS[0])
  for (let y = 7; y <= 12; y++) windowRow(g, y)
  // Junta inferior: la línea de cintura sobre la chapa.
  rect(g, 18, 13, 36, 1, INK)
  // Penumbra en lo alto del cristal, bajo la junta.
  rect(g, 29, 7, 5, 1, GLASS[0])
  rect(g, 36, 7, 10, 1, GLASS[0])
}

// Rendijas de las puertas, tiradores, retrovisor y la arista del maletero.
function doors(g) {
  for (let y = 14; y <= 19; y++) dot(g, 19, y, PAINT[0])
  for (let y = 14; y <= 24; y++) dot(g, 36, y, PAINT[0])
  for (let y = 14; y <= 19; y++) dot(g, 50, y, PAINT[0])
  rect(g, 31, 16, 3, 1, INK)
  rect(g, 46, 16, 3, 1, INK)
  rect(g, 20, 11, 3, 2, INK)
  dot(g, 21, 11, PAINT[1])
  rect(g, 56, 12, 8, 1, PAINT[2])
}

// Frontal y trasera: faro, intermitente, piloto rojo y las franjas de los parachoques.
function lamps(g) {
  rect(g, 1, 18, 3, 2, LAMP)
  dot(g, 3, 19, PAINT[1])
  rect(g, 16, 18, 2, 1, AMBER)
  rect(g, 63, 13, 2, 4, TAIL[1])
  rect(g, 63, 16, 2, 1, TAIL[0])
  rect(g, 1, 22, 6, 1, PAINT[1])
  rect(g, 57, 21, 8, 1, PAINT[1])
}

// Rueda con su paso de rueda en sombra: neumático oscuro, tapacubos claro con brillo arriba y el buje en el centro.
function wheel(g, cx) {
  for (let y = 19; y <= 30; y++) {
    for (let x = Math.floor(cx - 7); x <= Math.ceil(cx + 7); x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - WHEEL_Y)
      if (d <= 5.4) dot(g, x, y, d <= 2.6 ? (y < WHEEL_Y - 1 ? HUB[2] : HUB[1]) : d <= 3.4 ? TIRE[1] : TIRE[0])
      else if (d <= 6.2 && y <= WHEEL_Y && inBody(x, y)) dot(g, x, y, INK)
    }
  }
  dot(g, cx - 0.5, WHEEL_Y - 0.5, HUB[0])
}

// Dónde cae el fotograma de la viajera sentada de perfil (18×34, mirando a la izquierda) respecto al coche: la cara en la
// ventanilla delantera, el pelo cortado por el techo y los hombros por la línea de cintura, como se ve a quien conduce.
export const DRIVER_AT = { x: 20, y: -9 }

// El coche con la viajera al volante: su fotograma (`driver`) se ve solo a través de la ventanilla delantera y los reflejos del
// cristal quedan por encima. Al conducir hacia la derecha la escena lo voltea entero, viajera incluida.
export function seatCordobaWithDriver(driver) {
  const { canvas } = seatCordoba()
  const g = canvas.getContext('2d')
  g.save()
  g.beginPath()
  for (let y = 7; y <= 12; y++) g.rect(frontPaneFrom(y), y, FRONT_PANE_TO + 1 - frontPaneFrom(y), 1)
  g.clip()
  g.drawImage(driver, DRIVER_AT.x, DRIVER_AT.y)
  g.restore()
  for (let y = 7; y <= 12; y++) {
    for (let x = frontPaneFrom(y); x <= FRONT_PANE_TO; x++) if (reflex(x, y) && (x + y) % 18 < 1) dot(g, x, y, GLASS[2])
  }
  return canvas
}

export function seatCordoba() {
  const canvas = makeCanvas(SEAT_CORDOBA_SIZE.w, SEAT_CORDOBA_SIZE.h)
  const g = canvas.getContext('2d')
  // Antena de varilla en la trasera del techo.
  line(g, 48, 3, 50, 0, INK)
  body(g)
  windows(g)
  doors(g)
  lamps(g)
  WHEELS.forEach((cx) => wheel(g, cx))
  return { canvas, body: SEAT_CORDOBA_BODY, painted: true }
}
