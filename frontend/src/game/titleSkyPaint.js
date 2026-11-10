// Dibujo del cielo y del tiempo de la portada. Recibe el estado de titleSky.js y pinta en el canvas
// de 320×180: franjas con tramado, sol y luna, lluvia, rayos y el oscurecimiento de la hora.
import { PAL, seeded } from './palette.js'
import { dot, ellipse, hash2, rect } from './pixelKit.js'
import { starAlpha } from './titleMotion.js'
import { BAND_STARTS, HORIZON, lightningAt, mixHex, rainDrops, snowFlakes } from './titleSky.js'

const WIDTH = 320
const HEIGHT = 180

// Posiciones de estrellas fijas, repartidas por la franja de arriba (`top` a `top + depth`). Se dibujan en cada
// fotograma para que titilen. La portada usa las 16 de siempre; la vista del telescopio, un campo más denso.
export function starField(count, seed, { top = 2, depth = 46 } = {}) {
  const rand = seeded(seed)
  return Array.from({ length: count }, () => ({ x: Math.floor(rand() * WIDTH), y: top + Math.floor(rand() * depth) }))
}

const STARS = starField(16, 8)

export function paintStars(g, ms, still, visibility, stars = STARS) {
  stars.forEach(({ x, y }, i) => {
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
export function paintCloud(g, x, y, scale, sky) {
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

export function paintShootingStar(g, star) {
  for (let i = 0; i < 10; i++) {
    g.globalAlpha = Math.max(0, star.alpha * (1 - i / 10))
    dot(g, star.x + star.dx * i * 2.2, star.y + star.dy * i * 2.2, i === 0 ? '#ffffff' : '#fff1c4')
    if (i < 3) dot(g, star.x + star.dx * i * 2.2, star.y + star.dy * i * 2.2 + 1, '#f8d77a')
  }
  g.globalAlpha = 1
}

export function paintBird(g, { x, y, wing }) {
  const color = '#2e2d5a'
  if (wing) {
    ;[[-2, 1], [-1, 0], [0, 1], [1, 0], [2, 1]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
  } else {
    ;[[-2, 0], [-1, 1], [0, 0], [1, 1], [2, 0]].forEach(([dx, dy]) => dot(g, x + dx, y + dy, color))
  }
}

// Franjas separadas por un tramado de ajedrez de dos filas, a la manera clásica.
export function paintSky(g, sky) {
  for (let y = 0; y < HORIZON; y++) {
    let band = 0
    BAND_STARTS.forEach((from, i) => {
      if (y >= from) band = i
    })
    const edge = band > 0 && y - BAND_STARTS[band] < 2
    if (!edge) {
      rect(g, 0, y, WIDTH, 1, sky.bands[band])
      continue
    }
    for (let x = 0; x < WIDTH; x++) dot(g, x, y, sky.bands[(x + y) % 2 === 0 ? band - 1 : band])
  }
}

// El sol se enrojece cerca del horizonte; la luna es un disco con dos cráteres.
export function paintCelestial(g, sky) {
  const veil = 1 - 0.7 * Math.max(0, sky.cloud - 0.3)
  g.globalAlpha = veil
  if (sky.sun) {
    const warm = mixHex('#e8704a', PAL.saffronLight, Math.min(1, sky.sun.height * 3))
    ellipse(g, sky.sun.x, sky.sun.y, 13, 13, mixHex(warm, '#ffffff', 0.15))
    ellipse(g, sky.sun.x, sky.sun.y, 10, 10, warm)
  }
  if (sky.moon) {
    ellipse(g, sky.moon.x, sky.moon.y, 9, 9, PAL.bone)
    dot(g, sky.moon.x - 3, sky.moon.y - 2, '#cfc5e0')
    rect(g, sky.moon.x + 2, sky.moon.y + 2, 2, 2, '#cfc5e0')
    dot(g, sky.moon.x - 1, sky.moon.y + 4, '#cfc5e0')
  }
  g.globalAlpha = 1
}

export function paintRain(g, sky, ms, { width = WIDTH, height = HEIGHT } = {}) {
  if (sky.rain <= 0) return
  rainDrops(ms, sky.rain, width, height).forEach(({ x, y, long }) => {
    g.globalAlpha = 0.75
    rect(g, Math.round(x), Math.round(y), 1, long ? 3 : 2, '#bcd4ff')
  })
  g.globalAlpha = 1
}

// Copos: puntos blancos y, los más cercanos, una cruz pequeña. Con tormenta de nieve se ven todos.
export function paintSnow(g, sky, ms, { width = WIDTH, height = HEIGHT } = {}) {
  if (sky.snow <= 0) return
  snowFlakes(ms, sky.snow, width, height).forEach(({ x, y, big }) => {
    const px = Math.round(x)
    const py = Math.round(y)
    g.globalAlpha = big ? 0.95 : 0.75
    dot(g, px, py, '#ffffff')
    if (big) {
      g.globalAlpha = 0.6
      ;[[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => dot(g, px + dx, py + dy, '#dbe9ff'))
    }
  })
  g.globalAlpha = 1
}

// Rayo en zigzag desde la nube hasta el horizonte, con un destello que aclara toda la escena.
export function paintLightning(g, ms, seed) {
  const strike = lightningAt(ms, seed)
  if (!strike) return
  g.globalAlpha = 0.45 * strike.flash
  rect(g, 0, 0, WIDTH, HEIGHT, '#ffffff')
  g.globalAlpha = 1
  let x = strike.x
  for (let y = 0; y < HORIZON + 4; y += 4) {
    const next = x + (hash2(y, strike.id % 97, 9) - 0.5) * 9
    rect(g, Math.round(Math.min(x, next)), y, Math.abs(Math.round(next - x)) + 2, 4, '#d8e6ff')
    rect(g, Math.round(x), y, 1, 4, '#ffffff')
    x = next
  }
}

// Capas de color con las que la noche, las nubes cargadas y el invierno apagan lo dibujado debajo.
// La portada las pinta sobre su lienzo (`paintTint`) y el valle sobre su pantalla (valleSky.js).
export function tintLayers(sky) {
  return [
    { color: '#1c1b3a', alpha: 0.5 * sky.dark },
    { color: '#2e2d5a', alpha: 0.22 * Math.max(sky.rain, sky.storm) },
    // El invierno enfría los colores con un velo azul pálido.
    { color: '#b9d4f2', alpha: 0.16 * sky.winter },
  ]
}

// La noche y las nubes cargadas apagan los colores de todo lo dibujado debajo.
export function paintTint(g, sky) {
  tintLayers(sky).forEach(({ color, alpha }) => {
    g.globalAlpha = alpha
    rect(g, 0, 0, WIDTH, HEIGHT, color)
  })
  g.globalAlpha = 1
}

// Color de la franja más alta del cielo ya con el oscurecimiento, las nubes cargadas y el velo de
// invierno encima (los mismos que `paintTint`). Es el que se extiende por encima del lienzo cuando la
// pantalla es más alta de lo que la imagen puede ampliarse (Title.jsx), para que no se vea el corte.
export function skyTopColor(sky) {
  const night = mixHex(sky.bands[0], '#1c1b3a', 0.5 * sky.dark)
  const overcast = mixHex(night, '#2e2d5a', 0.22 * Math.max(sky.rain, sky.storm))
  return mixHex(overcast, '#b9d4f2', 0.16 * sky.winter)
}
