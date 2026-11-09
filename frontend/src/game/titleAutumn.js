// Bioma de otoño de la portada. Con la lluvia el valle se funde con una segunda versión de sí mismo:
// la hierba y las copas pasan a ocres y naranjas, salen setas, calabazas, hojas caídas y charcos.
// Se construye una sola vez a partir del paisaje de primavera (sin sus flores).
import { seeded } from './palette.js'
import { dot, ellipse, rect } from './pixelKit.js'

const MEADOW_TOP = 124

function rgbToHsl(r, g, b) {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0)
  else if (max === gg) h = (bb - rr) / d + 2
  else h = (rr - gg) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

const isGreen = (h, s) => h >= 65 && h <= 170 && s > 0.18
const isBlossom = (h, s) => h >= 310 && h <= 355 && s > 0.3

// Cambia solo los verdes (hierba, copas, musgo) a ocres y los rosas del cerezo a naranjas más profundos (los pálidos, más amarillos):
// los verdes más oscuros se vuelven más rojizos, y las casas, caminos y montañas quedan como estaban.
function recolor(g, width, height) {
  const image = g.getImageData(0, 0, width, height)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    let next = null
    if (isGreen(h, s)) next = [Math.max(14, 44 - (h - 70) * 0.3), Math.min(1, s * 1.1), l * 1.04]
    else if (isBlossom(h, s)) next = [12 + l * 28, Math.min(1, s * 1.15), l * 0.8]
    if (!next) continue
    const [r, gr, b] = hslToRgb(...next)
    data[i] = r
    data[i + 1] = gr
    data[i + 2] = b
  }
  g.putImageData(image, 0, 0)
}

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

  recolor(g, width, height)

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
