// Bioma de otoño de la portada. Con la lluvia el valle se funde con una segunda versión de sí mismo:
// la hierba y las copas pasan a ocres y naranjas, salen setas, calabazas, hojas caídas y charcos.
// Se construye una sola vez a partir del paisaje de primavera (sin sus flores).
import { seeded } from './palette.js'
import { dot, ellipse, rect } from './pixelKit.js'
import { isBlossom, isGreen, repaintSteps } from './titleRecolor.js'
import { drain } from './sliced.js'

const MEADOW_TOP = 124

// Cambia solo los verdes (hierba, copas, musgo) a ocres y los rosas del cerezo a naranjas más profundos (los pálidos, más amarillos):
// los verdes más oscuros se vuelven más rojizos, y las casas, caminos y montañas quedan como estaban.
export function* recolorAutumnSteps(g, width, height) {
  yield* repaintSteps(g, width, height, (h, s, l) => {
    if (isGreen(h, s)) return [Math.max(14, 44 - (h - 70) * 0.3), Math.min(1, s * 1.1), l * 1.04]
    if (isBlossom(h, s)) return [12 + l * 28, Math.min(1, s * 1.15), l * 0.8]
    return null
  })
}

export const recolorAutumn = (g, width, height) => drain(recolorAutumnSteps(g, width, height))

const CAPS = [
  { cap: '#e04a30', dots: true },
  { cap: '#e04a30', dots: true },
  { cap: '#d4943a', dots: false },
  { cap: '#a874c8', dots: true },
]

// Seta: sombrero redondeado con lunares y un pie claro; las pequeñas son más bajas y estrechas.
function mushroom(g, x, y, { cap, dots }, small) {
  const top = small ? 4 : 6
  rect(g, x - 1, y - top, 3, 1, cap)
  rect(g, x - 2, y - top + 1, 5, 1, cap)
  if (!small) rect(g, x - 3, y - top + 2, 7, 1, cap)
  if (dots) {
    dot(g, x - 1, y - top + 1, '#f1e6cf')
    if (!small) dot(g, x + 2, y - top + 2, '#f1e6cf')
  }
  rect(g, x - 1, y - (small ? 2 : 3), 2, small ? 2 : 3, '#e8d3a8')
  dot(g, x, y, '#8a6a40')
}

function pumpkin(g, x, y) {
  ellipse(g, x, y, 4, 3, '#c4572a')
  ellipse(g, x, y, 3, 3, '#e07a2a')
  rect(g, x - 1, y - 3, 1, 6, '#c4572a')
  rect(g, x, y - 4, 1, 2, '#5a3a28')
}

function puddle(g, x, y, rx) {
  ellipse(g, x, y, rx, 2, '#5c7da0')
  ellipse(g, x, y - 0.4, rx - 1, 1.2, '#86a9c8')
  dot(g, x - Math.floor(rx / 2), y - 1, '#d3f0f2')
}

// Construye el lienzo de otoño: `land` es el paisaje sin flores, que se repinta en ocres, y encima
// se reparten los detalles de la estación solo sobre hierba (comprobado antes de cambiar los colores).
export function buildAutumnLand(land) {
  const { width, height } = land
  const g = land.getContext('2d')
  const original = g.getImageData(0, 0, width, height).data
  const onGrass = (x, y) => {
    const i = (y * width + x) * 4
    return original[i + 1] > original[i] && original[i + 3] > 0
  }
  const rand = seeded(31)
  const spot = () => {
    for (let tries = 0; tries < 40; tries++) {
      const x = 6 + Math.floor(rand() * (width - 12))
      const y = MEADOW_TOP + 8 + Math.floor(rand() * (height - MEADOW_TOP - 16))
      if (onGrass(x, y)) return { x, y }
    }
    return { x: 60, y: 168 }
  }
  const mushrooms = Array.from({ length: 26 }, (_, i) => ({ ...spot(), look: CAPS[i % CAPS.length], small: i % 3 === 0 }))
  const pumpkins = Array.from({ length: 3 }, spot)
  const puddles = Array.from({ length: 5 }, (_, i) => ({ ...spot(), rx: 5 + (i % 3) * 2 }))
  const leaves = Array.from({ length: 70 }, spot)

  recolorAutumn(g, width, height)

  puddles.forEach(({ x, y, rx }) => puddle(g, x, y, rx))
  const leafColors = ['#e0803a', '#c4572a', '#e8b04a', '#a8481f']
  leaves.forEach(({ x, y }, i) => {
    rect(g, x, y, i % 3 === 0 ? 1 : 2, 1, leafColors[i % leafColors.length])
  })
  // Las setas más atrasadas se pintan primero para que las de delante las tapen.
  mushrooms.sort((a, b) => a.y - b.y).forEach(({ x, y, look, small }) => mushroom(g, x, y, look, small))
  pumpkins.sort((a, b) => a.y - b.y).forEach(({ x, y }) => pumpkin(g, x, y))
  return land
}

// Hojas que caen del árbol en otoño, con el mismo vaivén que los pétalos de primavera.
export const LEAF_COLORS = [['#e8b04a', '#e0803a'], ['#c4572a', '#a8481f']]
