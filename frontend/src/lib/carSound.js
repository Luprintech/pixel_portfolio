// Sonidos del SEAT Córdoba del valle: el arranque (el motor de arranque que gira tres veces y el motor que coge) y el ruido del
// motor mientras se conduce, que sube de tono al acelerar. Se sintetizan con Web Audio y salen por el bus de efectos, así que el
// volumen de efectos, el general y el silencio los gobiernan como al resto de sonidos (`uiSounds.js`).
import { playNote } from './uiSounds'

const square = (freq, at, length, volume, to) => ({ type: 'square', freq, to, at, length, volume })
const saw = (freq, to, at, length, volume) => ({ type: 'sawtooth', freq, to, at, length, volume })

// Tres vueltas del motor de arranque (golpes graves y secos) y el motor que arranca: un acelerón que sube y se asienta.
export const CAR_START = [
  square(95, 0, 0.09, 0.08, 70),
  square(95, 0.16, 0.09, 0.08, 70),
  square(100, 0.32, 0.09, 0.08, 75),
  saw(55, 150, 0.48, 0.32, 0.1),
  saw(150, 70, 0.8, 0.45, 0.08),
]

// Cuando el arranque acaba entra el ralentí del motor en marcha.
const IDLE_DELAY = 1.1
// Frecuencia base del motor al ralentí y cuánto sube a tope. El segundo oscilador va una octava por encima, más flojo.
const IDLE_HZ = 46
const RANGE_HZ = 54
const VOLUME = { idle: 0.05, full: 0.08 }
// Constante de tiempo de los cambios de tono y volumen: el motor no salta de una nota a otra.
const GLIDE = 0.12
const FADE_OUT = 0.3

// Suena el arranque. Devuelve si había motor de audio para sonar.
export function playCarStart(engine) {
  if (!engine) return false
  const origin = engine.ctx.currentTime
  CAR_START.forEach((note) => playNote(engine, note, origin))
  return true
}

// Pone en marcha el ruido del motor y devuelve su mando: `setThrottle(0..1)` para el tono y `stop()` para apagarlo. Un filtro de
// paso bajo quita lo chillón del diente de sierra y deja el ronroneo.
export function startCarEngine(engine) {
  if (!engine) return { setThrottle() {}, stop() {} }
  const { ctx } = engine
  const start = ctx.currentTime + IDLE_DELAY
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(420, start)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(VOLUME.idle, start + 0.2)
  const voices = [
    { type: 'sawtooth', ratio: 1, level: 1 },
    { type: 'square', ratio: 2, level: 0.35 },
  ].map(({ type, ratio, level }) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(IDLE_HZ * ratio, start)
    const mix = ctx.createGain()
    mix.gain.setValueAtTime(level, start)
    osc.connect(mix)
    mix.connect(filter)
    osc.start(start)
    return { osc, ratio }
  })
  filter.connect(gain)
  gain.connect(engine.fx)
  let stopped = false

  return {
    setThrottle(throttle) {
      if (stopped) return
      const now = Math.max(ctx.currentTime, start)
      voices.forEach(({ osc, ratio }) => osc.frequency.setTargetAtTime((IDLE_HZ + RANGE_HZ * throttle) * ratio, now, GLIDE))
      gain.gain.setTargetAtTime(VOLUME.idle + (VOLUME.full - VOLUME.idle) * throttle, now, GLIDE)
    },
    stop() {
      if (stopped) return
      stopped = true
      const now = ctx.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setTargetAtTime(0, now, FADE_OUT / 3)
      voices.forEach(({ osc }) => osc.stop(Math.max(now, start) + FADE_OUT))
    },
  }
}
