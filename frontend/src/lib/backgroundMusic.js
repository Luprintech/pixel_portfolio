import { clampVolume } from './audioPrefs'
import { getEngine, onEngineGesture, refreshLevels, startEngineIfAllowed } from './audioEngine'
import { getSoundPrefs, musicLevel, subscribeSoundPrefs, updateSoundPrefs } from './soundMixer'

// Pista de fondo única para toda la visita. Vive fuera de los componentes para que la música no se
// corte ni empiece de nuevo al pasar de la portada al creador de viajera: cuando nadie la usa, se
// apaga con un fundido tras una breve espera.
//
// Suena a través del bus de música del motor de audio (`audioEngine`): en iPhone el volumen de un
// <audio> no hace nada, así que el volumen y el silencio se aplican con una ganancia de Web Audio. Sin
// Web Audio se vuelve al volumen del propio elemento.
export const MUSIC_SRC = `/audio/${encodeURIComponent('Welcome Valle del Bucle.mp3')}`

const GRACE_MS = 1500
const FADE_MS = 600
const FADE_STEPS = 12

const listeners = new Set()
let audio = null
let routed = false
let snapshot = { available: false, playing: false }
let users = 0
let graceTimer = null
let fadeTimer = null
let checked = false

function cancelFade() {
  clearInterval(fadeTimer)
  fadeTimer = null
  // Un fundido a medias dejó el volumen bajo: se restaura.
  if (routed) refreshLevels()
  else if (audio) audio.volume = musicLevel()
}

const publish = (patch) => {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

// El volumen y el silencio pueden cambiar desde la barra de la pantalla o desde Opciones. Con el
// elemento conectado al motor los aplica el bus; si no, el propio elemento.
subscribeSoundPrefs(() => {
  if (audio && !routed && !fadeTimer) audio.volume = musicLevel()
})

function ensureAudio() {
  if (audio) return audio
  audio = new Audio()
  audio.src = MUSIC_SRC
  audio.loop = true
  audio.preload = 'none'
  return audio
}

// Conecta el elemento al bus de música en cuanto el motor existe. Un elemento solo admite una fuente.
function route(element) {
  const engine = getEngine()
  if (routed || !engine) return
  try {
    engine.ctx.createMediaElementSource(element).connect(engine.music)
    element.volume = 1
    routed = true
  } catch {
    // Sin esta posibilidad el volumen sigue siendo el del elemento.
  }
}

async function start() {
  const element = ensureAudio()
  route(element)
  if (fadeTimer) cancelFade()
  if (!routed) element.volume = musicLevel()
  try {
    await element.play()
    publish({ playing: true })
  } catch {
    // El navegador exige un gesto del usuario antes de dejar sonar: se reintenta en el primero.
    publish({ playing: false })
  }
}

function stop() {
  audio?.pause()
  publish({ playing: false })
}

// En desarrollo un archivo que falta devuelve la página de inicio con 200: se mira el tipo de contenido.
function checkAvailable() {
  if (checked) return
  checked = true
  fetch(MUSIC_SRC, { method: 'HEAD' })
    .then((response) => {
      const isAudio = response.ok && (response.headers.get('content-type') || '').startsWith('audio')
      publish({ available: isAudio })
      if (isAudio && getSoundPrefs().music > 0 && users > 0) start()
    })
    .catch(() => publish({ available: false }))
}

// Con la música bloqueada por el navegador, el primer gesto del visitante la hace sonar. En iPhone
// la reproducción tiene que arrancar dentro del propio gesto, por eso se pide al motor de audio.
onEngineGesture(() => {
  if (users > 0 && getSoundPrefs().music > 0 && snapshot.available && !snapshot.playing) start()
})

// Un componente que quiere música la pide al montarse y la suelta al desmontarse.
export function acquireMusic() {
  users += 1
  clearTimeout(graceTimer)
  if (fadeTimer) cancelFade()
  startEngineIfAllowed()
  checkAvailable()
  if (snapshot.available && getSoundPrefs().music > 0 && !snapshot.playing) start()

  return () => {
    users -= 1
    if (users > 0) return
    graceTimer = setTimeout(fadeOut, GRACE_MS)
  }
}

// Fundido de salida: con el motor, bajando la ganancia del bus (única forma que funciona en iPhone);
// sin él, el volumen del elemento.
function fadeOut() {
  if (!audio || audio.paused) return stop()
  const engine = routed ? getEngine() : null
  if (engine) {
    const now = engine.ctx.currentTime
    engine.music.gain.cancelScheduledValues(now)
    engine.music.gain.setValueAtTime(engine.music.gain.value, now)
    engine.music.gain.linearRampToValueAtTime(0, now + FADE_MS / 1000)
    fadeTimer = setInterval(() => {
      cancelFade()
      stop()
    }, FADE_MS)
    return undefined
  }
  const from = audio.volume
  let step = 0
  fadeTimer = setInterval(() => {
    step += 1
    audio.volume = Math.max(0, from * (1 - step / FADE_STEPS))
    if (step >= FADE_STEPS) {
      cancelFade()
      stop()
    }
  }, FADE_MS / FADE_STEPS)
  return undefined
}

// Con el volumen de la música a cero se apaga; al subirlo vuelve a sonar.
export function setMusicVolume(value) {
  const music = clampVolume(value)
  updateSoundPrefs({ music, muted: false })
  if (music === 0) stop()
  else if (!snapshot.playing) start()
}

export const subscribeMusic = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getMusicSnapshot = () => snapshot
