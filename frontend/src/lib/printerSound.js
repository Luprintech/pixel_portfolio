// Sonido de una impresora 3D trabajando, sintetizado con Web Audio y por el bus de efectos: el zumbido grave del
// extrusor, el chirrido de los motores paso a paso al cambiar de dirección y, de vez en cuando, el barrido del ventilador.
// Suena mientras la viajera está junto a la impresora y se corta al alejarse.
import { getEngine, startEngineIfAllowed } from './audioEngine'
import { playNote } from './uiSounds'

const TICK_MS = 90

// Notas de un instante del sonido: `tick` cuenta los pasos desde que empezó. Aparte del audio para poder probarlo.
export function printerNotes(tick) {
  // El motor paso a paso salta entre unas pocas notas agudas, a ráfagas.
  const steps = [262, 311, 392, 466]
  const notes = [{ type: 'square', freq: steps[(tick * 7) % steps.length], at: 0, length: 0.07, volume: 0.045 }]
  // Zumbido de fondo del extrusor, una nota grave cada dos pasos.
  if (tick % 2 === 0) notes.push({ type: 'sawtooth', freq: 78 + (tick % 6) * 3, at: 0, length: 0.16, volume: 0.05 })
  // Barrido del eje que cambia de sentido, cada medio segundo más o menos.
  if (tick % 6 === 5) notes.push({ type: 'triangle', freq: 220, to: 640, at: 0, length: 0.22, volume: 0.07 })
  return notes
}

// Empieza el sonido y devuelve la función que lo para. Sin motor de audio (aún sin gesto) no hace nada.
export function startPrinterSound() {
  const engine = getEngine() ?? startEngineIfAllowed()
  if (!engine) return () => {}
  let tick = 0
  const timer = setInterval(() => {
    const origin = engine.ctx.currentTime
    printerNotes(tick++).forEach((note) => playNote(engine, note, origin))
  }, TICK_MS)
  return () => clearInterval(timer)
}

// Pitido de impresión terminada: tres avisos agudos y cortos, como el de la impresora de verdad.
export function playPrintDone() {
  const engine = getEngine() ?? startEngineIfAllowed()
  if (!engine) return false
  const origin = engine.ctx.currentTime
  ;[0, 0.22, 0.44].forEach((at) => playNote(engine, { type: 'square', freq: 1568, at, length: 0.12, volume: 0.1 }, origin))
  return true
}
