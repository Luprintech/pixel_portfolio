// Sonido de las mascotas: el maullido de los gatos y el ladrido de los perros, grabaciones de
// `public/sounds/`. Suenan al pulsar el botón del creador (el gesto que los navegadores exigen) y, el
// maullido, cuando Khalessi maúlla en la portada. Cada raza afina la voz según su tamaño cambiando la
// velocidad de reproducción: las pequeñas suenan más agudas y las grandes más graves. Su volumen es el
// de efectos por el general. Con Web Audio disponible suenan por el bus de efectos del motor de audio,
// que en iPhone es la única forma de que el volumen y el silencio les afecten.
import { getEngine } from './audioEngine'
import { fxLevel } from './soundMixer'

const SOUNDS = {
  gato: '/sounds/Maullido gato.mp3',
  perro: '/sounds/Ladrido perro.mp3',
  // El maullido de Khalessi cuando un trueno la asusta en la portada; no es una opción del creador.
  gatoAsustado: '/sounds/maullido gato asustado.mp3',
}

// Velocidad de cada raza respecto a la grabación: por encima de 1 es más agudo, por debajo, más grave.
const RATE = {
  collie: 1,
  pastor: 0.85,
  beagle: 1.1,
  husky: 0.95,
  teckel: 1.2,
  comun: 1,
  persa: 0.92,
  maine: 0.82,
  sphynx: 1.15,
  bengala: 1.05,
}

// Qué grabación suena y a qué velocidad, aparte del audio para poder comprobarlo sin un navegador.
export function petSound(kind, breed) {
  return { src: encodeURI(SOUNDS[kind]), rate: RATE[breed] ?? 1 }
}

let playing = null

const buffers = new Map()

// Decodifica la grabación una sola vez. `decodeAudioData` con callbacks funciona en todos los Safari.
function loadBuffer(ctx, src) {
  if (!buffers.has(src)) {
    const decoded = fetch(src)
      .then((response) => response.arrayBuffer())
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
    decoded.catch(() => buffers.delete(src))
    buffers.set(src, decoded)
  }
  return buffers.get(src)
}

// Con el motor de audio la grabación suena como un buffer por el bus de efectos: el volumen y el
// silencio funcionan también en iPhone, y puede sonar sin un gesto (el maullido de Khalessi) porque
// el contexto ya está desbloqueado. La velocidad cambia también el tono, que es lo que se busca.
async function playWithEngine(engine, src, rate) {
  const buffer = await loadBuffer(engine.ctx, src).catch(() => null)
  if (!buffer) return false
  const source = engine.ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = rate
  const gain = engine.ctx.createGain()
  gain.gain.value = 0.8
  source.connect(gain)
  gain.connect(engine.fx)
  stopCurrent()
  playing = source
  source.start()
  return true
}

function stopCurrent() {
  if (!playing) return
  if (typeof playing.stop === 'function') {
    try {
      playing.stop()
    } catch {
      // Ya había terminado.
    }
  } else {
    playing.pause()
  }
  playing = null
}

// Hace sonar a la mascota; si ya estaba sonando, empieza de nuevo. Devuelve una promesa con false si
// el navegador no puede reproducirlo (sin audio, o archivo que no carga).
export async function playPetSound(kind, breed) {
  if (!SOUNDS[kind]) return false
  const { src, rate } = petSound(kind, breed)
  const engine = getEngine()
  if (engine) return playWithEngine(engine, src, rate)
  if (typeof Audio === 'undefined') return false
  stopCurrent()
  const audio = new Audio(src)
  // Sin esto el navegador corrige el tono al cambiar la velocidad y todas las razas sonarían igual.
  audio.preservesPitch = false
  audio.playbackRate = rate
  audio.volume = fxLevel(0.8)
  playing = audio
  try {
    await audio.play()
    return true
  } catch {
    return false
  }
}
