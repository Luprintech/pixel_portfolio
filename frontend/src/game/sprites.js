// Sprites dibujados a mano con mapas de píxeles. Sin ficheros de imagen: todo sale de aquí.
import { PAL, shade, seeded } from './palette.js'

const parse = (rows) => rows.map((row) => row.split(' '))

const makeCanvas = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function paint(ctx, grid, colors, ox = 0, oy = 0) {
  grid.forEach((row, y) =>
    row.forEach((ch, x) => {
      if (ch !== '.' && colors[ch]) {
        ctx.fillStyle = colors[ch]
        ctx.fillRect(ox + x, oy + y, 1, 1)
      }
    }),
  )
}

// Princesa (10×13)
const BODY = [
  '. . o d t t d o . .',
  '. o d d d d d d o .',
  '. o d d t t d d o .',
  'o d d d t t d d d o',
  'o d D d d d d D d o',
  'o t t t t t t t t o',
]
const FEET = [
  '. . o s o o s o . .',
  '. . o o s s o o . .',
]
const HEAD = {
  down: [
    '. . o o o o o o . .',
    '. o h h h h h h o .',
    '. o h c t t c h h o',
    'o h h s s s s h h o',
    'o h h s e s s e h o',
    '. o h s s s s h o .',
  ],
  up: [
    '. . o o o o o o . .',
    '. o h h h h h h o .',
    '. o h c t t c h h o',
    'o h h h h h h h h o',
    'o h h h h h h h h o',
    '. o h h h h h h o .',
  ],
  side: [
    '. . o o o o o o . .',
    '. o h h h h h h o .',
    '. o h h c t t h h o',
    '. o h h s s s s o .',
    '. o h h s s e s o .',
    '. . o h s s s o . .',
  ],
}

export function princessCanvas(look, dir = 'down', frame = 0) {
  const canvas = makeCanvas(10, 13)
  const ctx = canvas.getContext('2d')
  const colors = {
    o: PAL.ink,
    h: look.hair,
    s: look.skin,
    e: PAL.ink,
    c: look.trim,
    t: look.trim,
    d: look.dress,
    D: shade(look.dress),
  }
  const head = HEAD[dir === 'left' || dir === 'right' ? 'side' : dir]
  const body = dir === 'up' ? BODY.map((r) => r.replace(/t/g, 'd')).map((r, i) => (i === 5 ? BODY[5] : r)) : BODY
  paint(ctx, parse([...head, ...body, FEET[frame % 2]]), colors)
  return canvas
}

// Khalessi, gata siamesa tabby (12×9)
const CAT = [
  [
    '. . . . . . . . k . . k',
    '. . . . . . . . k k k k',
    '. . . k . . . . k e k e',
    '. . . k . c c c k k k k',
    '. . k . c b c b c c c .',
    '. . k . c c c c c c c .',
    '. . . k c c c c c c c .',
    '. . . . k c k . k c k .',
    '. . . . k . k . k . k .',
  ],
  [
    '. . . . . . . . k . . k',
    '. . . . . . . . k k k k',
    '. . k . . . . . k e k e',
    '. . k . . c c c k k k k',
    '. . . k c b c b c c c .',
    '. . . k c c c c c c c .',
    '. . . k c c c c c c c .',
    '. . . . k c . k c k . .',
    '. . . . k . . k . k . .',
  ],
]

export function catCanvas(frame = 0) {
  const canvas = makeCanvas(12, 9)
  paint(canvas.getContext('2d'), parse(CAT[frame % 2]), {
    k: '#4a3730',
    c: '#eadbc0',
    b: '#6b5246',
    e: '#5bb4e5',
  })
  return canvas
}

// Terreno
export function grassTile(variant = 0) {
  const canvas = makeCanvas(16, 16)
  const ctx = canvas.getContext('2d')
  const rand = seeded(11 + variant * 97)
  ctx.fillStyle = PAL.moss
  ctx.fillRect(0, 0, 16, 16)
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = rand() > 0.45 ? PAL.meadow : PAL.mossDark
    ctx.fillRect(Math.floor(rand() * 16), Math.floor(rand() * 16), 1, 1)
  }
  if (variant === 2) {
    const flower = [PAL.tile, PAL.saffron, PAL.bone][Math.floor(rand() * 3)]
    const x = 3 + Math.floor(rand() * 9)
    const y = 3 + Math.floor(rand() * 9)
    ctx.fillStyle = flower
    ctx.fillRect(x, y, 2, 1)
    ctx.fillRect(x, y + 1, 1, 1)
    ctx.fillStyle = PAL.mossDark
    ctx.fillRect(x, y + 2, 1, 2)
  }
  return canvas
}

export function pathTile(variant = 0) {
  const canvas = makeCanvas(16, 16)
  const ctx = canvas.getContext('2d')
  const rand = seeded(5 + variant * 31)
  ctx.fillStyle = PAL.earth
  ctx.fillRect(0, 0, 16, 16)
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = rand() > 0.5 ? PAL.earthLight : PAL.earthDark
    ctx.fillRect(Math.floor(rand() * 15), Math.floor(rand() * 15), rand() > 0.6 ? 2 : 1, 1)
  }
  return canvas
}

export function waterTile() {
  const canvas = makeCanvas(16, 16)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = PAL.lagoon
  ctx.fillRect(0, 0, 16, 16)
  ctx.fillStyle = PAL.lagoonLight
  ctx.fillRect(2, 4, 4, 1)
  ctx.fillRect(9, 10, 5, 1)
  return canvas
}

export function treeSprite(variant = 0) {
  const canvas = makeCanvas(18, 26)
  const ctx = canvas.getContext('2d')
  const leaf = variant ? PAL.mossDark : PAL.moss
  const light = variant ? PAL.moss : PAL.meadow
  ctx.fillStyle = PAL.ink
  ctx.fillRect(7, 18, 4, 8)
  ctx.fillStyle = '#6b4430'
  ctx.fillRect(8, 18, 2, 7)
  for (let y = 0; y < 20; y++) {
    const half = Math.round(8 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 10) / 10, 2))))
    ctx.fillStyle = PAL.ink
    ctx.fillRect(9 - half - 1, y, half * 2 + 2, 1)
  }
  for (let y = 1; y < 19; y++) {
    const half = Math.round(8 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 10) / 10, 2))))
    ctx.fillStyle = leaf
    ctx.fillRect(9 - half, y, half * 2, 1)
  }
  ctx.fillStyle = light
  ctx.fillRect(5, 4, 4, 1)
  ctx.fillRect(4, 5, 3, 1)
  ctx.fillRect(11, 8, 2, 1)
  return canvas
}

// Edificios
// Devuelven el canvas y la posición de la puerta (centro inferior) en píxeles.
export function houseSprite({ roof = PAL.tile, roofDark = PAL.tileDark, wall = PAL.wall, chimney = false, glow = false } = {}) {
  const w = 64
  const h = 56
  const canvas = makeCanvas(w, h)
  const ctx = canvas.getContext('2d')
  // Paredes
  ctx.fillStyle = PAL.ink
  ctx.fillRect(4, 24, 56, 32)
  ctx.fillStyle = wall
  ctx.fillRect(5, 24, 54, 30)
  ctx.fillStyle = PAL.wallDark
  ctx.fillRect(5, 52, 54, 2)
  // Tejado en filas, cada fila 2 px más ancha
  for (let i = 0; i < 12; i++) {
    const inset = 14 - i
    const y = 8 + i * 2
    ctx.fillStyle = PAL.ink
    ctx.fillRect(inset - 1, y - 1, w - inset * 2 + 2, 3)
    ctx.fillStyle = i % 2 ? roofDark : roof
    ctx.fillRect(inset, y, w - inset * 2, 2)
  }
  if (chimney) {
    ctx.fillStyle = PAL.ink
    ctx.fillRect(44, 0, 8, 16)
    ctx.fillStyle = PAL.stone
    ctx.fillRect(45, 1, 6, 14)
  }
  // Puerta
  ctx.fillStyle = PAL.ink
  ctx.fillRect(26, 36, 12, 20)
  ctx.fillStyle = glow ? PAL.saffron : '#6b4430'
  ctx.fillRect(28, 38, 8, 18)
  if (glow) {
    ctx.fillStyle = PAL.tile
    ctx.fillRect(30, 44, 4, 12)
  }
  // Ventanas
  ;[10, 44].forEach((x) => {
    ctx.fillStyle = PAL.ink
    ctx.fillRect(x, 32, 10, 10)
    ctx.fillStyle = PAL.saffron
    ctx.fillRect(x + 1, 33, 8, 8)
    ctx.fillStyle = PAL.ink
    ctx.fillRect(x + 4, 33, 2, 8)
    ctx.fillRect(x + 1, 36, 8, 2)
  })
  return canvas
}

export function dungeonSprite() {
  const w = 80
  const h = 52
  const canvas = makeCanvas(w, h)
  const ctx = canvas.getContext('2d')
  const rand = seeded(77)
  for (let x = 0; x < w; x++) {
    const d = (x - w / 2) / (w / 2)
    const height = Math.round(44 * Math.sqrt(Math.max(0, 1 - d * d))) + 6
    ctx.fillStyle = PAL.ink
    ctx.fillRect(x, h - height - 1, 1, height + 1)
    ctx.fillStyle = PAL.stone
    ctx.fillRect(x, h - height, 1, height)
  }
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = rand() > 0.5 ? PAL.stoneLight : PAL.dusk
    ctx.fillRect(Math.floor(8 + rand() * 64), Math.floor(8 + rand() * 40), 2, 1)
  }
  // Arco
  ctx.fillStyle = PAL.ink
  ctx.fillRect(30, 26, 20, 26)
  ctx.fillRect(32, 22, 16, 4)
  ctx.fillRect(35, 19, 10, 3)
  ctx.fillStyle = '#0f0e22'
  ctx.fillRect(32, 28, 16, 24)
  ctx.fillRect(34, 24, 12, 4)
  // Antorchas
  ;[22, 56].forEach((x) => {
    ctx.fillStyle = PAL.ink
    ctx.fillRect(x, 32, 2, 10)
    ctx.fillStyle = PAL.saffron
    ctx.fillRect(x - 1, 28, 4, 4)
    ctx.fillStyle = PAL.tile
    ctx.fillRect(x, 30, 2, 2)
    ctx.fillStyle = PAL.saffronLight
    ctx.fillRect(x, 28, 2, 2)
  })
  return canvas
}

export function shadowSprite(w = 10, h = 4) {
  const canvas = makeCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(28,27,58,0.4)'
  for (let y = 0; y < h; y++) {
    const inset = Math.abs(y - (h - 1) / 2) > 0.8 ? 1 : 0
    ctx.fillRect(inset, y, w - inset * 2, 1)
  }
  return canvas
}
