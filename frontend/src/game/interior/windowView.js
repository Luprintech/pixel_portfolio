// Lo que se ve por una ventana de la casa: el cielo del valle en pequeño, con la hora y el tiempo del momento. Recibe el
// estado de `valleSkyAt` (el mismo del valle) y pinta sobre un lienzo del tamaño del cristal, así que la lluvia, la nieve y los
// rayos solo existen al otro lado: nunca pueden salirse a la habitación. Funciones puras de (estado, milisegundos), sin Phaser.
import { PAL } from '../palette.js'
import { dot, hash2, rect } from '../pixelKit.js'
import { starVisibility } from '../skyView.js'
import { BAND_STARTS, HORIZON, mixHex, rainDrops, snowFlakes } from '../titleSky.js'
import { cloudsAt, starAlpha } from '../titleMotion.js'
import { valleLightningAt } from '../valleSky.js'

// El cristal es chico: la lluvia y la nieve se espesan y se frenan para que se lean en tan pocos píxeles.
const RAIN_DENSITY = 7
const RAIN_SLOW = 0.2
const SNOW_DENSITY = 6
const SNOW_SLOW = 0.4
const CLOUD_SPAN = 420
const HILL = { grass: '#4f7f3f', autumn: '#b8742e', snow: '#eef4ff', night: '#14132e' }

// Estrellas de un cristal: posiciones fijas dentro de él, tantas como pide su tamaño.
export const windowStars = (w, h, seed = 3) =>
  Array.from({ length: Math.max(3, Math.round((w * h) / 45)) }, (_, i) => ({ x: Math.floor(hash2(i, 1, seed) * w), y: Math.floor(hash2(i, 2, seed) * (h - 4)) }))

// Color de las franjas de la fila `y` del cristal: el cielo desde lo alto del cielo del valle hasta el horizonte.
function bandColor(sky, y, h) {
  const row = (y / h) * (HORIZON - 12) + 8
  let band = 0
  BAND_STARTS.forEach((from, i) => {
    if (row >= from) band = i
  })
  return sky.bands[band]
}

function paintBands(g, w, h, sky, soften) {
  for (let y = 0; y < h; y++) rect(g, 0, y, w, 1, soften(bandColor(sky, y, h)))
}

// Sol y luna cruzan el cristal de lado a lado a lo largo de su recorrido; el sol se enrojece cerca del horizonte.
function paintBodies(g, w, h, sky) {
  const radius = Math.max(2, Math.min(5, Math.floor(h / 3)))
  const place = (body) => ({ x: Math.round(((body.x + 10) / 340) * (w + radius * 2) - radius), y: Math.round(h - 3 - body.height * (h - 6)) })
  g.globalAlpha = 1 - 0.7 * Math.max(0, sky.cloud - 0.3)
  if (sky.sun) {
    const { x, y } = place(sky.sun)
    const warm = mixHex('#e8704a', PAL.saffronLight, Math.min(1, sky.sun.height * 3))
    rect(g, x - radius, y - radius + 1, radius * 2, radius * 2 - 2, warm)
    rect(g, x - radius + 1, y - radius, radius * 2 - 2, radius * 2, warm)
  }
  if (sky.moon) {
    const { x, y } = place(sky.moon)
    rect(g, x - radius, y - radius + 1, radius * 2, radius * 2 - 2, PAL.bone)
    rect(g, x - radius + 1, y - radius, radius * 2 - 2, radius * 2, PAL.bone)
    dot(g, x - 1, y - 1, '#cfc5e0')
  }
  g.globalAlpha = 1
}

// Nubes de la portada, reducidas al cristal: cuanto más cubierto, más nubes, y se vuelven grises con el cielo cargado.
function paintClouds(g, w, h, sky, ms) {
  const overcast = Math.min(1, Math.max(0, (sky.cloud - 0.6) / 0.4))
  const body = mixHex(mixHex(sky.bands[3], '#ffffff', 0.55), '#8d8aa8', overcast * 0.7)
  const shade = mixHex(mixHex(sky.bands[3], '#5c5a7a', 0.35), '#5c5a7a', overcast * 0.6)
  cloudsAt(ms, sky.cloud).forEach((cloud) => {
    const width = Math.max(6, Math.round(w * 0.55 * cloud.scale))
    const height = Math.max(3, Math.round(h * 0.3))
    const x = Math.round(((cloud.x + 50) / CLOUD_SPAN) * (w + width * 2) - width)
    const y = 1 + Math.round(((cloud.y - 28) / 56) * h * 0.45)
    rect(g, x + 1, y + height - 1, width - 2, 1, shade)
    rect(g, x + 1, y, width - 2, height - 1, body)
    rect(g, x, y + 1, width, height - 2, body)
  })
}

// Lomas del fondo: verdes en primavera, anaranjadas con el otoño y blancas con la nieve, y oscuras de noche.
function paintHills(g, w, h, sky, soften) {
  const day = mixHex(mixHex(HILL.grass, HILL.autumn, sky.autumn), HILL.snow, sky.winter)
  const color = soften(mixHex(day, HILL.night, 0.65 * sky.dark))
  for (let x = 0; x < w; x++) rect(g, x, h - 1 - (((x >> 2) + 1) % 3 === 0 ? 1 : 0), 1, 2, color)
}

function paintRainOutside(g, w, h, sky, ms) {
  if (sky.rain <= 0) return
  g.globalAlpha = 0.8
  rainDrops(ms * RAIN_SLOW, Math.min(1, sky.rain) * RAIN_DENSITY, w, h).forEach(({ x, y, long }) => rect(g, Math.round(x), Math.round(y), 1, long ? 3 : 2, '#bcd4ff'))
  g.globalAlpha = 1
}

function paintSnowOutside(g, w, h, sky, ms) {
  if (sky.snow <= 0) return
  snowFlakes(ms * SNOW_SLOW, Math.min(1, sky.snow) * SNOW_DENSITY, w, h).forEach(({ x, y, big }) => {
    g.globalAlpha = big ? 0.95 : 0.75
    dot(g, x, y, '#ffffff')
    if (big) dot(g, x + 1, y, '#dbe9ff')
  })
  g.globalAlpha = 1
}

// Rayo: un zigzag de lado a lado del cristal y un fogonazo que lo aclara todo.
function paintLightning(g, w, h, strike) {
  g.globalAlpha = 0.6 * strike.flash
  rect(g, 0, 0, w, h, '#ffffff')
  g.globalAlpha = 1
  let x = Math.round(((strike.x - 40) / 240) * (w - 4)) + 2
  for (let y = 0; y < h - 2; y += 3) {
    const next = x + Math.round((hash2(y, strike.id % 97, 9) - 0.5) * 4)
    rect(g, Math.min(x, next), y, Math.abs(next - x) + 1, 3, '#e8f0ff')
    x = next
  }
}

// Un fotograma del cristal. `ms` es el reloj del valle; con `still` (movimiento reducido) nada se mueve: las nubes y las gotas
// se quedan donde están, las estrellas no titilan y no hay rayos. `pastel` aclara los colores como el resto del tema.
export function paintWindowView(g, { w, h, stars }, sky, ms, seed, { still = false, pastel = false } = {}) {
  const soften = (color) => (pastel ? mixHex(color, '#ffffff', 0.3) : color)
  g.clearRect(0, 0, w, h)
  paintBands(g, w, h, sky, soften)
  const night = starVisibility(sky)
  if (night > 0.05) {
    stars.forEach(({ x, y }, i) => {
      g.globalAlpha = (still ? 0.8 : starAlpha(i, ms)) * night
      dot(g, x, y, '#f1e6cf')
    })
    g.globalAlpha = 1
  }
  paintBodies(g, w, h, sky)
  paintClouds(g, w, h, sky, still ? 0 : ms)
  paintHills(g, w, h, sky, soften)
  paintRainOutside(g, w, h, sky, still ? 0 : ms)
  paintSnowOutside(g, w, h, sky, still ? 0 : ms)
  const strike = still ? null : valleLightningAt(ms, seed)
  if (strike) paintLightning(g, w, h, strike)
}
