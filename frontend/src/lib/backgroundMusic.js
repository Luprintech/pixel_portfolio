import { clampVolume } from './audioPrefs'
import { getEngine, onEngineGesture, refreshLevels, startEngineIfAllowed } from './audioEngine'
import { getSoundPrefs, musicLevel, subscribeSoundPrefs, updateSoundPrefs } from './soundMixer'

// Música de fondo de la visita. Vive fuera de los componentes para que no se corte ni empiece de nuevo
// al pasar de la portada al creador de viajera o viajero: cuando nadie la usa, se apaga con un fundido
// tras una breve espera. Hay dos pistas: "welcome" (portada y creador) y "valley" (dentro del valle).
// Al cambiar de pantalla entre una y otra, la que suena se apaga con un fundido y empieza la nueva.
//
// Suena a través del bus de música del motor de audio (`audioEngine`): en iPhone el volumen de un
// <audio> no hace nada, así que el volumen y el silencio se aplican con una ganancia de Web Audio. Sin
// Web Audio se vuelve al volumen del propio elemento.
export const TRACKS = {
  welcome: `/audio/${encodeURIComponent('Welcome Valle del Bucle.mp3')}`,
  valley: `/audio/${encodeURIComponent('Valle Exploration.mp3')}`,
}

const GRACE_MS = 1500
const FADE_MS = 600
const FADE_STEPS = 12

const listeners = new Set()
let audio = null
let routed = false
let snapshot = { available: false, playing: false }
let users = 0
// Actividades que piden silencio (el ordenador, la recreativa, la minicadena): mientras haya alguna, la pista de fondo no
// suena aunque haya quien la use. Ver `holdBackground`.
let holds = 0
let graceTimer = null
let fadeTimer = null
// Pista que suena o que toca sonar, y si su archivo existe (se comprueba una vez por pista).
let track = 'welcome'
const availability = {}

function cancelFade() {
  clearInterval(fadeTimer)
  fadeTimer = null
  // Un fundido a medias dejó el volumen bajo: se restaura.
  if (routed) refreshLevels()
  else applyElementLevel()
}

const publish = (patch) => {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

// El volumen y el silencio pueden cambiar desde la barra de la pantalla o desde Opciones. Con el
// elemento conectado al motor los aplica el bus; si no, el propio elemento.
subscribeSoundPrefs(() => applyElementLevel())

// Sin motor de audio el volumen y el silencio los lleva el propio elemento. `muted` además de `volume`
// porque algunos móviles ignoran el segundo.
function applyElementLevel() {
  if (!audio || routed || fadeTimer) return
  audio.volume = musicLevel()
  audio.muted = getSoundPrefs().muted
}

function ensureAudio() {
  if (audio) return audio
  audio = new Audio()
  audio.src = TRACKS[track]
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
    // Desde aquí el volumen y el silencio los pone el bus; el elemento queda abierto del todo.
    element.volume = 1
    element.muted = false
    routed = true
  } catch {
    // Sin esta posibilidad el volumen sigue siendo el del elemento.
  }
}

async function start() {
  if (holds > 0) return
  const element = ensureAudio()
  route(element)
  if (fadeTimer) cancelFade()
  applyElementLevel()
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
function checkAvailable(name) {
  if (name in availability) return
  availability[name] = false
  fetch(TRACKS[name], { method: 'HEAD' })
    .then((response) => {
      const isAudio = response.ok && (response.headers.get('content-type') || '').startsWith('audio')
      availability[name] = isAudio
      // Si mientras tanto se cambió de pista, este resultado no es el de la que toca.
      if (name !== track) return
      publish({ available: isAudio })
      if (isAudio && getSoundPrefs().music > 0 && users > 0) start()
    })
    .catch(() => name === track && publish({ available: false }))
}

// Cambia de pista: si suena otra, se apaga con un fundido y entra la nueva; si no, entra directamente.
function switchTrack(name) {
  track = name
  publish({ available: !!availability[name] })
  checkAvailable(name)
  const begin = () => {
    if (audio) audio.src = TRACKS[track]
    if (users > 0 && getSoundPrefs().music > 0 && availability[track]) start()
  }
  if (!audio || audio.paused) begin()
  else fadeOut(begin)
}

// Sin motor de audio el contexto no la suspende: con la página oculta se pausa el elemento y, al volver,
// se retoma si alguien la sigue usando.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') audio?.pause()
    else if (users > 0 && getSoundPrefs().music > 0 && snapshot.available && snapshot.playing) start()
  })
}

// Con la música bloqueada por el navegador, el primer gesto del visitante la hace sonar. En iPhone
// la reproducción tiene que arrancar dentro del propio gesto, por eso se pide al motor de audio.
onEngineGesture(() => {
  // Si el navegador dejó sonar la pista antes del primer gesto, el motor aún no existía y suena sin
  // pasar por él: es el momento de conectarla, o ni el silencio ni las barras la alcanzarían.
  if (audio && !routed) {
    route(audio)
    refreshLevels()
  }
  if (users > 0 && getSoundPrefs().music > 0 && snapshot.available && !snapshot.playing) start()
})

// Un componente que quiere música la pide al montarse y la suelta al desmontarse. `name` es la pista
// ('welcome' por defecto); si es otra que la actual, se cambia.
export function acquireMusic(name = 'welcome') {
  users += 1
  clearTimeout(graceTimer)
  if (fadeTimer) cancelFade()
  startEngineIfAllowed()
  if (name !== track) switchTrack(name)
  else {
    checkAvailable(track)
    if (snapshot.available && getSoundPrefs().music > 0 && !snapshot.playing) start()
  }

  return () => {
    users -= 1
    if (users > 0) return
    graceTimer = setTimeout(fadeOut, GRACE_MS)
  }
}

// Fundido de salida: con el motor, bajando la ganancia del bus (única forma que funciona en iPhone);
// sin él, el volumen del elemento. Al terminar se para y, si se pasa `then`, se llama después.
function fadeOut(then) {
  // Dos fundidos a la vez dejarían un intervalo huérfano repitiendo `finish` para siempre.
  clearInterval(fadeTimer)
  const finish = () => {
    cancelFade()
    stop()
    then?.()
  }
  if (!audio || audio.paused) {
    stop()
    then?.()
    return undefined
  }
  const engine = routed ? getEngine() : null
  if (engine) {
    const now = engine.ctx.currentTime
    engine.music.gain.cancelScheduledValues(now)
    engine.music.gain.setValueAtTime(engine.music.gain.value, now)
    engine.music.gain.linearRampToValueAtTime(0, now + FADE_MS / 1000)
    fadeTimer = setInterval(finish, FADE_MS)
    return undefined
  }
  const from = audio.volume
  let step = 0
  fadeTimer = setInterval(() => {
    step += 1
    audio.volume = Math.max(0, from * (1 - step / FADE_STEPS))
    if (step >= FADE_STEPS) finish()
  }, FADE_MS / FADE_STEPS)
  return undefined
}

// Una actividad con música propia pide silencio para la pista de fondo: se apaga con un fundido y, cuando ya no suena,
// se llama a `onQuiet` (así la música de la actividad nunca se solapa con ella). Devuelve cómo soltarla: cuando no queda
// ninguna actividad, la pista de fondo vuelve donde estaba si alguien la sigue usando.
export function holdBackground(onQuiet) {
  holds += 1
  if (holds === 1) fadeOut(onQuiet)
  else onQuiet?.()
  let released = false
  return () => {
    if (released) return
    released = true
    holds -= 1
    if (holds > 0) return
    // Un fundido a medias se cancela: si no, acabaría parando la pista que ahora vuelve.
    if (fadeTimer) cancelFade()
    if (users > 0 && getSoundPrefs().music > 0 && snapshot.available) start()
  }
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

// En desarrollo, al recargar el módulo en caliente el elemento de audio del módulo anterior seguiría sonando
// sin que nadie pudiera pararlo; se apaga aquí.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(fadeTimer)
    clearTimeout(graceTimer)
    audio?.pause()
  })
}
