import { clampVolume } from './audioPrefs'
import { getSoundPrefs, musicLevel, subscribeSoundPrefs, updateSoundPrefs } from './soundMixer'

// Pista de fondo única para toda la visita. Vive fuera de los componentes para que la música no se
// corte ni empiece de nuevo al pasar de la portada al creador de viajera: cuando nadie la usa, se
// apaga con un fundido tras una breve espera.
export const MUSIC_SRC = `/audio/${encodeURIComponent('Welcome Valle del Bucle.mp3')}`

const GRACE_MS = 1500
const FADE_MS = 600
const FADE_STEPS = 12

const listeners = new Set()
let audio = null
let snapshot = { available: false, playing: false, volume: getSoundPrefs().master }
let users = 0
let graceTimer = null
let fadeTimer = null
let checked = false

function cancelFade() {
  clearInterval(fadeTimer)
  fadeTimer = null
}

const publish = (patch) => {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

// El volumen y el silencio pueden cambiar desde la barra de la pantalla o desde Opciones.
subscribeSoundPrefs(() => {
  if (audio && !fadeTimer) audio.volume = musicLevel()
})

function ensureAudio() {
  if (audio) return audio
  audio = new Audio()
  audio.src = MUSIC_SRC
  audio.loop = true
  audio.preload = 'none'
  return audio
}

async function start() {
  const element = ensureAudio()
  cancelFade()
  element.volume = musicLevel()
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

// Con la música encendida pero bloqueada por el navegador, el primer toque o tecla la hace sonar.
function unlockOnGesture() {
  const events = ['pointerdown', 'keydown']
  const retry = () => {
    events.forEach((name) => document.removeEventListener(name, retry))
    if (users > 0 && getSoundPrefs().music > 0 && snapshot.available && !snapshot.playing) start()
  }
  events.forEach((name) => document.addEventListener(name, retry))
  return () => events.forEach((name) => document.removeEventListener(name, retry))
}

let removeUnlock = null

// Un componente que quiere música la pide al montarse y la suelta al desmontarse.
export function acquireMusic() {
  users += 1
  clearTimeout(graceTimer)
  cancelFade()
  if (audio && snapshot.playing) audio.volume = musicLevel()
  checkAvailable()
  if (users === 1) removeUnlock = unlockOnGesture()
  if (snapshot.available && getSoundPrefs().music > 0 && !snapshot.playing) start()

  return () => {
    users -= 1
    if (users > 0) return
    removeUnlock?.()
    graceTimer = setTimeout(fadeOut, GRACE_MS)
  }
}

function fadeOut() {
  if (!audio || audio.paused) return stop()
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
