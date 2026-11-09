// Versiones de otoño e invierno de cada dibujo del escenario. Reutilizan el repintado por tono y la capa
// de nieve de la portada, así que el valle cambia de estación con los mismos colores que ella.
import { makeCanvas } from './pixelKit.js'
import { recolorAutumnSteps } from './titleAutumn.js'
import { recolorWinterSteps, snowCap } from './titleWinter.js'
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

// Versiones por porciones (ver sliced.js) y, al final, las de siempre para quien las necesita ya.
export const autumnSteps = (canvas) => recolored(copyCanvas(canvas), recolorAutumnSteps)

// `cap` pone además la capa de nieve en lo más alto de cada columna (tejados y copas).
export const winterSteps = (canvas, { cap = true } = {}) => recolored(cap ? snowCap(canvas) : copyCanvas(canvas), recolorWinterSteps)

export const autumnOf = (canvas) => drain(autumnSteps(canvas))
export const winterOf = (canvas, options) => drain(winterSteps(canvas, options))
