// Ilustración de la pantalla de título: el valle con su día y su noche, en 320×180 (la misma escala que
// el juego) y con los mismos sprites que el mundo, para que portada y juego se vean como uno solo.
// El paisaje se dibuja una vez; el cielo, el tiempo y lo vivo se pintan encima en cada fotograma.
import { PAL, TONE, seeded } from './palette.js'
import { drawFlower, drawTuft, grassColor, paintRoute } from './ground.js'
import { dot, ellipse, makeCanvas, noise, rect } from './pixelKit.js'
import { lupeFrame } from './lupePoses.js'
import { LEAF_COLORS, buildAutumnLand } from './titleAutumn.js'
import { dungeonSprite, houseSprite, shadowSprite, treeSprite } from './sprites.js'
import { khalessiCanvas, khalessiSitCanvas } from './pets/index.js'
import {
  STILL_MS,
  birdsAt,
  butterfliesAt,
  cloudsAt,
  firefliesAt,
  flowerSway,
  isBlinking,
  petalsAt,
  shootingStar,
  smokeAt,
  starAlpha,
} from './titleMotion.js'
import { CAT_HOME, standAt } from './titleCat.js'
import { eventsBetween, lifeAt } from './titleLife.js'
import { butterfliesOut, mixHex, skyAt, strikesBetween, windowsLit } from './titleSky.js'
import { paintCelestial, paintLightning, paintRain, paintSky, paintTint } from './titleSkyPaint.js'

export const TITLE_W = 320
export const TITLE_H = 180

const HORIZON = 112
// Dónde está Lupe en la portada: fija junto a la casa. Su cabeza queda en (LUPE_X + 9, LUPE_Y).
export const LUPE_X = 190
export const LUPE_Y = 118
const MEADOW_TOP = 120
const [G0, G1, , G3] = TONE.grass

const hillTop = (x) => 100 + Math.round(5 * Math.sin(x / 28 + 0.5) + 2 * Math.sin(x / 9))

// Posiciones de las estrellas fijas: se dibujan en cada fotograma para que titilen.
const STARS = (() => {
  const rand = seeded(8)
  return Array.from({ length: 16 }, () => ({ x: Math.floor(rand() * TITLE_W), y: 2 + Math.floor(rand() * 46) }))
})()

function paintStars(g, ms, still, visibility) {
  STARS.forEach(({ x, y }, i) => {
    g.globalAlpha = (still ? 0.8 : starAlpha(i, ms)) * visibility
    dot(g, x, y, '#f1e6cf')
    if (i % 4 === 0) {
      ;[[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, '#b8a2e0'))
    }
  })
  g.globalAlpha = 1
}

// Nubes redondas con la parte baja más oscura. Toman el color del cielo que tienen detrás y, cuando
// el cielo se cubre, se vuelven grises.
function paintCloud(g, x, y, scale, sky) {
  const overcast = Math.min(1, Math.max(0, (sky.cloud - 0.6) / 0.4))
  const body = mixHex(mixHex(sky.bands[3], '#ffffff', 0.55), '#8d8aa8', overcast * 0.7)
  const shade = mixHex(mixHex(sky.bands[3], '#5c5a7a', 0.35), '#5c5a7a', overcast * 0.6)
  const puff = (dx, dy, rx, ry, color) => ellipse(g, x + dx * scale, y + dy * scale, rx * scale, ry * scale, color)
  ;[[shade, 1.2], [body, 0]].forEach(([color, drop]) => {
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
function meadow(g, withFlowers) {
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
    if (withFlowers) drawFlower(g, x, y, i % 4)
  }
  const moving = []
  while (moving.length < 22) {
    const { x, y } = inMeadow()
    const [r, gr] = g.getImageData(x, y, 1, 1).data
    if (gr > r) moving.push({ x, y, kind: moving.length % 4 })
  }
  return moving
}


// Paisaje completo del valle. Sin flores es la base del bioma de otoño.
function buildLand(withFlowers) {
  const land = makeCanvas(TITLE_W, TITLE_H)
  const g = land.getContext('2d')
  mountains(g)
  hill(g)
  const flowers = meadow(g, withFlowers)

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
  return { land, flowers }
}

const RAINBOW = ['#e8504a', '#f2a33a', '#f2d84a', '#62b04a', '#4aa8d8', '#5a62c8', '#9a5ab8']

// Arco de siete franjas de dos píxeles; sus extremos se esconden tras la colina.
function buildRainbow() {
  const canvas = makeCanvas(TITLE_W, HORIZON + 12)
  const g = canvas.getContext('2d')
  const cx = 200
  const cy = 138
  const outer = 98
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < TITLE_W; x++) {
      const band = Math.floor((outer - Math.hypot(x - cx, y - cy)) / 2)
      if (band >= 0 && band < RAINBOW.length) dot(g, x, y, RAINBOW[band])
    }
  }
  return canvas
}

let cache = null

// Todo lo que no cambia entre fotogramas se dibuja una sola vez: el valle de primavera, el de otoño
// y el arcoíris.
function buildLayers() {
  const spring = buildLand(true)
  const autumn = buildAutumnLand(buildLand(false).land)
  return { land: spring.land, autumn, flowers: spring.flowers, rainbow: buildRainbow() }
}

// Mariposa de dos o cuatro píxeles de ala, según la tenga abierta o cerrada.
const WINGS = [['#f6c9d8', '#e07a9c'], ['#f8d77a', '#f2b134'], ['#b8a2e0', '#7a3f8f']]
function paintButterfly(g, { x, y, open, kind }) {
  const [light, dark] = WINGS[kind]
  const px = Math.round(x)
  const py = Math.round(y)
  dot(g, px, py, '#2e2d5a')
  if (open) {
    rect(g, px - 2, py - 1, 2, 2, light)
    rect(g, px + 1, py - 1, 2, 2, light)
    dot(g, px - 2, py, dark)
    dot(g, px + 2, py, dark)
  } else {
    dot(g, px - 1, py - 1, dark)
    dot(g, px + 1, py - 1, light)
  }
}

// Casita lejana de la colina: cuerpo de 6 píxeles, tejado de tres filas y una ventana.
const farHouseBase = (x, w) => Math.max(...Array.from({ length: w }, (_, k) => hillTop(x + k))) + 1

function farHouse(g, x, w, roof) {
  const y = farHouseBase(x, w)
  rect(g, x, y, w, 6, TONE.wall[0])
  for (let i = 0; i < 3; i++) rect(g, x + 2 - i, y - 3 + i, w - 4 + 2 * i, 1, roof)
  rect(g, x + w - 4, y + 2, 2, 4, '#5a3a28')
  rect(g, x + 2, y + 2, 2, 2, '#6fb3c6')
}

// Las ventanas encendidas se pintan al final, ya sin el oscurecimiento: de noche son lo más claro.
const lightFarWindow = (g, x, w) => rect(g, x + 2, farHouseBase(x, w) + 2, 2, 2, PAL.saffronLight)

// La aldea queda a la izquierda de la herrería, fuera de la zona que tapa el menú en pantallas anchas.
const FAR_HOUSES = [
  [86, 8, PAL.tile],
  [100, 10, '#2f8f8b'],
  [116, 8, '#9b6bb5'],
]

// La escena guarda los sprites ya dibujados; `draw(ms, still)` pinta un fotograma y devuelve el estado
// del cielo (para el sonido ambiente) con los truenos que toca oír. `seed` fija el día de la visita.
// Con `still` (movimiento reducido) solo se dibuja la imagen en reposo.
export function createTitleScene(canvas, seed) {
  if (!cache) cache = buildLayers()
  const g = canvas.getContext('2d')
  g.imageSmoothingEnabled = false

  const cats = new Map()
  const catSprite = (frame, tail, sit) => {
    const key = `${frame}${tail}${sit}`
    if (!cats.has(key)) cats.set(key, sit ? khalessiSitCanvas(sit === 'wash', tail) : khalessiCanvas(frame, tail))
    return cats.get(key)
  }

  // `lift` despega a la gata del suelo (salto o zarpazo): la sombra se queda donde estaba.
  function drawCat(ms, still, cat, petted) {
    const jumping = cat.lift > 0.5
    const frame = cat.walking || jumping ? Math.floor(ms / 170) % 2 : 0
    // Sentada, el segundo fotograma es el vaivén de la cola o, aseándose, la pata que sube y baja.
    const tail = cat.walking || still ? 0 : Math.floor(ms / (cat.sit === 'wash' ? 380 : petted ? 220 : 550)) % 2
    const x = Math.round(cat.x)
    const y = Math.round(cat.y)
    const top = y - Math.round(cat.lift)
    g.drawImage(shadowSprite(16, 4), x + 3, y + 12)
    if (cat.facing < 0) {
      g.save()
      g.translate(x + 26, 0)
      g.scale(-1, 1)
      g.drawImage(catSprite(frame, tail, cat.sit), 0, top)
      g.restore()
    } else {
      g.drawImage(catSprite(frame, tail, cat.sit), x, top)
    }
  }

  // Avellana: cuerpo claro de cuatro por tres con contorno oscuro y la tapita arriba; se ve sobre la tierra.
  // Al botar se levanta `lift` píxeles y su sombra se queda en el suelo.
  function drawNut(x, y, lift) {
    const px = Math.round(x)
    const py = Math.round(y)
    const top = py - Math.round(lift)
    if (lift > 0.5) rect(g, px, py + 3, 4, 1, '#2a1a10')
    rect(g, px - 1, top - 1, 6, 5, '#3a2418')
    rect(g, px, top, 4, 3, '#d9a557')
    rect(g, px, top, 4, 1, '#7a4f35')
    dot(g, px + 1, top + 1, '#f6dc9a')
  }

  // Lupe se queda en su sitio: parpadea, saluda con la mano y acaricia a la gata cuando se acerca.
  function drawLupe(ms, still, pose) {
    const step = Math.floor(ms / 260) % 2
    const closed = pose === 'idle' && isBlinking(still ? 1000 : ms)
    g.drawImage(shadowSprite(14, 5), LUPE_X + 7, LUPE_Y + 30)
    g.drawImage(lupeFrame(pose, step, closed), LUPE_X, LUPE_Y)
  }

  let lastMs = 0

  function draw(rawMs, still = false) {
    // El primer fotograma del navegador puede llegar con una marca de tiempo anterior al arranque: nunca negativa.
    const ms = still ? STILL_MS : Math.max(0, rawMs)
    const sky = skyAt(ms, seed, still)
    // Con la pestaña oculta el reloj da un salto: no se recuperan los rayos que hubo mientras tanto.
    const live = !still && ms - lastMs <= 500
    const thunder = live ? strikesBetween(lastMs, ms, seed).map((strike) => strike.delay) : []
    const events = live ? eventsBetween(lastMs, ms) : []
    lastMs = ms

    g.globalAlpha = 1
    paintSky(g, sky)
    const starLight = sky.dark * (1 - sky.cloud * 0.8)
    if (starLight > 0.05) paintStars(g, ms, still, starLight)
    if (!still && starLight > 0.3) {
      const star = shootingStar(ms)
      if (star) paintShootingStar(g, star)
    }
    paintCelestial(g, sky)
    if (sky.rainbow > 0.02) {
      g.globalAlpha = 0.6 * sky.rainbow
      g.drawImage(cache.rainbow, 0, 0)
      g.globalAlpha = 1
    }
    cloudsAt(still ? 0 : ms, sky.cloud).forEach((c) => paintCloud(g, c.x, c.y, c.scale, sky))
    if (!still && sky.dark < 0.6 && sky.rain < 0.3) birdsAt(ms).forEach((b) => paintBird(g, b))
    g.drawImage(cache.land, 0, 0)
    // El otoño se funde por encima de la primavera mientras llueve.
    if (sky.autumn > 0.02) {
      g.globalAlpha = sky.autumn
      g.drawImage(cache.autumn, 0, 0)
      g.globalAlpha = 1
    }

    FAR_HOUSES.forEach(([x, w, roof]) => farHouse(g, x, w, roof))
    smokeAt(still ? 1500 : ms).forEach((s) => {
      g.globalAlpha = s.alpha
      ellipse(g, s.x, s.y, s.r, Math.max(1, s.r - 1), '#d8c8ec')
    })
    g.globalAlpha = 1

    if (sky.autumn < 0.98) {
      g.globalAlpha = 1 - sky.autumn
      cache.flowers.forEach((f, i) => drawFlower(g, f.x, f.y, f.kind, still ? 0 : flowerSway(i, ms)))
      g.globalAlpha = 1
    }

    // La escena de la bienvenida se queda en una pose fija con movimiento reducido.
    const life = lifeAt(ms, (t) => (t === ms ? sky : skyAt(t, seed, still)))
    const pose = still ? 'idle' : life.pose
    const cat = still ? standAt(CAT_HOME) : life.cat
    // En otoño hay avellanas en el suelo, por debajo de todo lo que camina.
    if (sky.autumn > 0.05) {
      g.globalAlpha = sky.autumn
      life.nuts.forEach(([x, y, lift]) => drawNut(x, y, lift))
      g.globalAlpha = 1
    }
    // Quien tiene los pies más abajo se pinta delante.
    if (cat.y + 16 < LUPE_Y + 31) {
      drawCat(ms, still, cat, false)
      drawLupe(ms, still, pose)
    } else {
      drawLupe(ms, still, pose)
      drawCat(ms, still, cat, pose === 'pet')
    }

    if (!still) {
      // Del cerezo caen pétalos en primavera y hojas naranjas en otoño.
      const autumnal = sky.autumn > 0.5
      petalsAt(ms).forEach((p) => {
        const [light, dark] = LEAF_COLORS[p.light ? 0 : 1]
        rect(g, Math.round(p.x), Math.round(p.y), 2, 1, autumnal ? light : p.light ? '#f8bfd0' : '#f09ab6')
        dot(g, p.x + 1, p.y + 1, autumnal ? dark : '#c4577f')
      })
      if (butterfliesOut(sky)) butterfliesAt(ms).forEach((b) => paintButterfly(g, b))
      paintRain(g, sky, ms)
    }
    paintTint(g, sky)

    const lit = windowsLit(sky.gloom)
    FAR_HOUSES.forEach(([x, w], i) => lit > i && lightFarWindow(g, x, w))
    if (lit >= 4) {
      ;[156, 188].forEach((x) => {
        rect(g, x, 98, 12, 14, PAL.saffronLight)
        rect(g, x + 5, 98, 2, 14, '#7a4f35')
        rect(g, x, 104, 12, 2, '#7a4f35')
      })
    }

    if (!still && sky.dark > 0.4 && sky.rain < 0.3) {
      firefliesAt(ms).forEach((f) => {
        if (f.glow < 0.35) return
        g.globalAlpha = 0.35 * f.glow * sky.dark
        rect(g, Math.round(f.x) - 1, Math.round(f.y) - 1, 3, 3, '#f8d77a')
        g.globalAlpha = 1
        dot(g, f.x, f.y, '#fff6a8')
      })
    }
    if (!still) paintLightning(g, ms, seed)

    return { ...sky, thunder, events, life }
  }

  return { draw }
}
