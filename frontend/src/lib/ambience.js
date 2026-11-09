// Sonido ambiente de la portada: viento, lluvia, grillos de noche, pájaros de día y truenos. Se genera
// con Web Audio (ruido filtrado y osciladores), así que no hay archivos que descargar. Lo que suena
// sale del estado del cielo (`setAmbienceScene`) y su volumen es el de efectos por el general.
import { fxLevel, subscribeSoundPrefs } from './soundMixer'

// Cuánto suena cada capa para un cielo dado. Función pura: se prueba sin audio.
export function ambienceLevels({ dark = 0, rain = 0, storm = 0, wind = 0.25 }) {
  const dry = 1 - rain
  return {
    wind: 0.12 + 0.88 * wind,
    rain,
    crickets: dark * dry,
    birds: Math.max(0, 1 - dark * 1.4) * dry * (1 - storm),
  }
}

const APPLY_EVERY_MS = 250
const RELEASE_MS = 1200

let ctx = null
let graph = null
let scene = ambienceLevels({})
let users = 0
let lastApply = 0
let closeTimer = null
let birdTimer = null
let removeUnlock = null

const randomBetween = (min, max) => min + Math.random() * (max - min)

function noiseBuffer(context, seconds) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

const noiseSource = (context, buffer) => {
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true
  source.start()
  return source
}

function chain(...nodes) {
  nodes.reduce((from, to) => {
    from.connect(to)
    return to
  })
  return nodes[nodes.length - 1]
}

// Viento: ruido que sube y baja despacio, con el tono de las ráfagas.
function buildWind(context, out, noise) {
  const filter = context.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 480
  filter.Q.value = 0.7
  const gain = context.createGain()
  gain.gain.value = 0
  chain(noiseSource(context, noise), filter, gain, out)
  const swell = context.createOscillator()
  swell.frequency.value = 0.13
  const swellDepth = context.createGain()
  swellDepth.gain.value = 0
  chain(swell, swellDepth, gain.gain)
  const gust = context.createOscillator()
  gust.frequency.value = 0.07
  const gustDepth = context.createGain()
  gustDepth.gain.value = 160
  chain(gust, gustDepth, filter.frequency)
  swell.start()
  gust.start()
  return { gain, swellDepth }
}

function buildRain(context, out, noise) {
  const high = context.createBiquadFilter()
  high.type = 'highpass'
  high.frequency.value = 1100
  const low = context.createBiquadFilter()
  low.type = 'lowpass'
  low.frequency.value = 7500
  const gain = context.createGain()
  gain.gain.value = 0
  chain(noiseSource(context, noise), high, low, gain, out)
  return { gain }
}

// Grillos: un tono agudo troceado muy rápido y en ráfagas de unos tres golpes por segundo.
function buildCrickets(context, out) {
  const tone = context.createOscillator()
  tone.frequency.value = 4300
  const chirp = context.createGain()
  chirp.gain.value = 0.5
  const chirpRate = context.createOscillator()
  chirpRate.frequency.value = 32
  const chirpDepth = context.createGain()
  chirpDepth.gain.value = 0.5
  chain(chirpRate, chirpDepth, chirp.gain)
  const burst = context.createGain()
  burst.gain.value = 0.5
  const burstRate = context.createOscillator()
  burstRate.frequency.value = 2.7
  const burstDepth = context.createGain()
  burstDepth.gain.value = 0.5
  chain(burstRate, burstDepth, burst.gain)
  const gain = context.createGain()
  gain.gain.value = 0
  chain(tone, chirp, burst, gain, out)
  ;[tone, chirpRate, burstRate].forEach((node) => node.start())
  return { gain }
}

function ensureGraph() {
  if (graph) return graph
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return null
  ctx = new Context()
  const out = ctx.createGain()
  out.gain.value = fxLevel()
  out.connect(ctx.destination)
  const noise = noiseBuffer(ctx, 3)
  graph = { out, noise, wind: buildWind(ctx, out, noise), rain: buildRain(ctx, out, noise), crickets: buildCrickets(ctx, out) }
  applyScene(true)
  scheduleBird()
  return graph
}

// Los niveles de cada capa se suavizan para que el tiempo cambie sin saltos.
function applyScene(force = false) {
  if (!graph) return
  const now = performance.now()
  if (!force && now - lastApply < APPLY_EVERY_MS) return
  lastApply = now
  const t = ctx.currentTime
  graph.wind.gain.gain.setTargetAtTime(0.1 * scene.wind, t, 0.5)
  graph.wind.swellDepth.gain.setTargetAtTime(0.06 * scene.wind, t, 0.5)
  graph.rain.gain.gain.setTargetAtTime(0.32 * scene.rain, t, 0.5)
  graph.crickets.gain.gain.setTargetAtTime(0.012 * scene.crickets, t, 0.8)
}

// Un gorjeo: dos a cuatro notas cortas que suben de tono, a un lado u otro del estéreo.
function chirp() {
  if (!graph || ctx.state !== 'running') return
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null
  if (pan) pan.pan.value = randomBetween(-0.7, 0.7)
  const target = pan || graph.out
  if (pan) chain(pan, graph.out)
  const base = randomBetween(2200, 3600)
  const notes = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < notes; i++) {
    const start = ctx.currentTime + i * 0.12
    const tone = ctx.createOscillator()
    tone.frequency.setValueAtTime(base, start)
    tone.frequency.exponentialRampToValueAtTime(base * 1.35, start + 0.08)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, start)
    env.gain.linearRampToValueAtTime(0.1, start + 0.015)
    env.gain.linearRampToValueAtTime(0, start + 0.09)
    chain(tone, env, target)
    tone.start(start)
    tone.stop(start + 0.1)
  }
}

function scheduleBird() {
  clearTimeout(birdTimer)
  birdTimer = setTimeout(() => {
    if (!graph) return
    if (Math.random() < scene.birds) chirp()
    scheduleBird()
  }, randomBetween(1200, 3600))
}

// Trueno: un estallido de ruido grave que se apaga despacio, con un retumbo por debajo.
export function thunder(delaySeconds = 0.5) {
  if (!graph || ctx.state !== 'running') return
  const start = ctx.currentTime + delaySeconds
  const rumble = ctx.createBufferSource()
  rumble.buffer = graph.noise
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(900, start)
  filter.frequency.exponentialRampToValueAtTime(90, start + 2.6)
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, start)
  env.gain.linearRampToValueAtTime(1.1, start + 0.05)
  env.gain.setTargetAtTime(0, start + 0.3, 0.9)
  chain(rumble, filter, env, graph.out)
  rumble.start(start, Math.random() * 2)
  rumble.stop(start + 4)
  const sub = ctx.createOscillator()
  sub.frequency.value = 48
  const subEnv = ctx.createGain()
  subEnv.gain.setValueAtTime(0, start)
  subEnv.gain.linearRampToValueAtTime(0.5, start + 0.08)
  subEnv.gain.setTargetAtTime(0, start + 0.3, 0.8)
  chain(sub, subEnv, graph.out)
  sub.start(start)
  sub.stop(start + 4)
}

// Un gorjeo suelto para oír cómo suenan los efectos al mover su volumen.
export function previewFx() {
  if (!ensureGraph()) return
  ctx.resume?.()
  chirp()
}

export function setAmbienceScene(sky) {
  scene = ambienceLevels(sky)
  applyScene()
}

subscribeSoundPrefs(() => {
  if (graph) graph.out.gain.setTargetAtTime(fxLevel(), ctx.currentTime, 0.05)
})

// El navegador solo deja arrancar el audio tras un gesto; si ya hubo alguno, arranca en el acto.
function unlock() {
  const events = ['pointerdown', 'keydown']
  const start = () => {
    removeUnlock?.()
    if (users > 0 && ensureGraph()) ctx.resume?.()
  }
  events.forEach((name) => document.addEventListener(name, start))
  removeUnlock = () => {
    events.forEach((name) => document.removeEventListener(name, start))
    removeUnlock = null
  }
}

// Una pantalla que quiere sonido ambiente lo pide al montarse y lo suelta al desmontarse.
export function acquireAmbience() {
  users += 1
  clearTimeout(closeTimer)
  if (graph) {
    graph.out.gain.setTargetAtTime(fxLevel(), ctx.currentTime, 0.1)
    if (ctx.state === 'suspended') ctx.resume?.()
  }
  if (users === 1 && !graph) {
    if (navigator.userActivation?.hasBeenActive && ensureGraph()) ctx.resume?.()
    else unlock()
  }

  return () => {
    users -= 1
    if (users > 0) return
    removeUnlock?.()
    if (!graph) return
    graph.out.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
    closeTimer = setTimeout(() => {
      clearTimeout(birdTimer)
      ctx.close()
      ctx = null
      graph = null
    }, RELEASE_MS)
  }
}
