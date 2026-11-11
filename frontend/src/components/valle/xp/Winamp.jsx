import { useJukebox } from '../../../hooks/useJukebox'
import { TRACKS } from '../../../lib/jukebox'
import { useValleCopy } from '../../../lib/valleCopy'

// Rayo naranja del logotipo, de 7×9 píxeles.
const BOLT = ['...##..', '..##...', '.##....', '#######', '...##..', '..##...', '.##....', '.#.....', '#......']

const CONTROLS = [
  ['previous', '⏮'],
  ['toggle', '⏯'],
  ['next', '⏭'],
]

// Winamp: reproductor oscuro con el rayo naranja, una pantalla con la pista, los botones de siempre y su lista. Suena la
// música de la casa (`lib/jukebox.js`), la misma de la minicadena; la lista de canciones favoritas de Lupe se añadirá allí.
export default function Winamp() {
  const { copy } = useValleCopy()
  const w = copy.desktop.winampUi
  const { playing, index, controls } = useJukebox()
  return (
    <div className="h-full space-y-2 overflow-auto p-2 text-xs" style={{ background: '#2b2b3a', color: '#00e000', fontFamily: '"Lucida Console", "Courier New", monospace' }}>
      <div className="flex items-center gap-3 rounded border p-2" style={{ borderColor: '#5a5a70', background: '#000' }}>
        <svg width="28" height="36" viewBox="0 0 7 9" shapeRendering="crispEdges" aria-hidden="true">
          {BOLT.flatMap((row, y) => [...row].map((cell, x) => (cell === '#' ? <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill="#ff9d00" /> : null)))}
        </svg>
        <div className="min-w-0 flex-1">
          <p className="truncate" aria-live="polite">{playing ? '▶ ' : '■ '}{TRACKS[index].title}</p>
          <p style={{ color: '#7fd07f' }}>{playing ? w.playing : w.stopped}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2" role="group" aria-label={w.controls}>
        {CONTROLS.map(([action, symbol]) => (
          <button key={action} type="button" aria-label={w[action]} className="h-8 w-12 rounded border text-base" style={{ borderColor: '#7a7a90', background: '#3e3e52', color: '#d8d8e8' }} onClick={() => controls[action]()}>
            {symbol}
          </button>
        ))}
      </div>
      <ol className="rounded border" style={{ borderColor: '#5a5a70', background: '#000' }} aria-label={w.playlist}>
        {TRACKS.map((track, i) => (
          <li key={track.id}>
            <button type="button" className="flex w-full justify-between gap-2 px-2 py-1 text-left" style={{ color: i === index ? '#fff' : '#00e000', background: i === index ? '#1c3a8a' : 'transparent' }} onClick={() => controls.play(i)}>
              <span className="truncate">{i + 1}. {track.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
