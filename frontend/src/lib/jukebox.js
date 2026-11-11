// Reproductor de música de la casa de Lupe: lo usan la minicadena y el Winamp del escritorio. Por ahora la lista son las
// canciones del propio juego (`public/audio`); más adelante será la lista de canciones favoritas de Lupe, que se añadirá a
// `TRACKS`. Vive fuera de los componentes para que la música siga al cerrar el escritorio. El volumen es el de música del
// mezclador de Opciones.
import { musicLevel, subscribeSoundPrefs } from './soundMixer'

export const TRACKS = [
  { id: 'casa', title: 'Casa Lupe - Afterno Mischievo', file: 'Casa Lupe - Afterno Mischievo.mp3' },
  { id: 'luna', title: 'Pixel Village at Moonlight', file: 'Pixel Village at Moonlight.mp3' },
  { id: 'mediodia', title: 'Village at Noon', file: 'Village at Noon.mp3' },
  { id: 'valle', title: 'Valle Exploration', file: 'Valle Exploration.mp3' },
  { id: 'bienvenida', title: 'Welcome Valle del Bucle', file: 'Welcome Valle del Bucle.mp3' },
]

export const trackUrl = (track) => `/audio/${encodeURIComponent(track.file)}`

const listeners = new Set()
let audio = null
let state = { playing: false, index: 0 }

const emit = () => listeners.forEach((listener) => listener(state))
const set = (patch) => {
  state = { ...state, ...patch }
  emit()
}

function element() {
  if (audio || typeof Audio === 'undefined') return audio
  audio = new Audio()
  audio.volume = musicLevel()
  audio.addEventListener('ended', () => jukebox.next())
  audio.addEventListener('pause', () => state.playing && !audio.ended && set({ playing: false }))
  subscribeSoundPrefs(() => {
    audio.volume = musicLevel()
  })
  return audio
}

export const jukebox = {
  snapshot: () => state,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  play(index = state.index) {
    const el = element()
    if (!el) return
    const track = TRACKS[(index + TRACKS.length) % TRACKS.length]
    const changed = !el.src.endsWith(encodeURIComponent(track.file))
    if (changed) el.src = trackUrl(track)
    set({ index: TRACKS.indexOf(track), playing: true })
    el.play().catch(() => set({ playing: false }))
  },
  pause() {
    audio?.pause()
    set({ playing: false })
  },
  toggle() {
    if (state.playing) jukebox.pause()
    else jukebox.play()
  },
  next() {
    jukebox.play(state.index + 1)
  },
  previous() {
    jukebox.play(state.index - 1)
  },
}
