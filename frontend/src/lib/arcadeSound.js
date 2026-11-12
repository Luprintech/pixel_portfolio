// Sonidos de los juegos de la recreativa: pitidos de 8 bits (onda cuadrada, triangular y de diente de sierra) para el mandoble, los
// disparos, las explosiones, los cofres, el combustible, los puentes y los finales. Se sintetizan con Web Audio y salen por el
// bus de efectos, como los sonidos de la interfaz (`uiSounds.js`). Cada suceso que devuelve un `step` de
// `game/arcade/*/logic.js` tiene el suyo; los que no lo tengan simplemente no suenan.
import { playNote } from './uiSounds'

const square = (freq, at, length, volume = 0.12, to) => ({ type: 'square', freq, to, at, length, volume })
const triangle = (freq, at, length, volume = 0.25, to) => ({ type: 'triangle', freq, to, at, length, volume })
const saw = (freq, to, at, length, volume = 0.13) => ({ type: 'sawtooth', freq, to, at, length, volume })

export const ARCADE_SOUNDS = {
  // Aventura de mazmorras.
  swing: [square(520, 0, 0.12, 0.1, 180)],
  hit: [square(180, 0, 0.06, 0.14), square(120, 0.05, 0.08, 0.14)],
  // `kill` no suena a propósito: el golpe que mata ya suena con `hit` y un segundo pitido más agudo encima resultaba cargante.
  hurt: [saw(220, 70, 0, 0.25, 0.14)],
  chest: [square(523, 0, 0.08), square(659, 0.08, 0.08), square(784, 0.16, 0.08), square(1047, 0.24, 0.2)],
  pickup: [square(880, 0, 0.05), square(1175, 0.05, 0.08)],
  door: [triangle(180, 0, 0.3, 0.25, 90)],
  locked: [square(150, 0, 0.1), square(150, 0.14, 0.1)],
  stairs: [square(392, 0, 0.07), square(330, 0.07, 0.07), square(262, 0.14, 0.1)],
  room: [square(660, 0, 0.04, 0.06)],
  quest: [square(784, 0, 0.09, 0.1), square(1175, 0.09, 0.22, 0.1)],
  dialog: [triangle(660, 0, 0.06, 0.25)],
  dead: [square(392, 0, 0.14), square(330, 0.14, 0.14), square(262, 0.28, 0.14), square(196, 0.42, 0.4)],
  block: [square(330, 0, 0.05, 0.1), square(660, 0.05, 0.06, 0.08)],
  push: [triangle(120, 0, 0.14, 0.3, 90)],
  plate: [square(660, 0, 0.06), square(990, 0.06, 0.12)],
  gate: [triangle(150, 0, 0.5, 0.3, 70), square(880, 0.1, 0.05, 0.08), square(1175, 0.2, 0.05, 0.08)],
  checkpoint: [square(523, 0, 0.07), square(784, 0.07, 0.07), square(1047, 0.14, 0.16)],
  phase: [saw(150, 320, 0, 0.45, 0.14), square(220, 0.2, 0.25, 0.1)],
  slam: [saw(110, 55, 0, 0.28, 0.16)],
  spit: [square(420, 0, 0.1, 0.09, 200)],
  crystal: [square(1047, 0, 0.1, 0.1), square(1319, 0.1, 0.1, 0.1), square(1568, 0.2, 0.1, 0.1), square(2093, 0.3, 0.3, 0.1)],
  bossDown: [saw(260, 40, 0, 0.8, 0.16), square(392, 0.1, 0.1), square(262, 0.25, 0.12), square(196, 0.45, 0.3)],
  win: [square(523, 0, 0.12), square(659, 0.12, 0.12), square(784, 0.24, 0.12), square(1047, 0.36, 0.12), square(784, 0.48, 0.12), square(1047, 0.6, 0.4)],
  // Moneda de la recreativa: el «ting» clásico, dos notas agudas, y el golpe de la moneda al caer en la ranura. `noCoin` es el zumbido de rechazo.
  coin: [square(988, 0, 0.07, 0.11), square(1319, 0.07, 0.32, 0.11), triangle(220, 0.0, 0.05, 0.2, 110)],
  noCoin: [square(196, 0, 0.12, 0.1), square(147, 0.14, 0.2, 0.1)],
  // Pesca del valle (`game/ValleScene.js`): echar la caña, la picada, tirar con acierto y el lance fallido.
  cast: [square(420, 0, 0.1, 0.07, 880)],
  bite: [square(880, 0, 0.07, 0.1), square(1175, 0.1, 0.1, 0.1)],
  reel: [square(523, 0, 0.06), square(784, 0.06, 0.08), square(1047, 0.14, 0.14)],
  miss: [square(220, 0, 0.1, 0.08), square(165, 0.12, 0.18, 0.08)],
  // Invasión Galáctica y Río en Peligro.
  shoot: [square(900, 0, 0.08, 0.07, 280)],
  boom: [saw(200, 50, 0, 0.2, 0.12), square(140, 0, 0.1, 0.08, 60)],
  fuelBlast: [saw(260, 90, 0, 0.26, 0.11), square(520, 0, 0.08, 0.07, 220)],
  bigBoom: [saw(170, 30, 0, 0.9, 0.16), square(120, 0, 0.5, 0.1, 40)],
  bonus: [square(659, 0, 0.07), square(784, 0.07, 0.07), square(988, 0.14, 0.07), square(1319, 0.21, 0.16)],
  extra: [square(784, 0, 0.08), square(988, 0.08, 0.08), square(1175, 0.16, 0.08), square(1568, 0.24, 0.08), square(1175, 0.32, 0.08), square(1568, 0.4, 0.3)],
  shield: [square(1200, 0, 0.12, 0.07, 500)],
  fuel: [triangle(440, 0, 0.1, 0.25, 880)],
  lowFuel: [square(330, 0, 0.09, 0.09), square(330, 0.14, 0.09, 0.09)],
  takeoff: [saw(70, 320, 0, 1.2, 0.09)],
  land: [triangle(320, 0, 0.5, 0.25, 110), square(880, 0.1, 0.05, 0.07), square(1175, 0.22, 0.05, 0.07)],
  bridge: [saw(220, 40, 0, 0.55, 0.15), square(150, 0, 0.3, 0.1, 50)],
  crash: [saw(300, 35, 0, 0.55, 0.15), square(180, 0.05, 0.25, 0.09, 40)],
  lose: [square(392, 0, 0.14), square(330, 0.14, 0.14), square(262, 0.28, 0.14), square(196, 0.42, 0.4)],
}

// Suena el efecto de un suceso del juego, si lo tiene y hay motor de audio.
export function playArcadeSound(engine, type) {
  const notes = ARCADE_SOUNDS[type]
  if (!notes || !engine) return false
  const origin = engine.ctx.currentTime
  notes.forEach((note) => playNote(engine, note, origin))
  return true
}
