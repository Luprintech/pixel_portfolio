import { useBackgroundMusic } from '../../hooks/useBackgroundMusic'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// Altavoz dibujado píxel a píxel (10×10): cuerpo y cono siempre, y ondas o aspa según el estado.
const SPEAKER = ['M1 4h2v2H1z', 'M3 3h1v4H3z', 'M4 2h1v6H4z', 'M5 1h1v8H5z']
const WAVES = ['M7 4h1v2H7z', 'M8 3h1v1H8z', 'M8 6h1v1H8z', 'M9 2h1v1H9z', 'M9 7h1v1H9z']
const CROSS = ['M7 3h1v1H7z', 'M9 3h1v1H9z', 'M8 4h1v2H8z', 'M7 6h1v1H7z', 'M9 6h1v1H9z']

function SpeakerIcon({ on }) {
  return (
    <svg viewBox="0 0 10 10" width="24" height="24" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {[...SPEAKER, ...(on ? WAVES : CROSS)].map((d) => (
        <path key={d} d={d} style={{ fill: on ? tone('ink', PAL.ink) : tone('muted', PAL.tile) }} />
      ))}
    </svg>
  )
}

// Botón que silencia todo el sonido y barra de volumen general (esta, solo con ratón: ver .px-volume-bar). Se oculta solo si la pista no está disponible.
// Con `compact` queda solo el botón, sin barra ni fondo: cabe en la cabecera de una escena. `track`
// es la pista que pide la pantalla ('welcome' en la portada y el creador, 'valley' en el valle).
export default function MusicControl({ compact = false, track = 'welcome' }) {
  const { copy } = useValleCopy()
  const { available, muted, volume, toggle, setVolume } = useBackgroundMusic(track)
  if (!available) return null
  const label = muted ? copy.audio.play : copy.audio.mute

  return (
    <div className={compact ? 'flex' : 'flex items-center gap-3 px-1 py-1'} style={compact ? undefined : { background: tone('lavender', PAL.ink) }}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!muted}
        aria-label={label}
        title={label}
        className="px-btn px-btn--bone !min-h-[var(--ctl,2.5rem)] !w-[var(--ctl,2.5rem)] !p-0"
        style={{ color: PAL.ink }}
      >
        <SpeakerIcon on={!muted && volume > 0} />
      </button>
      {!compact && (
        <label className="px-volume-bar flex items-center">
          <span className="sr-only">{copy.audio.volume}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            aria-valuetext={`${Math.round(volume * 100)} %`}
            className="px-range w-24"
          />
        </label>
      )}
    </div>
  )
}
