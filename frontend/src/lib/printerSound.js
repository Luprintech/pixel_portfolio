// Sonido de la A1 mini imprimiendo, sintetizado con Web Audio y por el bus de efectos. No hay ningún sonido continuo: la sala
// avisa de cada movimiento del cabezal (`print-step`) y aquí suena un golpecito suave por cada uno, así el sonido va al
// ritmo de la animación y se calla solo cuando la impresión acaba, se cancela o la viajera se va (sin movimientos no hay nada
// que suene). En reposo la impresora no emite nada.
import { getEngine, startEngineIfAllowed } from './audioEngine'
import { playNote } from './uiSounds'

// Notas de un movimiento del cabezal. `sweep` (0 a 3) es el tramo del barrido: los dos primeros van hacia la derecha (el
// motor sube de tono) y los dos últimos de vuelta (baja). `layer` marca el primer movimiento de una capa nueva, en el que
// además sube un poco el eje vertical. Aparte del audio para poder probarlo.
export function printStepNotes({ sweep, layer }) {
  const forward = sweep < 2
  const notes = [
    { type: 'triangle', freq: forward ? 150 : 190, to: forward ? 190 : 140, at: 0, length: 0.07, volume: 0.045 },
    { type: 'square', freq: forward ? 300 : 360, to: forward ? 360 : 290, at: 0.02, length: 0.14, volume: 0.012 },
  ]
  if (layer) notes.push({ type: 'triangle', freq: 96, to: 72, at: 0.1, length: 0.14, volume: 0.05 })
  return notes
}

// Un movimiento del cabezal. Sin motor de audio (aún sin gesto) no hace nada.
export function playPrintStep(step) {
  const engine = getEngine() ?? startEngineIfAllowed()
  if (!engine) return false
  const origin = engine.ctx.currentTime
  printStepNotes(step).forEach((note) => playNote(engine, note, origin))
  return true
}

// Pitido de impresión terminada: tres avisos agudos y cortos, como el de la impresora de verdad.
export function playPrintDone() {
  const engine = getEngine() ?? startEngineIfAllowed()
  if (!engine) return false
  const origin = engine.ctx.currentTime
  ;[0, 0.22, 0.44].forEach((at) => playNote(engine, { type: 'square', freq: 1568, at, length: 0.12, volume: 0.06 }, origin))
  return true
}
