// Dibujo del cielo y del tiempo de la portada. Recibe el estado de titleSky.js y pinta en el canvas
// de 320×180: franjas con tramado, sol y luna, lluvia, rayos y el oscurecimiento de la hora.
import { PAL } from './palette.js'
import { dot, ellipse, hash2, rect } from './pixelKit.js'
import { BAND_STARTS, HORIZON, lightningAt, mixHex, rainDrops, snowFlakes } from './titleSky.js'

const WIDTH = 320
const HEIGHT = 180

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

export function paintRain(g, sky, ms) {
  if (sky.rain <= 0) return
  rainDrops(ms, sky.rain).forEach(({ x, y, long }) => {
    g.globalAlpha = 0.75
    rect(g, Math.round(x), Math.round(y), 1, long ? 3 : 2, '#bcd4ff')
  })
  g.globalAlpha = 1
}

// Copos: puntos blancos y, los más cercanos, una cruz pequeña. Con tormenta de nieve se ven todos.
export function paintSnow(g, sky, ms) {
  if (sky.snow <= 0) return
  snowFlakes(ms, sky.snow).forEach(({ x, y, big }) => {
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

// La noche y las nubes cargadas apagan los colores de todo lo dibujado debajo.
export function paintTint(g, sky) {
  g.globalAlpha = 0.5 * sky.dark
  rect(g, 0, 0, WIDTH, HEIGHT, '#1c1b3a')
  g.globalAlpha = 0.22 * Math.max(sky.rain, sky.storm)
  rect(g, 0, 0, WIDTH, HEIGHT, '#2e2d5a')
  // El invierno enfría los colores con un velo azul pálido.
  g.globalAlpha = 0.16 * sky.winter
  rect(g, 0, 0, WIDTH, HEIGHT, '#b9d4f2')
  g.globalAlpha = 1
}
