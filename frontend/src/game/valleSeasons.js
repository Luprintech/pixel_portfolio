// Versiones de cada estación de cada dibujo del escenario. La primavera es el dibujo base; encima se funden el verano (hierba más seca), el
// otoño (ocres), la escarcha del invierno (hierba helada y copas con menos hojas) y la nieve de una nevada (blanco cubriendo hierba, copas y
// tejados). Reutilizan el repintado por tono y la capa de nieve de la portada, así que el valle cambia de estación con los mismos colores que ella.
import { hash2, makeCanvas, noise } from './pixelKit.js'
import { recolorAutumnSteps } from './titleAutumn.js'
import { recolorWinterSteps, snowCap } from './titleWinter.js'
import { isBlossom, isGreen, repaintSteps, rgbToHsl } from './titleRecolor.js'
import { drain } from './sliced.js'

export const copyCanvas = (canvas) => {
  const out = makeCanvas(canvas.width, canvas.height)
  out.getContext('2d').drawImage(canvas, 0, 0)
  return out
}

function* recolored(canvas, recolor) {
  yield* recolor(canvas.getContext('2d'), canvas.width, canvas.height)
  return canvas
}

// Verano: la hierba y las copas se secan un poco, del verde de primavera a uno más amarillento y menos vivo.
function* recolorSummerSteps(g, width, height) {
  yield* repaintSteps(g, width, height, (h, s, l) => {
    if (isGreen(h, s)) return [58 + (h - 65) * 0.4, s * 0.86, Math.min(0.95, l * 1.03 + 0.015)]
    // El cerezo ya no está en flor: la copa se vuelve verde (más oscuro cuanto más oscuro era el rosa).
    if (isBlossom(h, s)) return [88, Math.min(0.5, s * 0.8), Math.max(0.2, l * 0.78)]
    return null
  })
}

// Escarcha: la hierba y las copas se aclaran hacia un verde azulado y pálido, conservando sus luces y sombras.
function* recolorFrostSteps(g, width, height) {
  yield* repaintSteps(g, width, height, (h, s, l) => {
    if (isGreen(h, s)) return [150 + (h - 100) * 0.12, 0.16, Math.min(0.94, 0.48 + l * 0.5)]
    if (isBlossom(h, s)) return [335, 0.4, Math.min(0.9, 0.7 + l * 0.2)]
    return null
  })
}

// Porciones de píxeles entre cesiones de control (ver sliced.js): igual que `repaintSteps`.
const SLICE = 16000

// Árboles de invierno: se aclaran como el resto de la escarcha y además pierden hojas (y flor), en manchas (no píxel a píxel) para que la copa se vea
// rala y se deje ver el tronco y las ramas.
function* thinLeavesSteps(canvas) {
  const { width, height } = canvas
  const g = canvas.getContext('2d')
  const image = g.getImageData(0, 0, width, height)
  const { data } = image
  for (let start = 0; start < width * height; start += SLICE) {
    const end = Math.min(width * height, start + SLICE)
    for (let p = start; p < end; p++) {
      const i = p * 4
      if (data[i + 3] === 0) continue
      const [h, s] = rgbToHsl(data[i], data[i + 1], data[i + 2])
      if (!isGreen(h, s) && !isBlossom(h, s)) continue
      const x = p % width
      const y = Math.floor(p / width)
      if (noise(x, y, 2.4, 17) + (hash2(x, y, 5) - 0.5) * 0.25 < 0.42) data[i + 3] = 0
    }
    yield
  }
  g.putImageData(image, 0, 0)
}

// Versiones por porciones (ver sliced.js) y, al final, las de siempre para quien las necesita ya.
export const summerSteps = (canvas) => recolored(copyCanvas(canvas), recolorSummerSteps)
export const autumnSteps = (canvas) => recolored(copyCanvas(canvas), recolorAutumnSteps)

// `thin` quita hojas a las copas (los árboles; el suelo y los arbustos del suelo no).
export function* frostSteps(canvas, { thin = false } = {}) {
  const out = copyCanvas(canvas)
  // Primero se quitan hojas (mientras siguen verdes, que es como se las reconoce) y después se aclara lo que queda.
  if (thin) yield* thinLeavesSteps(out)
  return yield* recolored(out, recolorFrostSteps)
}

// Nieve acumulada. `cap` pone además la capa de nieve en lo más alto de cada columna (tejados y copas). Con `recolor: false` no se
// repintan los verdes como hierba nevada: es para los dibujos de colores pintados (el autobús verde, el cartel de la Junta, las
// banderas), que solo reciben la capa de arriba.
export function* snowSteps(canvas, { cap = true, recolor = true } = {}) {
  const out = cap ? snowCap(canvas) : copyCanvas(canvas)
  if (!recolor) return out
  return yield* recolored(out, recolorWinterSteps)
}

export const summerOf = (canvas) => drain(summerSteps(canvas))
export const autumnOf = (canvas) => drain(autumnSteps(canvas))
export const snowOf = (canvas, options) => drain(snowSteps(canvas, options))
