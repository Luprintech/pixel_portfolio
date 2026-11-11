// Sonidos de los botones del juego: pitidos de consola de 16 bits (ondas cuadradas y triangulares con
// una envolvente seca). Se sintetizan con Web Audio, así que no hay archivos que descargar, y salen por
// el bus de efectos del motor de audio: el volumen de efectos, el general y el silencio los gobiernan
// igual que al resto del sonido.

// Cada sonido es una lista de notas: `at` y `length` en segundos, `freq` en Hz y `to` si el tono se
// desliza hasta otra frecuencia (el "pip" que sube o baja típico de los menús).
export const UI_SOUNDS = {
  // Pulsación normal de un botón.
  select: [{ type: 'square', freq: 880, to: 1320, at: 0, length: 0.07, volume: 0.16 }],
  // Acción principal (empezar, continuar, guardar): arpegio ascendente de do mayor.
  confirm: [
    { type: 'square', freq: 523, at: 0, length: 0.06, volume: 0.15 },
    { type: 'square', freq: 659, at: 0.06, length: 0.06, volume: 0.15 },
    { type: 'square', freq: 784, at: 0.12, length: 0.06, volume: 0.15 },
    { type: 'square', freq: 1047, at: 0.18, length: 0.14, volume: 0.15 },
  ],
  // Cerrar, volver o cancelar: el tono baja.
  back: [{ type: 'square', freq: 660, to: 330, at: 0, length: 0.1, volume: 0.15 }],
  // Cambio de pestaña: dos golpecitos suaves de onda triangular.
  tab: [
    { type: 'triangle', freq: 520, at: 0, length: 0.05, volume: 0.3 },
    { type: 'triangle', freq: 780, at: 0.05, length: 0.06, volume: 0.3 },
  ],
  // Elegir una opción o activar un interruptor: un pip agudo y corto.
  pick: [{ type: 'square', freq: 1175, at: 0, length: 0.045, volume: 0.14 }],
  // Conseguir un objeto, como en las aventuras de 8 bits: un trino corto que sube y se posa.
  item: [
    { type: 'square', freq: 784, at: 0, length: 0.06, volume: 0.13 },
    { type: 'square', freq: 988, at: 0.06, length: 0.06, volume: 0.13 },
    { type: 'square', freq: 1319, at: 0.12, length: 0.06, volume: 0.13 },
    { type: 'square', freq: 1568, at: 0.18, length: 0.16, volume: 0.13 },
  ],
  // Logro conseguido: dos notas de fanfarria y un acorde final, corto y reconocible. Es el único sonido de logro: lo usa
  // `useAchievements` para todos, así cada logro suena una vez y suena igual.
  achievement: [
    { type: 'square', freq: 659, at: 0, length: 0.09, volume: 0.13 },
    { type: 'square', freq: 880, at: 0.1, length: 0.09, volume: 0.13 },
    { type: 'square', freq: 1319, at: 0.2, length: 0.34, volume: 0.13 },
    { type: 'triangle', freq: 1047, at: 0.2, length: 0.34, volume: 0.22 },
    { type: 'triangle', freq: 784, at: 0.2, length: 0.34, volume: 0.22 },
  ],
  // Arranque del escritorio retro del ordenador de Lupe: una melodía propia, de onda triangular, que sube y se posa
  // (no imita el arranque de ningún sistema real).
  desktop: [
    { type: 'triangle', freq: 587, at: 0, length: 0.16, volume: 0.3 },
    { type: 'triangle', freq: 440, at: 0.14, length: 0.16, volume: 0.3 },
    { type: 'triangle', freq: 740, at: 0.28, length: 0.16, volume: 0.3 },
    { type: 'triangle', freq: 880, at: 0.42, length: 0.34, volume: 0.3 },
    { type: 'triangle', freq: 1109, at: 0.42, length: 0.34, volume: 0.18 },
  ],
}

// Qué sonido le toca a un elemento, a partir de lo que ya declara: `data-sound` manda (y `off` lo
// calla), y si no, el papel ARIA y la clase del botón. Aparte del audio para poder probarla.
export function uiSoundFor(element) {
  if (!element || element.matches?.(':disabled, [aria-disabled="true"]')) return null
  const forced = element.getAttribute('data-sound')
  if (forced) return UI_SOUNDS[forced] ? forced : null
  if (element.getAttribute('role') === 'tab') return 'tab'
  if (element.hasAttribute('aria-pressed')) return 'pick'
  if (element.classList.contains('px-btn--bone') || element.classList.contains('px-link')) return 'select'
  if (element.classList.contains('px-btn')) return 'confirm'
  return null
}

const ATTACK = 0.004
// Dos pulsaciones muy seguidas (un doble clic, un toque que dispara pointer y click) sonarían como una.
const MIN_GAP_MS = 40
let lastPlayed = 0

export function playNote(engine, note, origin) {
  const { ctx } = engine
  const start = origin + note.at
  const end = start + note.length
  const osc = ctx.createOscillator()
  osc.type = note.type
  osc.frequency.setValueAtTime(note.freq, start)
  if (note.to) osc.frequency.linearRampToValueAtTime(note.to, end)
  const env = ctx.createGain()
  // Un ataque de pocos milisegundos evita el "clic" de arrancar la onda a media fase.
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(note.volume, start + ATTACK)
  env.gain.setValueAtTime(note.volume, end - 0.02)
  env.gain.linearRampToValueAtTime(0, end)
  osc.connect(env)
  env.connect(engine.fx)
  osc.start(start)
  osc.stop(end + 0.01)
}

// Hace sonar un sonido de la interfaz. No hace nada si el audio aún no está desbloqueado.
export function playUiSound(name, engine) {
  const notes = UI_SOUNDS[name]
  if (!notes || !engine) return false
  const now = performance.now()
  if (now - lastPlayed < MIN_GAP_MS) return false
  lastPlayed = now
  const origin = engine.ctx.currentTime
  notes.forEach((note) => playNote(engine, note, origin))
  return true
}
