// Dibujo de la sala: pared del fondo, paredes laterales, suelo de tablones y felpudo en la puerta.
// Solo colores de la paleta y sombras duras; con `pastel` se aclaran igual que el resto del valle.
import { PAL, TONE, tint } from './palette.js'
import { hash2, makeCanvas, rect } from './pixelKit.js'
import { TILE } from './world.js'
import { WINDOWS } from './interior/homeLayout.js'
import { homeDecorCanvas } from './interior/roomDecor.js'

const PLANK_H = 8
const PLANK_W = 24

export function roomCanvas(room, pastel = false) {
  const canvas = makeCanvas(room.width, room.height)
  const g = canvas.getContext('2d')
  const c = (hex) => (pastel ? tint(hex, 0.3) : hex)
  const [woodDeep, woodDark, woodMid, woodLight] = TONE.wood.map(c)
  const [wallShade, wallBase, wallLight] = TONE.wall.map(c)
  const wallH = room.wallRows * TILE

  // Suelo: filas de tablones con las juntas desplazadas y un tono distinto por tablón.
  rect(g, 0, wallH, room.width, room.height - wallH, woodMid)
  for (let y = wallH; y < room.height; y += PLANK_H) {
    const row = (y - wallH) / PLANK_H
    const shift = (row % 2) * (PLANK_W / 2)
    for (let x = -shift; x < room.width; x += PLANK_W) {
      const pick = hash2(Math.round(x), row, 7)
      if (pick < 0.3) rect(g, Math.max(0, x), y, Math.min(PLANK_W, room.width - x), PLANK_H, woodLight)
      else if (pick > 0.8) rect(g, Math.max(0, x), y, Math.min(PLANK_W, room.width - x), PLANK_H, woodDark)
      rect(g, Math.max(0, x), y, 1, PLANK_H, woodDark)
    }
    rect(g, 0, y + PLANK_H - 1, room.width, 1, woodDark)
  }

  // Pared del fondo: papel liso, zócalo más oscuro y moldura de madera arriba y abajo.
  rect(g, 0, 0, room.width, wallH, wallBase)
  rect(g, 0, wallH - 16, room.width, 16, wallShade)
  rect(g, 0, wallH - 17, room.width, 1, wallLight)
  rect(g, 0, wallH - 4, room.width, 4, woodDark)
  rect(g, 0, wallH, room.width, 2, woodDeep)
  rect(g, 0, 0, room.width, 3, woodDark)

  // Paredes laterales: una tesela de ancho, con el borde interior marcado.
  ;[0, room.width - TILE].forEach((x) => {
    rect(g, x, 0, TILE, room.height, wallShade)
    rect(g, x === 0 ? TILE - 2 : x, 0, 2, room.height, woodDark)
    rect(g, x, 0, TILE, 3, woodDark)
  })

  // Felpudo bajo la puerta, centrado en la zona de salida.
  const mat = { x: room.exit.x + 8, y: room.height - 12, width: TILE, height: 8 }
  rect(g, mat.x, mat.y, mat.width, mat.height, c(PAL.tileDark))
  rect(g, mat.x + 1, mat.y + 1, mat.width - 2, mat.height - 2, c(PAL.tile))
  rect(g, mat.x + 3, mat.y + 3, mat.width - 6, 1, c(PAL.saffronLight))
  // La casa de Lupe suma marcos de ventana, cuadros, alfombras y luces encima de la sala vacía, y deja huecos los cristales:
  // por ellos se ve el cielo vivo del valle, que la escena pone detrás de esta imagen.
  if (room.home) {
    g.drawImage(homeDecorCanvas(room, pastel), 0, 0)
    WINDOWS.forEach(({ x, y, w, h }) => g.clearRect(x, y, w, h))
  }
  return canvas
}
