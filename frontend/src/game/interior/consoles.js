// Las consolas de la estantería de Lupe, cada una dibujada en un lienzo de 28×20 para el visor de «Las consolas». Lo que las
// hace reconocibles es la silueta y los colores de cada modelo, sin logotipos. De la Xbox no se sabe aún el modelo (decisión
// editorial: solo "Xbox"), así que se dibuja una caja negra con la esfera verde de la marca, sin pretender ser una generación.
// Sin dependencias de Phaser ni de React.
import { canvasOf, rect } from './draw.js'

export const CONSOLE_W = 28
export const CONSOLE_H = 20

const ink = '#22212b'

function drawNintendo64(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(3, 8, 22, 8, '#6f7076')
  put(3, 8, 22, 1, '#8d8e94')
  put(3, 14, 22, 2, '#505157')
  put(9, 4, 10, 5, '#7c7d83')
  put(10, 5, 8, 1, '#2b2b30')
  put(11, 2, 6, 4, '#8a8a90')
  put(12, 3, 4, 2, '#d8d8dc')
  put(5, 10, 2, 2, '#c93a3a')
  ;[6, 11, 16, 21].forEach((x) => put(x, 13, 3, 2, '#2b2b30'))
  put(10, 11, 2, 1, '#3d6fd0')
  put(12, 11, 2, 1, '#2f9e57')
  put(14, 11, 2, 1, '#f1c232')
  put(16, 11, 2, 1, '#d8353a')
}

function drawGameBoyColor(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(9, 0, 10, 1, '#6b4fb0')
  put(8, 1, 12, 17, '#6b4fb0')
  put(9, 18, 10, 1, '#55408f')
  put(10, 2, 8, 7, '#3a3a44')
  put(11, 3, 6, 5, '#a7bf7d')
  put(11, 11, 1, 3, ink)
  put(10, 12, 3, 1, ink)
  put(15, 12, 2, 2, '#2d2540')
  put(17, 11, 2, 2, '#2d2540')
  put(11, 16, 2, 1, '#2d2540')
  put(14, 16, 2, 1, '#2d2540')
}

function drawNintendo3ds(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(4, 0, 22, 9, '#3f9fd6')
  put(6, 1, 18, 7, '#1d1d24')
  put(7, 2, 16, 5, '#6f9fd0')
  put(4, 9, 22, 1, '#25262c')
  put(4, 10, 22, 9, '#3f9fd6')
  put(10, 11, 10, 6, '#1d1d24')
  put(11, 12, 8, 4, '#6f9fd0')
  put(6, 11, 3, 3, '#25262c')
  put(7, 15, 1, 3, ink)
  put(6, 16, 3, 1, ink)
  ;[[23, 11], [21, 13], [25, 13], [23, 15]].forEach(([x, y]) => put(x, y, 1, 1, '#e8e8ec'))
}

function drawWii(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(10, 1, 8, 17, '#eceae4')
  put(10, 1, 1, 17, '#c9c6bd')
  put(11, 5, 6, 1, '#1b1b22')
  put(11, 6, 6, 1, '#59b8f0')
  put(12, 10, 4, 2, '#d8d5cc')
  put(11, 14, 2, 2, '#c9c6bd')
  put(15, 14, 2, 2, '#c9c6bd')
  put(9, 18, 10, 1, '#c9c6bd')
}

function drawGameCube(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(5, 5, 18, 13, '#5a4fa8')
  put(5, 5, 18, 2, '#7468c4')
  put(9, 2, 10, 1, '#7468c4')
  put(9, 3, 1, 2, '#5a4fa8')
  put(18, 3, 1, 2, '#5a4fa8')
  put(12, 8, 4, 1, '#d6d4e6')
  put(11, 9, 6, 4, '#d6d4e6')
  put(12, 13, 4, 1, '#d6d4e6')
  put(13, 10, 2, 2, '#5a4fa8')
  ;[6, 10, 14, 18].forEach((x) => put(x, 15, 3, 2, ink))
}

function drawSwitch(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(7, 3, 14, 13, '#26262c')
  put(8, 4, 12, 10, '#0e0f16')
  put(9, 5, 10, 8, '#3c4a73')
  put(3, 2, 4, 1, '#1fb5e8')
  put(2, 3, 5, 13, '#1fb5e8')
  put(3, 16, 4, 1, '#1fb5e8')
  put(3, 6, 3, 3, ink)
  put(4, 10, 1, 3, ink)
  put(3, 11, 3, 1, ink)
  put(21, 2, 4, 1, '#ff4a57')
  put(21, 3, 5, 13, '#ff4a57')
  put(21, 16, 4, 1, '#ff4a57')
  ;[[23, 5], [22, 6], [24, 6], [23, 7]].forEach(([x, y]) => put(x, y, 1, 1, ink))
  put(22, 12, 3, 3, ink)
}

function drawPlayStation(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(2, 6, 24, 10, '#b9b9bd')
  put(2, 6, 24, 1, '#d4d4d8')
  put(2, 15, 24, 1, '#8f8f94')
  put(10, 2, 8, 1, '#c4c4c8')
  put(9, 3, 10, 4, '#c4c4c8')
  put(12, 4, 4, 1, '#8f8f94')
  ;[5, 9].forEach((x) => put(x, 13, 3, 2, '#4b4b50'))
  ;[16, 20].forEach((x) => put(x, 13, 3, 2, '#4b4b50'))
  put(21, 8, 1, 1, '#d8353a')
  put(22, 8, 1, 1, '#f1c232')
  put(21, 9, 1, 1, '#2f9e57')
  put(22, 9, 1, 1, '#3d4fb0')
}

function drawPlayStation2(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(2, 5, 24, 11, '#1d1d22')
  put(2, 5, 24, 1, '#34343c')
  put(4, 6, 10, 1, '#34343c')
  put(4, 8, 14, 2, '#34343c')
  put(4, 9, 14, 1, '#08080b')
  put(21, 8, 2, 2, '#2f6fd6')
  put(20, 12, 4, 1, '#2f6fd6')
  ;[5, 9].forEach((x) => put(x, 13, 3, 2, '#08080b'))
}

function drawPlayStation3(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(2, 4, 24, 12, '#17171b')
  put(4, 4, 20, 1, '#3d3d46')
  put(3, 5, 22, 1, '#2a2a31')
  put(2, 4, 1, 12, '#a7a7ae')
  put(25, 4, 1, 12, '#a7a7ae')
  put(2, 10, 24, 1, '#9a9aa4')
  put(4, 8, 14, 1, '#07070a')
  put(20, 12, 2, 2, '#5a5a64')
}

function drawPlayStation4(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  for (let i = 0; i < 6; i += 1) put(8 - i, 5 + i, 18, 1, i % 2 ? '#2a2a30' : '#33333a')
  put(3, 11, 18, 3, '#17171c')
  put(4, 12, 16, 1, '#59a6ff')
  put(21, 11, 1, 3, '#0e0e12')
}

function drawXbox(g) {
  const put = (x, y, w, h, color) => rect(g, x, y, w, h, color)
  put(3, 5, 22, 11, '#1c1c20')
  put(3, 5, 22, 1, '#33333a')
  put(12, 6, 4, 1, '#6dbe2a')
  put(11, 7, 6, 1, '#6dbe2a')
  put(10, 8, 8, 4, '#6dbe2a')
  put(11, 12, 6, 1, '#6dbe2a')
  put(12, 13, 4, 1, '#6dbe2a')
  put(12, 7, 2, 1, '#a6e85a')
  for (let i = 0; i < 4; i += 1) {
    put(12 + i, 8 + i, 1, 1, '#1c1c20')
    put(15 - i, 8 + i, 1, 1, '#1c1c20')
  }
  ;[5, 9].forEach((x) => put(x, 14, 3, 1, '#08080b'))
}

// Orden de la estantería: de Nintendo a PlayStation y, al final, la Xbox. Cada nombre está en `lib/valleCopy.js` (`consoles.items`).
export const CONSOLES = [
  { id: 'n64', draw: drawNintendo64 },
  { id: 'gbc', draw: drawGameBoyColor },
  { id: 'ds3', draw: drawNintendo3ds },
  { id: 'gamecube', draw: drawGameCube },
  { id: 'wii', draw: drawWii },
  { id: 'switch', draw: drawSwitch },
  { id: 'ps1', draw: drawPlayStation },
  { id: 'ps2', draw: drawPlayStation2 },
  { id: 'ps3', draw: drawPlayStation3 },
  { id: 'ps4', draw: drawPlayStation4 },
  { id: 'xbox', draw: drawXbox },
]

export function consoleCanvas(console) {
  const { canvas, g } = canvasOf(CONSOLE_W, CONSOLE_H)
  console.draw(g)
  return canvas
}
