// Sonidos del juego retro de la consola: pitidos de 8 bits (onda cuadrada y triangular) para el mandoble, los golpes, los
// cofres, las llaves y el final. Se sintetizan con Web Audio y salen por el bus de efectos, como los sonidos de la
// interfaz (`uiSounds.js`). Cada suceso de `game/retro/logic.js` tiene el suyo.
import { playNote } from './uiSounds'

const square = (freq, at, length, volume = 0.12, to) => ({ type: 'square', freq, to, at, length, volume })

export const RETRO_SOUNDS = {
  swing: [square(520, 0, 0.12, 0.1, 180)],
  hit: [square(180, 0, 0.06, 0.14), square(120, 0.05, 0.08, 0.14)],
  kill: [square(300, 0, 0.07), square(200, 0.07, 0.07), square(120, 0.14, 0.12)],
  hurt: [{ type: 'sawtooth', freq: 220, to: 70, at: 0, length: 0.25, volume: 0.14 }],
  chest: [square(523, 0, 0.08), square(659, 0.08, 0.08), square(784, 0.16, 0.08), square(1047, 0.24, 0.2)],
  pickup: [square(880, 0, 0.05), square(1175, 0.05, 0.08)],
  door: [{ type: 'triangle', freq: 180, to: 90, at: 0, length: 0.3, volume: 0.25 }],
  locked: [square(150, 0, 0.1), square(150, 0.14, 0.1)],
  stairs: [square(392, 0, 0.07), square(330, 0.07, 0.07), square(262, 0.14, 0.1)],
  room: [square(660, 0, 0.04, 0.06)],
  dialog: [{ type: 'triangle', freq: 660, at: 0, length: 0.06, volume: 0.25 }],
  dead: [square(392, 0, 0.14), square(330, 0.14, 0.14), square(262, 0.28, 0.14), square(196, 0.42, 0.4)],
  win: [square(523, 0, 0.12), square(659, 0.12, 0.12), square(784, 0.24, 0.12), square(1047, 0.36, 0.12), square(784, 0.48, 0.12), square(1047, 0.6, 0.4)],
}

// Suena el efecto de un suceso del juego, si lo tiene y hay motor de audio.
export function playRetroSound(engine, type) {
  const notes = RETRO_SOUNDS[type]
  if (!notes || !engine) return false
  const origin = engine.ctx.currentTime
  notes.forEach((note) => playNote(engine, note, origin))
  return true
}
