// Voz de los personajes al hablar: un pitido corto por cada par de letras, como en los juegos de granja de 16 bits.
// Cada personaje tiene su timbre y sus notas (una escala pentatónica, que nunca desentona al encadenarse); la nota de
// cada letra sale de la propia letra, así que el mismo texto suena siempre igual. Se sintetiza con Web Audio y sale por
// el bus de efectos, como el resto de sonidos de la interfaz (`uiSounds.js`).
import { playNote } from './uiSounds'

const PENTATONIC = [0, 2, 4, 7, 9, 12]

// `base` es la nota más grave en Hz. La voz de Lupe es más aguda y de onda triangular (más suave); la de Atreus, más
// grave y cuadrada. Khalessi no habla: su página lleva un maullido propio (`MEOW`).
const VOICES = {
  lupe: { type: 'triangle', base: 392, volume: 0.32, length: 0.05 },
  atreus: { type: 'square', base: 196, volume: 0.12, length: 0.05 },
  khalessi: { type: 'square', base: 523, volume: 0.1, length: 0.04 },
}

// Tres maullidos distintos: uno corto (el de siempre), uno largo e insistente (cuando lleva la sardina) y uno agudo y
// contento (cuando se la da). Las notas son de onda cuadrada, como el resto del juego.
const MEOWS = [
  [
    { type: 'square', freq: 640, to: 1180, at: 0, length: 0.13, volume: 0.13 },
    { type: 'square', freq: 1180, to: 560, at: 0.13, length: 0.22, volume: 0.13 },
  ],
  [
    { type: 'square', freq: 520, to: 980, at: 0, length: 0.2, volume: 0.13 },
    { type: 'square', freq: 980, to: 700, at: 0.2, length: 0.18, volume: 0.13 },
    { type: 'square', freq: 700, to: 1100, at: 0.42, length: 0.2, volume: 0.13 },
    { type: 'square', freq: 1100, to: 480, at: 0.62, length: 0.34, volume: 0.13 },
  ],
  [
    { type: 'square', freq: 900, to: 1500, at: 0, length: 0.09, volume: 0.12 },
    { type: 'square', freq: 1500, to: 1250, at: 0.1, length: 0.08, volume: 0.12 },
    { type: 'square', freq: 1250, to: 1700, at: 0.2, length: 0.1, volume: 0.12 },
  ],
]

// Letras que no suenan: espacios y signos. Un pitido por cada dos letras que sí suenan lo marca quien llama.
export const isSpoken = (char) => /\p{L}|\p{N}/u.test(char)

// Frecuencia del pitido de una letra para una voz: determinista, dentro de la escala de esa voz.
export function blipFrequency(voice, char) {
  const { base } = VOICES[voice] ?? VOICES.lupe
  const step = PENTATONIC[char.toLowerCase().charCodeAt(0) % PENTATONIC.length]
  return base * 2 ** (step / 12)
}

export function playBlip(engine, voice, char) {
  if (!engine || !isSpoken(char)) return false
  const { type, volume, length } = VOICES[voice] ?? VOICES.lupe
  playNote(engine, { type, freq: blipFrequency(voice, char), at: 0, length, volume }, engine.ctx.currentTime)
  return true
}

// Maullido de 8 bits de Khalessi (el que pidió Lupe): `variant` elige entre los tres.
export function playMeow(engine, variant = 0) {
  if (!engine) return false
  const origin = engine.ctx.currentTime
  MEOWS[variant % MEOWS.length].forEach((note) => playNote(engine, note, origin))
  return true
}
