import { drain } from './sliced.js'

// Repintado por tono para los biomas de la portada: el otoño y el invierno parten del mismo paisaje
// de primavera y cambian solo los colores que les tocan (hierba, copas y flores del cerezo).

export function rgbToHsl(r, g, b) {
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

export function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// Lo que cuenta como hierba (y copas y musgo) y como flor de cerezo en el dibujo de primavera.
export const isGreen = (h, s) => h >= 65 && h <= 170 && s > 0.18
export const isBlossom = (h, s) => h >= 310 && h <= 355 && s > 0.3

// Recorre los píxeles opacos del lienzo y, si `map(h, s, l)` devuelve un tono nuevo, lo pinta. Va por porciones
// de `SLICE` píxeles (ver sliced.js): repintar un suelo de más de un millón de píxeles de una vez congela un móvil.
const SLICE = 16000

export function* repaintSteps(g, width, height, map) {
  const image = g.getImageData(0, 0, width, height)
  const { data } = image
  for (let start = 0; start < data.length; start += SLICE * 4) {
    const end = Math.min(data.length, start + SLICE * 4)
    for (let i = start; i < end; i += 4) {
      if (data[i + 3] === 0) continue
      const next = map(...rgbToHsl(data[i], data[i + 1], data[i + 2]))
      if (!next) continue
      const [r, gr, b] = hslToRgb(...next)
      data[i] = r
      data[i + 1] = gr
      data[i + 2] = b
    }
    yield
  }
  g.putImageData(image, 0, 0)
}

export const repaint = (g, width, height, map) => drain(repaintSteps(g, width, height, map))
