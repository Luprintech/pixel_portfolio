// Lo que no se mueve ni se usa en la casa de Lupe y vive pegado a la pared o al suelo: ventanas, cuadros, la guirnalda de
// luces, la alfombra y los charcos de luz cálida. Se pinta una sola vez sobre la sala vacía (`interiorPaint.js`), con
// los mismos colores de la paleta y sombras duras que el resto del valle.
import { PAL } from '../palette.js'
import { ellipse } from '../pixelKit.js'
import { INK, WOOD, canvasOf, hash2, pastelize, rect, slab } from './draw.js'

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

function mountainsArt(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.night2)
  rect(g, x + w - 6, y + 2, 3, 3, INK.saffronLight)
  for (let i = 0; i < w; i++) {
    const peak = Math.round((h - 2) * (0.55 + 0.45 * Math.abs(Math.sin(i * 0.37 + 0.6))))
    rect(g, x + i, y + h - peak, 1, peak, i % 5 === 0 ? INK.slateLight : INK.slate)
  }
  rect(g, x, y + h - 2, w, 2, INK.moss)
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

function keycapsArt(g, x, y, w, h) {
  rect(g, x, y, w, h, INK.night2)
  ;[[1, 2, INK.tile], [6, 2, INK.saffronLight], [1, 8, INK.lagoonLight], [6, 8, INK.rose]].forEach(([dx, dy, color]) => {
    rect(g, x + dx, y + dy, 4, 4, color)
    rect(g, x + dx, y + dy, 4, 1, INK.white)
  })
}

// Banderines de colores colgados de una cuerda con una ligera curva.
function pennants(g, x, y, count) {
  const colors = [INK.teal, INK.rose, INK.saffronLight, INK.lagoon, INK.tile]
  for (let i = 0; i < count; i++) {
    const px = x + i * 7
    const sag = Math.round(Math.sin((i / (count - 1)) * Math.PI) * 3)
    rect(g, px, y + sag, 8, 1, INK.slate)
    rect(g, px + 1, y + sag + 1, 6, 1, colors[i % colors.length])
    rect(g, px + 2, y + sag + 2, 4, 1, colors[i % colors.length])
    rect(g, px + 3, y + sag + 3, 2, 1, colors[i % colors.length])
  }
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

function wall(g) {
  stringLights(g, 20, 364, 4)
  // Pared de Atreus: póster de montañas, vitrina de keycaps y banderines.
  frame(g, 66, 8, 22, 22, mountainsArt)
  frame(g, 94, 12, 14, 14, keycapsArt)
  pennants(g, 112, 9, 4)
  // Sobre la estantería y la tele: una ventana pequeña cada una.
  windowPane(g, 154, 6, 28, 14, null)
  windowPane(g, 230, 7, 36, 18, INK.rose)
  // Sobre la mesa de Lupe, la Trifuerza y su estante.
  frame(g, 292, 8, 20, 22, triforceArt)
  lupeShelf(g, 318, 22)
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

// Charco de luz: óvalos concéntricos cada vez más pequeños y opacos, con borde duro (como los halos del valle).
function lightPool(g, cx, cy, rx, ry, color, alpha) {
  g.save()
  for (let i = 0; i < 3; i++) {
    g.globalAlpha = alpha * (i + 1)
    ellipse(g, cx, cy, rx * (1 - i * 0.28), ry * (1 - i * 0.28), color)
  }
  g.restore()
}

function floor(g) {
  rug(g, 174, 100, 148, 96)
  // Luz cálida de la lámpara y del sofá; brillo frío de las pantallas delante de cada mesa y de la tele.
  lightPool(g, 100, 156, 40, 14, PAL.saffronLight, 0.1)
  lightPool(g, 248, 150, 46, 16, PAL.saffronLight, 0.07)
  lightPool(g, 92, 94, 34, 9, PAL.lagoonLight, 0.08)
  lightPool(g, 326, 94, 36, 9, PAL.lagoonLight, 0.08)
  lightPool(g, 248, 94, 42, 8, PAL.lagoonLight, 0.07)
  // Pequeños restos de vida: unas zapatillas junto a la puerta y el cuenco de la gata.
  ;[[200, 214], [207, 215]].forEach(([x, y]) => {
    rect(g, x, y, 6, 3, INK.rose)
    rect(g, x, y, 3, 3, INK.whiteShade)
  })
  rect(g, 198, 126, 8, 4, INK.tile)
  rect(g, 198, 126, 8, 1, INK.tileDark)
  rect(g, 199, 127, 6, 1, INK.saffronLight)
}

// Decoración de pared y suelo de la casa como una capa transparente del tamaño de la sala.
export function homeDecorCanvas(room, pastel) {
  const { canvas, g } = canvasOf(room.width, room.height)
  floor(g)
  wall(g)
  return pastelize(canvas, pastel)
}
