// Motor de audio compartido: un único AudioContext con dos buses, el de la música y el de los efectos
// (ambiente y mascotas), cuyo volumen sale del mezclador (`soundMixer`). Todo el sonido pasa por aquí
// por dos razones de iOS, que Chrome y los demás navegadores del iPhone comparten porque todos usan
// WebKit:
//   - el volumen de un <audio> (`element.volume`) no hace nada, así que ni las barras ni el silencio
//     cambiarían la música; con una ganancia de Web Audio sí;
//   - el contexto solo arranca dentro de un gesto del visitante (toque o clic), y no basta con
//     `pointerdown`: hay que reaccionar también a `touchend` y `click`.
// En Android y en escritorio pasa lo mismo sin más complicaciones.
import { channelLevels, masterLevel, subscribeSoundPrefs } from './soundMixer'

const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']
const LEVEL_EASE = 0.05

let ctx = null
let buses = null
let armed = false
const onGesture = new Set()

// Los buses y su contexto, o `null` mientras no se haya podido crear (aún no hubo un gesto, o el
// navegador no tiene Web Audio).
export const getEngine = () => buses

// Ajusta una ganancia al nivel pedido. Se borra antes lo que quedara programado (un fundido a medias,
// por ejemplo): si no, esa rampa seguía mandando y el volumen dejaba de responder a las barras.
function setLevel(param, value, now) {
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  param.setTargetAtTime(value, now, LEVEL_EASE)
}

// Vuelve a poner el nodo general y los dos buses al volumen del mezclador.
export function refreshLevels() {
  if (!buses) return
  const now = ctx.currentTime
  const { music, fx } = channelLevels()
  setLevel(buses.master.gain, masterLevel(), now)
  setLevel(buses.music.gain, music, now)
  setLevel(buses.fx.gain, fx, now)
}

// Música y efectos desembocan en un nodo general antes de la salida. Ahí viven el volumen general y el
// silencio, así que no hay ningún sonido que pueda esquivarlos.
function build() {
  const Context = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!Context) return null
  ctx = new Context()
  const master = ctx.createGain()
  const music = ctx.createGain()
  const fx = ctx.createGain()
  music.connect(master)
  fx.connect(master)
  master.connect(ctx.destination)
  buses = { ctx, master, music, fx }
  refreshLevels()
  // En iPhone, el interruptor de silencio apaga Web Audio salvo que la sesión sea de reproducción.
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback'
  } catch {
    // Safari sin esta API: sonará con el interruptor en modo sonido.
  }
  return buses
}

// Crea el contexto y lo reanuda. Solo funciona dentro de un gesto del visitante (o si ya hubo alguno).
function unlock() {
  if (!buses && !build()) return
  if (ctx.state !== 'running') ctx.resume().catch(() => {})
  // Un instante de silencio dentro del gesto termina de desbloquear la salida en iOS.
  const blip = ctx.createBufferSource()
  blip.buffer = ctx.createBuffer(1, 1, 22050)
  blip.connect(ctx.destination)
  blip.start(0)
}

function handleGesture() {
  unlock()
  onGesture.forEach((callback) => callback())
}

function arm() {
  if (armed || typeof document === 'undefined') return
  armed = true
  GESTURES.forEach((name) => document.addEventListener(name, handleGesture, { capture: true, passive: true }))
  // Con la página oculta (pestaña en segundo plano, panel cerrado) todo el sonido se para: el contexto se
  // suspende y, al volver, se reanuda. También cubre el "interrumpido" de iOS con una llamada o al bloquear
  // la pantalla, que solo se arregla reanudando.
  document.addEventListener('visibilitychange', () => {
    if (!buses) return
    if (document.visibilityState === 'hidden') ctx.suspend().catch(() => {})
    else if (ctx.state !== 'running') ctx.resume().catch(() => {})
  })
  subscribeSoundPrefs(refreshLevels)
}

// Pide que se llame a `callback` dentro de cada gesto del visitante, justo después de desbloquear el
// audio: es el momento en que iOS deja arrancar una pista o un sonido. Devuelve cómo dejar de hacerlo.
export function onEngineGesture(callback) {
  arm()
  onGesture.add(callback)
  return () => onGesture.delete(callback)
}

// Si el visitante ya ha tocado la página (por ejemplo al llegar desde otra pantalla), el audio puede
// arrancar sin esperar a otro gesto.
export function startEngineIfAllowed() {
  arm()
  if (!buses && navigator.userActivation?.hasBeenActive) unlock()
  return buses
}

// En desarrollo, al recargar el módulo en caliente el contexto anterior seguiría vivo y sonando.
if (import.meta.hot) import.meta.hot.dispose(() => ctx?.close().catch(() => {}))
