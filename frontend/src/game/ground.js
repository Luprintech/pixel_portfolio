// Pinta el suelo del valle entero en un solo lienzo: hierba con manchas, caminos de tierra
// con borde irregular, plaza empedrada y laguna con orilla. Sin dependencias de Phaser.
import { TONE, seeded } from './palette.js'
import { dot, hash2, makeCanvas, noise } from './pixelKit.js'

const [G0, G1, G2, G3, G4] = TONE.grass
const [E0, E1, E2, E3, E4] = TONE.earth
const [W0, W1, W2, W3, W4] = TONE.water
const [SAND_DARK, SAND] = TONE.sand
const [STONE0, STONE1, STONE2] = TONE.stone
const WALL1 = TONE.wall[1]

// Distancia con signo (en píxeles) al borde de una región hecha de teselas: positiva dentro,
// negativa fuera. Solo mira las teselas vecinas, que basta porque el borde se difumina pocos píxeles.
function signedDistance(px, py, tile, has) {
  const cx = px + 0.5
  const cy = py + 0.5
  const tx = Math.floor(px / tile)
  const ty = Math.floor(py / tile)
  const inside = has(tx, ty)
  let best = Infinity
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (has(tx + dx, ty + dy) === inside) continue
      const x0 = (tx + dx) * tile
      const y0 = (ty + dy) * tile
      const ox = Math.max(x0 - cx, 0, cx - (x0 + tile))
      const oy = Math.max(y0 - cy, 0, cy - (y0 + tile))
      best = Math.min(best, Math.hypot(ox, oy))
    }
  }
  if (best === Infinity) return inside ? 99 : -99
  return inside ? best : -best
}

const PETALS = [['#f6f0e0', '#f2b134'], ['#f29bb4', '#f6f0e0'], ['#b8a2e0', '#f6f0e0'], ['#f2b134', '#d4503a']]

// Mata de hierba: tres píxeles con base oscura y puntas claras.
export function drawTuft(ctx, x, y) {
  dot(ctx, x, y, G0)
  dot(ctx, x - 1, y - 1, G3)
  dot(ctx, x + 1, y - 2, G4)
  dot(ctx, x + 1, y - 1, G2)
}

// `sway` desplaza solo la corola (-1, 0 o 1): el tallo queda fijo, como una flor que se mece.
export function drawFlower(ctx, x, y, kind, sway = 0) {
  const [petal, heart] = PETALS[kind % PETALS.length]
  dot(ctx, x, y + 1, G0)
  dot(ctx, x, y + 2, G0)
  dot(ctx, x - 1 + sway, y, petal)
  dot(ctx, x + 1 + sway, y, petal)
  dot(ctx, x + sway, y - 1, petal)
  dot(ctx, x + sway, y, heart)
}

export function grassColor(x, y) {
  const t = noise(x, y, 9, 1) * 0.6 + noise(x, y, 3.5, 2) * 0.4
  if (t < 0.2) return G0
  if (t < 0.48) return G1
  if (t < 0.76) return G2
  if (t < 0.9) return G3
  return G4
}

function pathColor(x, y, depth) {
  if (depth < 1) return E0
  if (depth < 2.4) return noise(x, y, 2, 6) > 0.5 ? E1 : E0
  const t = noise(x, y, 5, 7) * 0.7 + noise(x, y, 2, 8) * 0.3
  if (t < 0.35) return E1
  return t < 0.7 ? E2 : E3
}

// Adoquín: piedras de 6×4 desfasadas por filas, con la junta oscura y un tono propio por piedra.
function plazaColor(x, y, depth) {
  if (depth < 1) return E0
  const row = Math.floor(y / 4)
  const col = Math.floor((x + (row % 2) * 3) / 6)
  const inRowEdge = y % 4 === 3
  const inColEdge = (x + (row % 2) * 3) % 6 === 5
  if (inRowEdge || inColEdge) return '#a89874'
  const stone = hash2(col, row, 4)
  return stone < 0.3 ? WALL1 : stone < 0.75 ? '#d6c08f' : '#c7b283'
}

function waterColor(x, y, depth) {
  if (depth < 2) return W3
  const sparkle = (x * 3 + y * 7) % 53 === 0 || (x + y * 5) % 67 === 0
  if (sparkle) return W4
  if (depth < 5) return W2
  return depth < 9 ? W1 : W0
}

export function paintGround(ctx, { cols, rows, tile, roads, plaza, lake }) {
  const width = cols * tile
  const height = rows * tile
  const isRoad = (tx, ty) => roads.has(`${tx},${ty}`)
  const isPlaza = (tx, ty) => plaza.has(`${tx},${ty}`)
  const isLake = (tx, ty) => tx >= lake.x && tx < lake.x + lake.w && ty >= lake.y && ty < lake.y + lake.h
  const grassMask = new Uint8Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const wobble = (noise(x, y, 6, 11) - 0.5) * 3.2
      const sdLake = signedDistance(x, y, tile, isLake) + wobble
      if (sdLake > 0) {
        dot(ctx, x, y, waterColor(x, y, sdLake))
        continue
      }
      if (sdLake > -3.5) {
        dot(ctx, x, y, sdLake > -1.5 ? SAND_DARK : SAND)
        continue
      }
      const sdPlaza = signedDistance(x, y, tile, isPlaza) + wobble * 0.3
      if (sdPlaza > 0) {
        dot(ctx, x, y, plazaColor(x, y, sdPlaza))
        continue
      }
      const sdRoad = signedDistance(x, y, tile, isRoad) + wobble
      if (sdRoad > 0) {
        dot(ctx, x, y, pathColor(x, y, sdRoad))
        if (hash2(x, y, 9) > 0.992) dot(ctx, x, y, hash2(x, y, 10) > 0.5 ? E4 : E0)
        continue
      }
      dot(ctx, x, y, grassColor(x, y))
      grassMask[y * width + x] = 1
    }
  }

  const onGrass = (x, y) => x >= 3 && y >= 4 && x < width - 3 && y < height - 3 && grassMask[y * width + x] === 1
  const rand = seeded(31)

  for (let i = 0; i < (width * height) / 55; i++) {
    const x = Math.floor(rand() * width)
    const y = Math.floor(rand() * height)
    if (onGrass(x, y)) drawTuft(ctx, x, y)
  }

  // Flores en pequeños grupos: se ven más naturales que repartidas una a una.
  for (let c = 0; c < 70; c++) {
    const cx = Math.floor(rand() * width)
    const cy = Math.floor(rand() * height)
    const kind = Math.floor(rand() * PETALS.length)
    const count = 3 + Math.floor(rand() * 4)
    for (let k = 0; k < count; k++) {
      const x = cx + Math.floor((rand() - 0.5) * 22)
      const y = cy + Math.floor((rand() - 0.5) * 14)
      if (onGrass(x, y) && onGrass(x - 2, y) && onGrass(x + 2, y)) drawFlower(ctx, x, y, rand() > 0.25 ? kind : kind + 1)
    }
  }

  // Piedrecitas sueltas.
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(rand() * width)
    const y = Math.floor(rand() * height)
    if (!onGrass(x, y) || !onGrass(x + 1, y + 1)) continue
    dot(ctx, x, y, STONE2)
    dot(ctx, x + 1, y, STONE1)
    dot(ctx, x, y + 1, STONE0)
    dot(ctx, x + 1, y + 1, STONE0)
  }
}

// Camino de tierra que sigue una línea quebrada, con el mismo borde irregular que los del valle.
// Sirve para las ilustraciones, donde el camino no encaja en la cuadrícula de teselas.
export function paintRoute(ctx, width, height, points, half = 8) {
  const distance = (x, y) => {
    let best = Infinity
    for (let i = 0; i < points.length - 1; i++) {
      const [ax, ay] = points[i]
      const [bx, by] = points[i + 1]
      const dx = bx - ax
      const dy = by - ay
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
      best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)))
    }
    return best
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const reach = half + 2 * Math.sin(x / 11) + 1.5 * Math.sin(y / 5 + x / 17) + (noise(x, y, 3, 5) - 0.5) * 3
      const depth = reach - distance(x, y)
      if (depth < 0) continue
      dot(ctx, x, y, pathColor(x, y, depth))
      if (hash2(x, y, 9) > 0.985) dot(ctx, x, y, hash2(x, y, 10) > 0.5 ? E4 : E0)
    }
  }
}

// Devuelve el suelo ya pintado como un lienzo, listo para convertirlo en textura.
export function groundCanvas(options) {
  const canvas = makeCanvas(options.cols * options.tile, options.rows * options.tile)
  paintGround(canvas.getContext('2d'), options)
  return canvas
}
