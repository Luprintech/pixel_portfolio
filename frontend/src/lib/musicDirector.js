// Director de la música de la casa de Lupe: decide qué suena en cada momento para que nunca haya dos pistas a la vez.
//   - Sin actividad, suena la pista de fondo del valle (`backgroundMusic`).
//   - Con el ordenador o la recreativa abiertos suena solo la canción de esa actividad (`chiptuneSongs`), y la de fondo
//     calla con un fundido antes de que entre.
//   - Si la minicadena (o el Winamp del escritorio) está sonando, manda ella: la canción de la actividad se pausa.
// Al terminar todo, la pista de fondo vuelve. El volumen, el silencio y el mezclador son los de siempre, porque todo pasa por
// el bus de música del motor de audio.
import { holdBackground } from './backgroundMusic'
import { startTheme } from './chiptune'
import { jukebox, setJukeboxGate } from './jukebox'

// Margen entre parar una canción y devolver la pista de fondo: lo que dura el fundido corto de salida.
const HANDOVER_MS = 90

let activity = null
let jukeboxPlaying = false
let hold = null
let theme = null
let waiting = []

const flushWaiting = () => {
  const pending = waiting
  waiting = []
  pending.forEach((start) => start())
}

function reconcile() {
  const silence = Boolean(activity) || jukeboxPlaying
  if (silence && !hold) {
    const mine = { quiet: false, release: null }
    mine.release = holdBackground(() => {
      mine.quiet = true
      if (hold === mine) reconcile()
    })
    hold = mine
  } else if (!silence && hold) {
    const done = hold
    hold = null
    waiting = []
    // Si sonaba una canción de actividad se le da un instante para apagarse antes de devolver la pista de fondo.
    if (theme) setTimeout(() => done.release(), HANDOVER_MS)
    else done.release()
  }

  const wanted = activity && !jukeboxPlaying && hold?.quiet ? activity : null
  if (theme && theme.id !== wanted) {
    theme.stop()
    theme = null
  }
  if (wanted && !theme) theme = { id: wanted, stop: startTheme(wanted) }
  if (hold?.quiet) flushWaiting()
}

// La actividad abierta (`'pc'`, `'adventure'`...) o `null` al cerrarla.
export function setActivity(id) {
  if (id === activity) return
  activity = id
  reconcile()
}

// La minicadena empieza o deja de sonar. El Winamp comparte reproductor con ella (`jukebox`).
function setJukeboxPlaying(playing) {
  if (playing === jukeboxPlaying) return
  jukeboxPlaying = playing
  reconcile()
}

// El reproductor pide arrancar una pista: espera a que la de fondo haya callado, para no solaparse con ella.
function whenQuiet(start) {
  if (hold?.quiet) start()
  else waiting.push(start)
}

// Engancha el director al reproductor de la casa. Devuelve cómo soltarlo y deja todo como estaba.
export function startMusicDirector() {
  setJukeboxGate(whenQuiet)
  setJukeboxPlaying(jukebox.snapshot().playing)
  const off = jukebox.subscribe(({ playing }) => setJukeboxPlaying(playing))
  return () => {
    off()
    setJukeboxGate(null)
    activity = null
    jukeboxPlaying = false
    reconcile()
  }
}
