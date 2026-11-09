// Ilustración de la pantalla de título: el valle al atardecer, en 320×180 (la misma escala que el juego)
// y con los mismos sprites que el mundo, para que portada y juego se vean como uno solo.
// Lo estático se dibuja una vez en dos capas (cielo y paisaje); lo vivo se pinta encima en cada fotograma.
import { PAL, TONE, seeded } from './palette.js'
import { drawFlower, drawTuft, grassColor, paintRoute } from './ground.js'
import { dot, ellipse, makeCanvas, noise, rect } from './pixelKit.js'
import { avatarCanvas } from './avatar/index.js'
import { catCanvas, dungeonSprite, houseSprite, shadowSprite, treeSprite } from './sprites.js'
import {
  STILL_MS,
  birdsAt,
  catAt,
  cloudsAt,
  firefliesAt,
  flowerSway,
  isBlinking,
  lightsLit,
  petalsAt,
  shootingStar,
  smokeAt,
  starAlpha,
} from './titleMotion.js'

export const TITLE_W = 320
export const TITLE_H = 180

const SKY = [
  [0, '#2e2d5a'],
  [26, '#4b4380'],
  [50, '#7a6ab0'],
  [72, '#b58bb8'],
  [88, '#e59a98'],
  [100, '#f2b134'],
]
const HORIZON = 112
const MEADOW_TOP = 120
const [G0, G1, , G3] = TONE.grass

const hillTop = (x) => 100 + Math.round(5 * Math.sin(x / 28 + 0.5) + 2 * Math.sin(x / 9))

// Cielo con las franjas separadas por un tramado de ajedrez de dos filas, a la manera clásica.
function paintSky(g) {
  for (let y = 0; y < HORIZON; y++) {
    let band = 0
    SKY.forEach(([from], i) => {
      if (y >= from) band = i
    })
    for (let x = 0; x < TITLE_W; x++) {
      const blend = band > 0 && y - SKY[band][0] < 2 && (x + y) % 2 === 0
      dot(g, x, y, SKY[blend ? band - 1 : band][1])
    }
  }
  for (let y = -20; y <= 20; y++) {
    for (let x = -20; x <= 20; x++) {
      const d = Math.hypot(x, y)
      if (d <= 20 && 98 + y < HORIZON) dot(g, 236 + x, 98 + y, d > 17 ? '#f8d77a' : PAL.saffronLight)
    }
  }
}

// Posiciones de las estrellas fijas: se dibujan en cada fotograma para que titilen.
const STARS = (() => {
  const rand = seeded(8)
  return Array.from({ length: 16 }, () => ({ x: Math.floor(rand() * TITLE_W), y: 2 + Math.floor(rand() * 46) }))
})()

function paintStars(g, ms, still) {
  STARS.forEach(({ x, y }, i) => {
    g.globalAlpha = still ? 0.8 : starAlpha(i, ms)
    dot(g, x, y, '#f1e6cf')
    if (i % 4 === 0) {
      ;[[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, '#b8a2e0'))
    }
  })
  g.globalAlpha = 1
}

// Nubes redondas con la parte baja más oscura: dan el toque tierno al cielo.
function paintCloud(g, x, y, scale) {
  const puff = (dx, dy, rx, ry, color) => ellipse(g, x + dx * scale, y + dy * scale, rx * scale, ry * scale, color)
  ;[['#c996b8', 1.2], ['#f6c9d8', 0]].forEach(([color, drop]) => {
    puff(0, drop, 16, 5, color)
    puff(-9, -3 + drop, 8, 6, color)
    puff(5, -5 + drop, 10, 7, color)
  })
}

function paintShootingStar(g, star) {
  for (let i = 0; i < 10; i++) {
    g.globalAlpha = Math.max(0, star.alpha * (1 - i / 10))
    dot(g, star.x + star.dx * i * 2.2, star.y + star.dy * i * 2.2, i === 0 ? '#ffffff' : '#fff1c4')
    if (i < 3) dot(g, star.x + star.dx * i * 2.2, star.y + star.dy * i * 2.2 + 1, '#f8d77a')
  }
  g.globalAlpha = 1
}

function paintBird(g, { x, y, wing }) {
  const color = '#2e2d5a'
  if (wing) {
    ;[[-2, 1], [-1, 0], [0, 1], [1, 0], [2, 1]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
  } else {
    ;[[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
  }
}

function mountains(g) {
  for (let x = 0; x < TITLE_W; x++) {
    const far = 96 - Math.round(20 + 16 * Math.sin(x / 41 + 1) + 7 * Math.sin(x / 13))
    rect(g, x, far, 1, HORIZON - far, '#5a4f94')
    dot(g, x, far, '#8573b8')
    const near = 106 - Math.round(10 + 9 * Math.sin(x / 29 + 3) + 4 * Math.sin(x / 9))
    rect(g, x, near, 1, HORIZON - near, '#3f3a78')
    dot(g, x, near, '#6a5aa0')
  }
}

// Colina del fondo, más oscura que el prado para dar distancia.
function hill(g) {
  for (let x = 0; x < TITLE_W; x++) {
    const top = hillTop(x)
    for (let y = top; y < 130; y++) dot(g, x, y, noise(x, y, 4, 3) > 0.55 ? G1 : G0)
    dot(g, x, top, G3)
  }
}

// Pinta el prado y devuelve las posiciones donde las flores pueden mecerse (sobre hierba, no sobre el camino).
function meadow(g) {
  const rand = seeded(14)
  for (let x = 0; x < TITLE_W; x++) {
    const top = MEADOW_TOP + Math.round(3 * Math.sin(x / 25) + 2 * Math.sin(x / 8))
    for (let y = top; y < TITLE_H; y++) dot(g, x, y, grassColor(x, y))
  }
  paintRoute(g, TITLE_W, TITLE_H, [[40, 190], [110, 168], [178, 145], [178, 126]], 9)
  const inMeadow = () => ({
    x: 4 + Math.floor(rand() * (TITLE_W - 8)),
    y: MEADOW_TOP + 8 + Math.floor(rand() * (TITLE_H - MEADOW_TOP - 14)),
  })
  for (let i = 0; i < 260; i++) {
    const { x, y } = inMeadow()
    drawTuft(g, x, y)
  }
  for (let i = 0; i < 46; i++) {
    const { x, y } = inMeadow()
    drawFlower(g, x, y, i % 4)
  }
  const moving = []
  while (moving.length < 22) {
    const { x, y } = inMeadow()
    const [r, gr] = g.getImageData(x, y, 1, 1).data
    if (gr > r) moving.push({ x, y, kind: moving.length % 4 })
  }
  return moving
}

let cache = null

// Todo lo que no cambia entre fotogramas se dibuja una sola vez, en dos capas.
function buildLayers() {
  const sky = makeCanvas(TITLE_W, TITLE_H)
  paintSky(sky.getContext('2d'))

  const land = makeCanvas(TITLE_W, TITLE_H)
  const g = land.getContext('2d')
  mountains(g)
  hill(g)
  const flowers = meadow(g)

  const tree = (variant, x, baseY) => {
    g.drawImage(shadowSprite(30, 7), x + 7, baseY - 6)
    g.drawImage(treeSprite(variant), x, baseY - 58)
  }
  tree(1, 40, 160)
  g.drawImage(shadowSprite(70, 8), 143, 118)
  g.drawImage(houseSprite({ roof: '#5c5a7a', shutter: PAL.tile, glow: true }), 146, 60)
  g.drawImage(shadowSprite(70, 8), 232, 118)
  g.drawImage(dungeonSprite(), 232, 72)
  tree(2, 284, 156)
  return { sky, land, flowers }
}

// Casita lejana de la colina: cuerpo de 6 píxeles, tejado de tres filas y una ventana.
function farHouse(g, x, w, roof, lit) {
  let base = 0
  for (let k = 0; k < w; k++) base = Math.max(base, hillTop(x + k))
  const y = base + 1
  rect(g, x, y, w, 6, TONE.wall[0])
  for (let i = 0; i < 3; i++) rect(g, x + 2 - i, y - 3 + i, w - 4 + 2 * i, 1, roof)
  rect(g, x + w - 4, y + 2, 2, 4, '#5a3a28')
  rect(g, x + 2, y + 2, 2, 2, lit ? PAL.saffronLight : '#6fb3c6')
}

// La aldea queda a la izquierda de la herrería, fuera de la zona que tapa el menú en pantallas anchas.
const FAR_HOUSES = [
  [86, 8, PAL.tile],
  [100, 10, '#2f8f8b'],
  [116, 8, '#9b6bb5'],
]

// La escena guarda los sprites ya dibujados; `draw(ms, still)` pinta un fotograma.
// Con `still` (movimiento reducido) solo se dibuja la imagen en reposo.
export function createTitleScene(canvas, look) {
  if (!cache) cache = buildLayers()
  const g = canvas.getContext('2d')
  g.imageSmoothingEnabled = false

  const princess = { open: avatarCanvas(look, 'down', 0), closed: avatarCanvas(look, 'down', 0, true) }
  const cats = new Map()
  const catSprite = (frame, tail) => {
    const key = `${frame}${tail}`
    if (!cats.has(key)) cats.set(key, catCanvas(frame, tail))
    return cats.get(key)
  }

  function draw(rawMs, still = false) {
    // El primer fotograma del navegador puede llegar con una marca de tiempo anterior al arranque: nunca negativa.
    const ms = still ? STILL_MS : Math.max(0, rawMs)
    g.globalAlpha = 1
    g.drawImage(cache.sky, 0, 0)
    paintStars(g, ms, still)
    if (!still) {
      const star = shootingStar(ms)
      if (star) paintShootingStar(g, star)
    }
    cloudsAt(still ? 0 : ms).forEach((c) => paintCloud(g, c.x, c.y, c.scale))
    if (!still) birdsAt(ms).forEach((b) => paintBird(g, b))
    g.drawImage(cache.land, 0, 0)

    const lit = lightsLit(ms)
    FAR_HOUSES.forEach(([x, w, roof], i) => farHouse(g, x, w, roof, lit > i))
    if (lit >= 4) {
      ;[156, 188].forEach((x) => {
        rect(g, x, 98, 12, 14, PAL.saffronLight)
        rect(g, x + 5, 98, 2, 14, '#7a4f35')
        rect(g, x, 104, 12, 2, '#7a4f35')
      })
    }

    smokeAt(still ? 1500 : ms).forEach((s) => {
      g.globalAlpha = s.alpha
      ellipse(g, s.x, s.y, s.r, Math.max(1, s.r - 1), '#d8c8ec')
    })
    g.globalAlpha = 1

    cache.flowers.forEach((f, i) => drawFlower(g, f.x, f.y, f.kind, still ? 0 : flowerSway(i, ms)))

    g.drawImage(shadowSprite(14, 5), 193, 147)
    g.drawImage(isBlinking(still ? 1000 : ms) ? princess.closed : princess.open, 186, 117)

    const cat = catAt(still ? 0 : ms)
    const frame = cat.walking ? Math.floor(ms / 170) % 2 : 0
    const tail = cat.walking || still ? 0 : Math.floor(ms / 550) % 2
    const x = Math.round(cat.x)
    g.drawImage(shadowSprite(16, 4), x + 3, 148)
    if (cat.facing < 0) {
      g.save()
      g.translate(x + 26, 0)
      g.scale(-1, 1)
      g.drawImage(catSprite(frame, tail), 0, 136)
      g.restore()
    } else {
      g.drawImage(catSprite(frame, tail), x, 136)
    }

    if (!still) {
      petalsAt(ms).forEach((p) => {
        rect(g, Math.round(p.x), Math.round(p.y), 2, 1, p.light ? '#f8bfd0' : '#f09ab6')
        dot(g, p.x + 1, p.y + 1, '#c4577f')
      })
      firefliesAt(ms).forEach((f) => {
        if (f.glow < 0.35) return
        g.globalAlpha = 0.35 * f.glow
        rect(g, Math.round(f.x) - 1, Math.round(f.y) - 1, 3, 3, '#f8d77a')
        g.globalAlpha = 1
        dot(g, f.x, f.y, '#fff6a8')
      })
    }
  }

  return { draw }
}
