// Sonido de la pantalla de carga: teclas de una consola de comandos, con Web Audio y por el bus de efectos.
// Cada letra escrita es un golpecito seco con el tono algo distinto, para que no suene a metrónomo; al
// terminar una línea suena un pitido corto. Sin motor de audio (sin gesto aún) no hace nada.
import { getEngine, startEngineIfAllowed } from './audioEngine'
import { playNote } from './uiSounds'

const TICK_PITCHES = [1500, 1750, 1320, 1900]

// Notas de la tecla número `index`. Aparte del audio para poder probarlas.
export function keyTickNotes(index) {
  return [{ type: 'square', freq: TICK_PITCHES[index % TICK_PITCHES.length], at: 0, length: 0.02, volume: 0.035 }]
}

// Aviso de línea terminada: dos notas cortas que suben.
export const LINE_DONE_NOTES = [
  { type: 'square', freq: 660, at: 0, length: 0.05, volume: 0.05 },
  { type: 'square', freq: 990, at: 0.05, length: 0.07, volume: 0.05 },
]

function play(notes) {
  const engine = getEngine() ?? startEngineIfAllowed()
  if (!engine) return false
  const origin = engine.ctx.currentTime
  notes.forEach((note) => playNote(engine, note, origin))
  return true
}

export const playKeyTick = (index) => play(keyTickNotes(index))
export const playLineDone = () => play(LINE_DONE_NOTES)
