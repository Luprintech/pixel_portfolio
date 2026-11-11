// Lo que no se mueve ni se usa en la casa de Lupe y vive pegado a la pared o al suelo: ventanas, cuadros, la guirnalda de
// luces y las alfombras de cada zona. Se pinta una sola vez sobre la sala vacía (`interiorPaint.js`), con los mismos colores
// de la paleta y sombras duras que el resto del valle. El suelo no lleva manchas de luz ni de brillo de pantalla: las
// sombras de contacto las ponen los muebles y los personajes, y el brillo de la noche, `ledLights.js`.
import { INK, WOOD, canvasOf, hash2, pastelize, rect, slab } from './draw.js'
import { roofSign } from './furniture/decor.js'
import { SPOTS, WALL_X } from './homeLayout.js'

// Ventana pequeña de la pared: marco de madera, dos hojas con cielo y nubes, y cortinas si `curtains` es un color.
function windowPane(g, x, y, w, h, curtains) {
  const [deep, dark, mid, light] = WOOD
  rect(g, x - 2, y - 2, w + 4, h + 4, dark)
  rect(g, x - 2, y - 2, w + 4, 1, mid)
  rect(g, x, y, w, h, INK.lagoonLight)
  rect(g, x, y + Math.floor(h * 0.6), w, h - Math.floor(h * 0.6), '#b3e3ea')
  rect(g, x + 3, y + 3, 7, 2, INK.white)
  rect(g, x + w - 11, y + 6, 6, 2, INK.white)
  rect(g, x + Math.floor(w / 2) - 1, y, 2, h, dark)
  rect(g, x, y + Math.floor(h / 2), w, 1, dark)
  rect(g, x - 3, y + h + 1, w + 6, 2, light)
  rect(g, x - 3, y + h + 2, w + 6, 1, deep)
  if (curtains) {
    ;[x - 2, x + w - 4].forEach((cx) => {
      rect(g, cx, y - 2, 6, h + 3, curtains)
      for (let i = 0; i < h + 3; i += 4) rect(g, cx + (cx === x - 2 ? 4 : 1), y - 2 + i, 1, 2, INK.whiteShade)
    })
  }
}

// Cuadro con marco de madera y un dibujo hecho a mano por `art` dentro del hueco.
function frame(g, x, y, w, h, art) {
  slab(g, x, y, w, h, WOOD[2], WOOD[3], WOOD[0])
  rect(g, x + 2, y + 2, w - 4, h - 4, INK.white)
  art(g, x + 2, y + 2, w - 4, h - 4)
}

// Ferrari F40 rojo visto de lado, al atardecer: cuña baja, alerón trasero, faldones negros y llantas. El cuadro es apaisado
// (36×20 dentro del marco) y es lo único que cuelga sobre la mesa de Atreus.
function f40Art(g, x, y, w, h) {
  const red = '#d9272e'
  const redLight = '#ff6a6a'
  const redDark = '#9c1c22'
  rect(g, x, y, w, h, '#4a3f7a')
  rect(g, x, y + 6, w, 5, '#8a5aa8')
  rect(g, x, y + 10, w, 3, '#e58aa6')
  rect(g, x + w - 9, y + 3, 5, 5, INK.saffronLight)
  rect(g, x + w - 8, y + 2, 3, 1, INK.saffronLight)
  rect(g, x, y + 15, w, 5, INK.slate)
  rect(g, x, y + 15, w, 1, INK.slateLight)
  for (let dash = 2; dash < w; dash += 9) rect(g, x + dash, y + 19, 4, 1, INK.steelLight)
  // Carrocería: techo, cabina con dos cristales, capó y laterales, con una luz arriba y el faldón oscuro abajo.
  rect(g, x + 11, y + 7, 9, 1, redLight)
  rect(g, x + 9, y + 8, 13, 2, red)
  rect(g, x + 11, y + 8, 4, 2, INK.night)
  rect(g, x + 16, y + 8, 4, 2, INK.night)
  rect(g, x + 20, y + 10, 8, 1, red)
  rect(g, x + 2, y + 10, 30, 3, red)
  rect(g, x + 4, y + 10, 24, 1, redLight)
  rect(g, x + 2, y + 13, 31, 1, redDark)
  rect(g, x + 4, y + 14, 27, 1, INK.night)
  // Alerón trasero con sus soportes, faro delantero, toma de aire y piloto trasero.
  rect(g, x, y + 7, 7, 1, redDark)
  rect(g, x + 2, y + 8, 1, 3, redDark)
  rect(g, x + 5, y + 8, 1, 3, redDark)
  rect(g, x + 32, y + 11, 2, 1, INK.saffronLight)
  rect(g, x + 28, y + 12, 4, 1, INK.night)
  rect(g, x + 2, y + 11, 1, 2, '#ff9a9a')
  // Ruedas.
  ;[8, 26].forEach((wx) => {
    rect(g, x + wx - 2, y + 13, 5, 4, INK.night)
    rect(g, x + wx - 1, y + 17, 3, 1, INK.night)
    rect(g, x + wx, y + 14, 1, 2, INK.steelLight)
  })
}

// Disco de vinilo con su etiqueta, para el cuadro sobre la minicadena.
function recordArt(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.night2)
  const cx = x + Math.floor(w / 2)
  const cy = y + Math.floor(h / 2)
  const r = Math.floor(Math.min(w, h) / 2) - 1
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy))
    rect(g, cx - half, cy + dy, half * 2 + 1, 1, Math.abs(dy) % 3 === 0 ? INK.slate : INK.night)
  }
  rect(g, cx - 2, cy - 2, 5, 5, INK.rose)
  rect(g, cx, cy, 1, 1, INK.night)
}

function triforceArt(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.night)
  const cx = x + Math.floor(w / 2)
  const triangle = (tx, ty, size) => {
    for (let i = 0; i < size; i++) rect(g, tx - i, ty + i, i * 2 + 1, 1, INK.saffronLight)
  }
  triangle(cx, y + 2, 4)
  triangle(cx - 4, y + 7, 4)
  triangle(cx + 4, y + 7, 4)
}

// Guirnalda de bombillas cálidas a lo largo de la pared, en tramos que se descuelgan entre dos puntos.
function stringLights(g, from, to, y) {
  const span = 56
  for (let start = from; start < to; start += span) {
    const end = Math.min(to, start + span)
    for (let x = start; x <= end; x++) {
      const t = (x - start) / (end - start)
      const sag = Math.round(Math.sin(t * Math.PI) * 4)
      rect(g, x, y + sag, 1, 1, INK.slate)
      if ((x - start) % 8 === 4) {
        rect(g, x, y + sag + 1, 1, 2, INK.slate)
        rect(g, x - 1, y + sag + 3, 3, 3, INK.saffronLight)
        rect(g, x, y + sag + 3, 1, 1, '#fff3c4')
      }
    }
  }
}

// Estante flotante sobre la mesa de Lupe: libros, una figurita impresa y una planta colgante.
function lupeShelf(g, x, y) {
  const [deep, , mid, light] = WOOD
  slab(g, x, y, 44, 4, light, '#d9a173', mid)
  rect(g, x, y + 4, 44, 1, deep)
  ;[[4, 11, INK.tile], [7, 9, INK.blue], [10, 12, INK.saffronLight], [13, 8, INK.plum]].forEach(([dx, height, color]) => {
    rect(g, x + dx, y - height, 3, height, color)
    rect(g, x + dx, y - height, 1, height, INK.whiteShade)
  })
  rect(g, x + 28, y - 6, 6, 6, INK.rose)
  rect(g, x + 29, y - 8, 4, 2, INK.rose)
  rect(g, x + 29, y - 4, 1, 1, INK.night)
  rect(g, x + 32, y - 4, 1, 1, INK.night)
  // Planta colgante: maceta sobre el estante y hojas que caen por delante.
  rect(g, x + 37, y - 5, 6, 5, INK.white)
  rect(g, x + 37, y - 5, 6, 1, INK.whiteShade)
  for (let i = 0; i < 5; i++) {
    const length = 6 + Math.round(hash2(i, 8, 53) * 12)
    const lx = x + 36 + i * 2
    rect(g, lx, y + 4, 1, length, INK.moss)
    rect(g, lx + (i % 2), y + 4 + length - 3, 2, 3, INK.meadow)
  }
}

function wall(g, room) {
  stringLights(g, 20, room.width - 20, 4)
  // Sobre la mesa de Atreus, solo un cuadro apaisado con el Ferrari F40.
  frame(g, WALL_X.atreusDesk - 20, 6, 40, 24, f40Art)
  // Sobre la estantería de consolas y la tele: una ventana pequeña cada una. Sobre la recreativa no cuelga nada: su marquesina
  // ya ilumina la pared.
  windowPane(g, WALL_X.consoleShelf - 22, 6, 28, 14, null)
  windowPane(g, WALL_X.tv - 18, 7, 36, 18, INK.rose)
  frame(g, WALL_X.hifi - 9, 14, 18, 18, recordArt)
  // Sobre la escalera, el cartel de la azotea; sobre la mesa de Lupe, la Trifuerza y su estante.
  roofSign(g, WALL_X.stairs - 14, 7)
  frame(g, WALL_X.lupeDesk - 34, 8, 20, 22, triforceArt)
  lupeShelf(g, WALL_X.lupeDesk - 8, 22)
}

// Alfombra bajo el sofá: borde ciruela, fleco, campo turquesa y un rombo de azafrán con puntos rosas.
function rug(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.plum)
  rect(g, x + 2, y + 2, w - 4, h - 4, INK.rose)
  rect(g, x + 4, y + 4, w - 8, h - 8, INK.teal)
  rect(g, x + 4, y + 4, w - 8, 1, '#4eb2ad')
  const cx = x + Math.floor(w / 2)
  const cy = y + Math.floor(h / 2)
  const ry = Math.floor((h - 16) / 2)
  for (let dy = -ry; dy <= ry; dy++) {
    const half = (ry - Math.abs(dy)) * 2
    rect(g, cx - half, cy + dy, half * 2 + 1, 1, dy % 2 ? INK.saffronLight : INK.saffron)
  }
  for (let dy = -ry + 3; dy <= ry - 3; dy++) {
    const half = (ry - 3 - Math.abs(dy)) * 2
    if (half > 0) rect(g, cx - half, cy + dy, half * 2 + 1, 1, dy % 2 ? INK.teal : '#1f6b68')
  }
  for (let px = x + 8; px < x + w - 8; px += 8) {
    rect(g, px, y + 6, 2, 2, INK.rose)
    rect(g, px, y + h - 8, 2, 2, INK.rose)
  }
  for (let fx = x + 2; fx < x + w - 2; fx += 3) {
    rect(g, fx, y - 2, 1, 2, INK.whiteShade)
    rect(g, fx, y + h, 1, 2, INK.whiteShade)
  }
}

// Alfombra de la zona de Atreus: azul noche con un filo de luz y unos puntos de color, a juego con su setup.
function gamerRug(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.night)
  rect(g, x + 2, y + 2, w - 4, h - 4, INK.night2)
  rect(g, x + 2, y + 2, w - 4, 1, INK.lagoonLight)
  rect(g, x + 2, y + h - 3, w - 4, 1, INK.rose)
  for (let px = x + 8; px < x + w - 8; px += 10) {
    rect(g, px, y + 6, 2, 2, INK.slateLight)
    rect(g, px + 4, y + h - 8, 2, 2, INK.slateLight)
  }
}

// Alfombra de la zona de Lupe: cálida, con franjas de colores y fleco.
function workRug(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.plum)
  rect(g, x + 2, y + 2, w - 4, h - 4, INK.saffronLight)
  rect(g, x + 4, y + 4, w - 8, h - 8, INK.white)
  for (let py = y + 8; py < y + h - 6; py += 8) rect(g, x + 4, py, w - 8, 2, INK.rose)
  for (let fx = x + 2; fx < x + w - 2; fx += 3) {
    rect(g, fx, y - 2, 1, 2, INK.whiteShade)
    rect(g, fx, y + h, 1, 2, INK.whiteShade)
  }
}

// Esterilla del rincón de impresión 3D: goma gris carbón con un borde claro y la franja verde de la marca, para que se lea
// como una zona de trabajo aparte.
function makerMat(g, x, y, w, h) {
  rect(g, x, y, w, h, '#34343f')
  rect(g, x + 1, y + 1, w - 2, h - 2, '#41414f')
  rect(g, x + 1, y + 1, w - 2, 1, '#5c5a7a')
  rect(g, x + 1, y + h - 3, w - 2, 2, '#00ae42')
}

function floor(g) {
  gamerRug(g, 70, 86, 98, 50)
  workRug(g, WALL_X.lupeDesk - 34, 88, 68, 44)
  rug(g, SPOTS.sofa.x - 62, 108, 124, 96)
  makerMat(g, 22, 236, 184, 32)
  // Pequeños restos de vida: unas zapatillas junto a la puerta.
  ;[[292, 258], [299, 259]].forEach(([x, y]) => {
    rect(g, x, y, 6, 3, INK.rose)
    rect(g, x, y, 3, 3, INK.whiteShade)
  })
}

// Decoración de pared y suelo de la casa como una capa transparente del tamaño de la sala.
export function homeDecorCanvas(room, pastel) {
  const { canvas, g } = canvasOf(room.width, room.height)
  floor(g)
  wall(g, room)
  return pastelize(canvas, pastel)
}
