// Sprites dibujados por código: sin ficheros de imagen. Estilo cálido de pueblo,
// con contornos de color, cuatro o cinco tonos por superficie y luz desde arriba a la izquierda.
import { PAL, TONE, shade, tint, seeded } from './palette.js'
import { dot, makeCanvas, noise, outline, rect } from './pixelKit.js'

const [WOOD0, WOOD1, WOOD2, WOOD3] = TONE.wood
const [WALL0, WALL1, WALL2] = TONE.wall
const [STONE0, STONE1, STONE2] = TONE.stone

// Árbol de copa irregular: racimos de hojas con luz arriba a la izquierda y tronco con raíces.
const LEAVES = [
  ['#2e5a3a', '#4a8040', '#6a9a46', '#8cb44a', '#b0cc58'],
  TONE.grass,
  TONE.blossom,
]
const CLUMPS = [[22, 14, 11], [11, 22, 10], [33, 22, 10], [16, 32, 10], [28, 32, 10], [22, 26, 11]]

export function treeSprite(variant = 0) {
  const leaf = LEAVES[variant % LEAVES.length]
  const seed = 5 + variant * 7
  const canvas = makeCanvas(44, 60)
  const g = canvas.getContext('2d')
  rect(g, 18, 40, 8, 18, WOOD1)
  rect(g, 17, 54, 10, 4, WOOD1)
  rect(g, 15, 56, 4, 2, WOOD1)
  rect(g, 25, 56, 4, 2, WOOD1)
  rect(g, 18, 40, 3, 16, WOOD2)
  rect(g, 24, 42, 2, 16, WOOD0)
  rect(g, 19, 44, 1, 5, WOOD3)
  CLUMPS.forEach(([cx, cy, r]) => {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const dx = x - cx
        const dy = y - cy
        const dist = Math.hypot(dx, dy) + (noise(x, y, 2.2, seed) - 0.5) * 2.6
        if (dist > r) continue
        const light = (-dx * 0.7 - dy * 0.9) / r + (noise(x, y, 3, seed + 4) - 0.5) * 0.7
        const tone = light < -0.55 ? 0 : light < -0.1 ? 1 : light < 0.35 ? 2 : light < 0.7 ? 3 : 4
        dot(g, x, y, leaf[tone])
      }
    }
  })
  const rand = seeded(seed)
  for (let i = 0; i < 26; i++) {
    const x = 6 + Math.floor(rand() * 32)
    const y = 8 + Math.floor(rand() * 34)
    dot(g, x, y, leaf[4])
    dot(g, x + 1, y, leaf[3])
  }
  return outline(canvas)
}

// Casa de pueblo de 4×4 teselas: tejado de tejas, postigos, jardineras y cimiento de piedra.
export function houseSprite({ roof = PAL.tile, shutter = PAL.teal, chimney = true, glow = false } = {}) {
  const canvas = makeCanvas(64, 64)
  const g = canvas.getContext('2d')
  const r = [shade(roof, 0.55), shade(roof, 0.78), roof, tint(roof, 0.28)]
  const s = [shade(shutter, 0.7), shutter, tint(shutter, 0.3)]

  if (chimney) {
    rect(g, 47, 2, 9, 24, STONE1)
    rect(g, 47, 2, 3, 24, STONE2)
    rect(g, 54, 2, 2, 24, STONE0)
    rect(g, 45, 0, 13, 3, STONE2)
    rect(g, 45, 3, 13, 1, STONE0)
    for (let y = 7; y < 24; y += 4) rect(g, 47, y, 9, 1, STONE0)
  }

  // Paredes con sombra bajo el alero, esquinas de madera y cimiento
  rect(g, 4, 30, 56, 30, WALL1)
  rect(g, 4, 30, 56, 4, WALL0)
  rect(g, 4, 34, 56, 1, '#d8c496')
  rect(g, 4, 30, 3, 30, WOOD1)
  rect(g, 57, 30, 3, 30, WOOD0)
  rect(g, 4, 30, 1, 30, WOOD2)
  rect(g, 5, 55, 54, 6, STONE1)
  for (let x = 5; x < 59; x += 7) rect(g, x + ((x / 7) % 2 ? 3 : 0), 55, 1, 6, STONE0)
  rect(g, 5, 55, 54, 1, STONE2)
  rect(g, 5, 60, 54, 1, STONE0)

  // Tejado en filas de tejas, cada fila desfasada
  for (let row = 0; row < 7; row++) {
    const y = 8 + row * 4
    const left = 19 - row * 3
    const right = 45 + row * 3
    rect(g, left, y, right - left, 4, r[2])
    rect(g, left, y + 3, right - left, 1, r[0])
    rect(g, left, y, right - left, 1, r[3])
    for (let x = left + (row % 2) * 3; x < right; x += 6) {
      rect(g, x, y + 1, 1, 3, r[1])
      rect(g, x + 1, y + 1, 1, 1, r[3])
    }
    rect(g, left, y, 2, 4, r[3])
    rect(g, right - 2, y, 2, 4, r[1])
  }
  rect(g, 19, 7, 26, 2, r[3])

  // Puerta con arco y escalón de piedra
  rect(g, 26, 41, 12, 19, WOOD0)
  rect(g, 27, 40, 10, 1, WOOD0)
  rect(g, 28, 39, 8, 1, WOOD0)
  rect(g, 27, 42, 10, 18, glow ? PAL.saffron : WOOD2)
  rect(g, 28, 41, 8, 1, glow ? PAL.saffron : WOOD2)
  for (let x = 29; x < 37; x += 3) rect(g, x, 42, 1, 18, glow ? PAL.tile : WOOD1)
  rect(g, 27, 42, 1, 18, glow ? PAL.saffronLight : WOOD3)
  rect(g, 34, 51, 2, 2, PAL.saffron)
  dot(g, 34, 51, PAL.saffronLight)
  rect(g, 24, 60, 16, 3, STONE2)
  rect(g, 24, 62, 16, 1, STONE0)

  // Ventanas con postigos y jardinera de flores
  const bloom = [PAL.rose, '#f6f0e0', PAL.saffron, PAL.rose, '#b8a2e0']
  ;[10, 42].forEach((x) => {
    rect(g, x - 4, 38, 3, 14, s[1])
    rect(g, x - 4, 38, 1, 14, s[2])
    rect(g, x - 2, 38, 1, 14, s[0])
    rect(g, x + 12, 38, 3, 14, s[1])
    rect(g, x + 12, 38, 1, 14, s[2])
    rect(g, x + 14, 38, 1, 14, s[0])
    rect(g, x - 1, 37, 14, 16, WOOD1)
    rect(g, x - 1, 37, 14, 1, WOOD3)
    rect(g, x, 38, 12, 14, '#6fb3c6')
    rect(g, x, 38, 12, 5, '#9fd6e0')
    rect(g, x + 5, 38, 2, 14, WOOD1)
    rect(g, x, 44, 12, 2, WOOD1)
    dot(g, x + 1, 39, '#ffffff')
    dot(g, x + 2, 40, '#ffffff')
    rect(g, x - 2, 53, 16, 3, WOOD1)
    rect(g, x - 2, 53, 16, 1, WOOD2)
    rect(g, x - 2, 55, 16, 1, WOOD0)
    ;[0, 3, 6, 9, 12].forEach((o, i) => {
      dot(g, x - 1 + o, 52, bloom[i])
      dot(g, x + o, 52, TONE.grass[2])
    })
  })
  return outline(canvas, 0.5)
}

// Mazmorra del blog: montículo de roca con musgo, flores y un arco con antorchas.
export function dungeonSprite() {
  const w = 80
  const h = 52
  const canvas = makeCanvas(w, h)
  const g = canvas.getContext('2d')
  const rock = ['#46446a', '#5c5a7a', '#7a789a', '#9896b8']
  const [G0, , G2, G3, G4] = TONE.grass

  for (let x = 0; x < w; x++) {
    const d = (x - w / 2) / (w / 2)
    const top = h - (Math.round(44 * Math.sqrt(Math.max(0, 1 - d * d))) + 6)
    for (let y = top; y < h; y++) {
      const nx = (x - w / 2) / (w / 2)
      const ny = (y - h) / 46
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
      const light = -nx * 0.55 - ny * 0.5 + nz * 0.45 + (noise(x, y, 3, 21) - 0.5) * 0.45
      dot(g, x, y, light < 0.2 ? rock[0] : light < 0.55 ? rock[1] : light < 0.85 ? rock[2] : rock[3])
      // Musgo en la parte alta del montículo
      if (y - top < 5 + noise(x, 0, 4, 22) * 6) {
        const m = noise(x, y, 2.4, 23)
        dot(g, x, y, m < 0.3 ? G0 : m < 0.65 ? G2 : m < 0.88 ? G3 : G4)
      }
    }
  }
  // Grietas de la roca
  const rand = seeded(77)
  for (let i = 0; i < 46; i++) {
    const x = 6 + Math.floor(rand() * 68)
    const y = 14 + Math.floor(rand() * 34)
    dot(g, x, y, rock[0])
    dot(g, x + 1, y, rock[0])
    dot(g, x, y - 1, rock[3])
  }
  // Flores en el musgo
  ;[[24, 14], [54, 10], [40, 6], [62, 17]].forEach(([x, y], i) => {
    dot(g, x, y, i % 2 ? PAL.rose : '#f6f0e0')
    dot(g, x + 1, y, i % 2 ? '#f6f0e0' : PAL.rose)
    dot(g, x, y - 1, PAL.saffron)
  })
  // Arco de entrada con borde de piedra clara
  rect(g, 28, 24, 24, 28, rock[3])
  rect(g, 30, 21, 20, 3, rock[3])
  rect(g, 33, 19, 14, 2, rock[3])
  rect(g, 30, 26, 20, 26, '#14122a')
  rect(g, 32, 23, 16, 4, '#14122a')
  rect(g, 35, 21, 10, 2, '#14122a')
  rect(g, 34, 36, 12, 16, '#0e0c20')
  // Antorchas a los lados
  ;[22, 56].forEach((x) => {
    rect(g, x, 32, 2, 10, WOOD1)
    rect(g, x - 1, 28, 4, 4, PAL.saffron)
    rect(g, x, 30, 2, 2, PAL.tile)
    rect(g, x, 27, 2, 2, PAL.saffronLight)
  })
  return outline(canvas, 0.5)
}

// Cartel de madera de la plaza.
export function signpostSprite() {
  const canvas = makeCanvas(16, 22)
  const g = canvas.getContext('2d')
  rect(g, 7, 9, 3, 12, WOOD1)
  rect(g, 7, 9, 1, 12, WOOD2)
  rect(g, 2, 2, 12, 8, WOOD2)
  rect(g, 2, 2, 12, 1, WOOD3)
  rect(g, 2, 9, 12, 1, WOOD1)
  // Flecha hacia el norte, donde está el Taller.
  rect(g, 8, 4, 1, 5, WOOD0)
  rect(g, 7, 5, 3, 1, WOOD0)
  rect(g, 6, 6, 5, 1, WOOD0)
  dot(g, 4, 20, PAL.rose)
  dot(g, 12, 20, PAL.saffron)
  return outline(canvas)
}

export function shadowSprite(w = 10, h = 4) {
  const canvas = makeCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(24,48,36,0.38)'
  for (let y = 0; y < h; y++) {
    const inset = Math.abs(y - (h - 1) / 2) > h / 2 - 1 ? 2 : 0
    ctx.fillRect(inset, y, w - inset * 2, 1)
  }
  return canvas
}
