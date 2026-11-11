// Reproductor de música retro: lee una canción de `chiptuneSongs.js` y la toca en bucle con osciladores de Web Audio por el
// bus de música del motor (`audioEngine`), así el volumen de música, el general y el silencio de Opciones la gobiernan igual
// que a cualquier otra pista. Las notas se programan con unos segundos de adelanto y al parar se apagan todas a la vez.
import { THEMES } from './chiptuneSongs'
import { getEngine, onEngineGesture, startEngineIfAllowed } from './audioEngine'

const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12)
const AHEAD_S = 1.2
const TICK_MS = 250
const FADE_OUT_S = 0.06
const ATTACK = 0.006

// Notas de una vuelta de la canción, con su instante (en segundos desde el inicio del bucle). Pura: se prueba sin audio.
export function songEvents(song) {
  const beat = 60 / song.bpm
  const events = song.voices.flatMap((voice) => {
    let at = 0
    return voice.notes.flatMap(([note, beats]) => {
      const start = at
      at += beats * beat
      if (note === null) return []
      return [{ type: voice.type, volume: voice.volume, at: start, length: beats * beat * 0.92, freq: voice.type === 'noise' ? note : midiToHz(note) }]
    })
  })
  return { events, length: song.loopBeats * beat }
}

// Cuántos pulsos suma cada voz: deben coincidir con `loopBeats` para que el bucle cierre.
export const voiceBeats = (voice) => voice.notes.reduce((sum, [, beats]) => sum + beats, 0)

let noise = null
const noiseBuffer = (ctx) => {
  if (noise?.ctx === ctx) return noise.buffer
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  noise = { ctx, buffer }
  return buffer
}

function scheduleNote(ctx, out, event, origin, sources) {
  const start = origin + event.at
  const end = start + event.length
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(event.volume, start + ATTACK)
  env.gain.setValueAtTime(event.volume, Math.max(start + ATTACK, end - 0.03))
  env.gain.linearRampToValueAtTime(0, end)
  let source
  if (event.type === 'noise') {
    source = ctx.createBufferSource()
    source.buffer = noiseBuffer(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = event.freq
    source.connect(filter)
    filter.connect(env)
  } else {
    source = ctx.createOscillator()
    source.type = event.type
    source.frequency.value = event.freq
    source.connect(env)
  }
  env.connect(out)
  source.start(start)
  source.stop(end + 0.02)
  sources.add(source)
  source.onended = () => sources.delete(source)
}

// Empieza a tocar la canción de la actividad `id` y devuelve la función que la para. Si aún no hay motor de audio (el
// navegador no dejó arrancarlo sin un gesto), espera al primero; parar antes de que empiece lo cancela.
export function startTheme(id) {
  const song = THEMES[id]
  if (!song) return () => {}
  const { events, length } = songEvents(song)
  let stopped = false
  let timer = null
  let running = null
  let forget = () => {}

  const begin = (engine) => {
    const { ctx } = engine
    const out = ctx.createGain()
    out.connect(engine.music)
    const sources = new Set()
    let next = ctx.currentTime + 0.05
    const fill = () => {
      while (next < ctx.currentTime + AHEAD_S) {
        events.forEach((event) => scheduleNote(ctx, out, event, next, sources))
        next += length
      }
    }
    fill()
    timer = setInterval(fill, TICK_MS)
    running = { ctx, out, sources }
  }

  const engine = getEngine() ?? startEngineIfAllowed()
  if (engine) begin(engine)
  else {
    forget = onEngineGesture(() => {
      const ready = getEngine()
      if (!ready || running || stopped) return
      forget()
      begin(ready)
    })
  }

  return () => {
    stopped = true
    forget()
    clearInterval(timer)
    if (!running) return
    const { ctx, out, sources } = running
    const now = ctx.currentTime
    out.gain.cancelScheduledValues(now)
    out.gain.setValueAtTime(out.gain.value, now)
    out.gain.linearRampToValueAtTime(0, now + FADE_OUT_S)
    // Las notas ya programadas se paran con el fundido: no queda nada sonando ni esperando.
    sources.forEach((source) => {
      try {
        source.stop(now + FADE_OUT_S + 0.01)
      } catch {
        // Ya había terminado.
      }
    })
    setTimeout(() => out.disconnect(), (FADE_OUT_S + 0.1) * 1000)
    running = null
  }
}
