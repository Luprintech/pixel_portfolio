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

// Maullidos de Khalessi. El 0 es el corto de siempre (el saludo), de 8 bits como el resto del juego. El 1 y el 2 son los de la
// sardina, un gato de verdad jugando: una voz de diente de sierra con vibrato, filtrada por un formante que se abre en mitad
// del maullido (la "i" que se abre en "a" del "miau"). El 1 es el "miau" juguetón al llevársela; el 2, un "mrrp" más breve y
// agudo al dejársela a Atreus. Todo con Web Audio, sin archivos.
const MEOW_SHORT = [
  { type: 'square', freq: 640, to: 1180, at: 0, length: 0.13, volume: 0.13 },
  { type: 'square', freq: 1180, to: 560, at: 0.13, length: 0.22, volume: 0.13 },
]

// `from`, `peak` y `to` son el tono (Hz) al empezar, en lo más alto y al acabar; `formant` el recorrido del filtro.
const NATURAL_MEOWS = {
  1: { from: 520, peak: 930, to: 600, length: 0.4, formant: [800, 1900, 1100], volume: 0.3 },
  2: { from: 700, peak: 1150, to: 880, length: 0.24, formant: [1000, 2000, 1500], volume: 0.26 },
}

function playNaturalMeow(engine, spec) {
  const { ctx } = engine
  const start = ctx.currentTime
  const end = start + spec.length
  const peakAt = start + spec.length * 0.38
  const voice = ctx.createOscillator()
  voice.type = 'sawtooth'
  voice.frequency.setValueAtTime(spec.from, start)
  voice.frequency.linearRampToValueAtTime(spec.peak, peakAt)
  voice.frequency.linearRampToValueAtTime(spec.to, end)
  // Vibrato: un temblor rápido y fino sobre el tono, que es lo que hace "viva" la voz.
  const vibrato = ctx.createOscillator()
  vibrato.frequency.value = 26
  const depth = ctx.createGain()
  depth.gain.value = 9
  vibrato.connect(depth)
  depth.connect(voice.frequency)
  const formant = ctx.createBiquadFilter()
  formant.type = 'bandpass'
  formant.Q.value = 3
  const [open, wide, close] = spec.formant
  formant.frequency.setValueAtTime(open, start)
  formant.frequency.linearRampToValueAtTime(wide, peakAt)
  formant.frequency.linearRampToValueAtTime(close, end)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(spec.volume, start + 0.03)
  env.gain.setValueAtTime(spec.volume, peakAt)
  env.gain.linearRampToValueAtTime(0, end)
  voice.connect(formant)
  formant.connect(env)
  env.connect(engine.fx)
  voice.start(start)
  vibrato.start(start)
  voice.stop(end + 0.02)
  vibrato.stop(end + 0.02)
}

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

// Maullido de Khalessi: `variant` elige entre el corto de siempre (0) y los dos de la sardina (1 y 2).
export function playMeow(engine, variant = 0) {
  if (!engine) return false
  const natural = NATURAL_MEOWS[variant]
  if (natural) playNaturalMeow(engine, natural)
  else {
    const origin = engine.ctx.currentTime
    MEOW_SHORT.forEach((note) => playNote(engine, note, origin))
  }
  return true
}
