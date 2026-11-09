// Motor de audio compartido: un único AudioContext con dos buses, el de la música y el de los efectos
// (ambiente y mascotas), cuyo volumen sale del mezclador (`soundMixer`). Todo el sonido pasa por aquí
// por dos razones de iOS, que Chrome y los demás navegadores del iPhone comparten porque todos usan
// WebKit:
//   - el volumen de un <audio> (`element.volume`) no hace nada, así que ni las barras ni el silencio
//     cambiarían la música; con una ganancia de Web Audio sí;
//   - el contexto solo arranca dentro de un gesto del visitante (toque o clic), y no basta con
//     `pointerdown`: hay que reaccionar también a `touchend` y `click`.
// En Android y en escritorio pasa lo mismo sin más complicaciones.
import { fxLevel, musicLevel, subscribeSoundPrefs } from './soundMixer'

const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']
const LEVEL_EASE = 0.05

let ctx = null
let buses = null
let armed = false
const onGesture = new Set()

// Los buses y su contexto, o `null` mientras no se haya podido crear (aún no hubo un gesto, o el
// navegador no tiene Web Audio).
export const getEngine = () => buses

// Vuelve a poner los buses al volumen del mezclador (tras un fundido, por ejemplo).
export function refreshLevels() {
  if (!buses) return
  const now = ctx.currentTime
  buses.music.gain.setTargetAtTime(musicLevel(), now, LEVEL_EASE)
  buses.fx.gain.setTargetAtTime(fxLevel(), now, LEVEL_EASE)
}

function build() {
  const Context = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
  if (!Context) return null
  ctx = new Context()
  const music = ctx.createGain()
  const fx = ctx.createGain()
  music.connect(ctx.destination)
  fx.connect(ctx.destination)
  buses = { ctx, music, fx }
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
  // iOS deja el contexto "interrumpido" con una llamada o al bloquear la pantalla: se reanuda al volver.
  document.addEventListener('visibilitychange', () => {
    if (buses && document.visibilityState === 'visible' && ctx.state !== 'running') ctx.resume().catch(() => {})
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
