// Paleta pastel del paisaje de la portada (tema "valle", ver index.css). Dos pasos, los dos
// sobre el dibujo del valle y nunca sobre Lupe, Khalessi ni las flores que se mecen:
//   1. `lightenPixel` aclara la hierba y la tierra (verdes oscuros y marrones) hacia salvia y barro claro.
//   2. `softenCanvas` y `softenColor` bajan la saturación de lo ya dibujado y del cielo.
import { isBlossom, isGreen, repaintSteps } from './titleRecolor.js'
import { drain } from './sliced.js'

export const SOFTEN = { saturate: 0.66, brightness: 1.04 }

const clampByte = (value) => Math.min(255, Math.max(0, Math.round(value)))

// Misma matriz de luminancia que usa `filter: saturate()` en los navegadores.
function softenRgb(r, g, b, { saturate, brightness }) {
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return [r, g, b].map((c) => clampByte((luma + (c - luma) * saturate) * brightness))
}

export function softenColor(hex, params = SOFTEN) {
  const n = parseInt(hex.slice(1), 16)
  const out = softenRgb((n >> 16) & 255, (n >> 8) & 255, n & 255, params)
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

// Suaviza todos los píxeles opacos de un lienzo ya dibujado, por porciones (ver sliced.js).
const SOFTEN_SLICE = 24000
export function* softenSteps(canvas, params = SOFTEN) {
  const g = canvas.getContext('2d')
  const image = g.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image
  for (let start = 0; start < data.length; start += SOFTEN_SLICE * 4) {
    const end = Math.min(data.length, start + SOFTEN_SLICE * 4)
    for (let i = start; i < end; i += 4) {
      if (data[i + 3] === 0) continue
      ;[data[i], data[i + 1], data[i + 2]] = softenRgb(data[i], data[i + 1], data[i + 2], params)
    }
    yield
  }
  g.putImageData(image, 0, 0)
  return canvas
}

export const softenCanvas = (canvas, params = SOFTEN) => drain(softenSteps(canvas, params))

const GRASS_LIFT = 0.15
const EARTH_LIFT = 0.17
// Verde de salvia hacia el que se acercan los tonos amarillentos de la hierba.
const SAGE_HUE = 115
const lift = (l, amount) => l + (1 - l) * amount
const isEarth = (h, s, l) => h >= 12 && h <= 50 && s > 0.2 && l < 0.66

// Tono nuevo (h, s, l) de un píxel del paisaje, o null si se queda como está. Los verdes se aclaran y
// se desplazan un tercio hacia la salvia; los marrones (tronco, camino, marcos) solo se aclaran. Las
// flores del cerezo, los muros claros y la piedra no se tocan.
export function lightenPixel(h, s, l) {
  if (isBlossom(h, s)) return null
  if (isGreen(h, s)) return [h + (SAGE_HUE - h) * 0.35, s, lift(l, GRASS_LIFT)]
  if (isEarth(h, s, l)) return [h, s, lift(l, EARTH_LIFT)]
  return null
}

export function* lightenSteps(canvas) {
  yield* repaintSteps(canvas.getContext('2d'), canvas.width, canvas.height, lightenPixel)
  return canvas
}

export const lightenWorld = (canvas) => drain(lightenSteps(canvas))
