// Luces led de la casa de Lupe de noche: tiras de colores en la pared, bajo las mesas, tras la tele y en los bordes de las
// estanterías, con su halo, sobre un oscurecimiento de la sala. Los colores cambian entre tres paletas cada par de
// segundos (quietos con «reducir movimiento»). Sin Phaser: aquí solo se dibuja; `InteriorScene` coloca las capas.
import { INK, canvasOf, rect } from './draw.js'

// Tiras: rectángulos en píxeles de la sala. Siguen el plano de `homeLayout.js`.
export const LED_STRIPS = [
  { x: 16, y: 3, w: 352, h: 1 },
  { x: 61, y: 70, w: 62, h: 1 },
  { x: 289, y: 69, w: 74, h: 1 },
  { x: 145, y: 26, w: 1, h: 52 },
  { x: 206, y: 26, w: 1, h: 52 },
  { x: 224, y: 33, w: 48, h: 1 },
  { x: 213, y: 36, w: 1, h: 40 },
  { x: 283, y: 36, w: 1, h: 40 },
  { x: 327, y: 118, w: 1, h: 40 },
  { x: 361, y: 118, w: 1, h: 40 },
]

export const LED_PALETTES = [
  ['#ff4fa8', '#35e0ff'],
  ['#35e0ff', '#9b6bff'],
  ['#ffb347', '#ff4fa8'],
]

// Capa de leds para una paleta: cada tira con su núcleo y dos halos más anchos y transparentes.
export function ledCanvas(room, palette) {
  const { canvas, g } = canvasOf(room.width, room.height)
  LED_STRIPS.forEach((strip, i) => {
    const color = palette[i % palette.length]
    g.globalAlpha = 0.12
    rect(g, strip.x - 4, strip.y - 4, strip.w + 8, strip.h + 8, color)
    g.globalAlpha = 0.25
    rect(g, strip.x - 2, strip.y - 2, strip.w + 4, strip.h + 4, color)
    g.globalAlpha = 1
    rect(g, strip.x, strip.y, strip.w, strip.h, color)
  })
  // Las pantallas siguen luciendo bajo la penumbra: un velo claro sobre cada una.
  g.globalAlpha = 0.2
  ;[[66, 37, 54, 16], [292, 36, 70, 18], [228, 37, 40, 22]].forEach(([x, y, w, h]) => rect(g, x, y, w, h, INK.white))
  g.globalAlpha = 1
  return canvas
}
