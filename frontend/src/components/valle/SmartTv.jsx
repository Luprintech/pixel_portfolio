import { useEffect, useRef } from 'react'
import { TV_CHANNELS } from '../../game/interior/furniture/living'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// Marca de cada canal: fondo y rótulo con los colores de la marca, dibujados con texto y formas (sin imágenes). La tele de
// la sala dibuja los mismos en píxeles (`game/interior/furniture/living.js`).
const BRANDS = {
  weather: (
    <span className="flex items-center gap-2 text-white">
      <svg width="30" height="30" viewBox="0 0 10 10" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="1" y="1" width="4" height="4" fill="#f8d77a" />
        <rect x="3" y="4" width="6" height="3" fill="#fff" />
        <rect x="4" y="3" width="4" height="1" fill="#fff" />
      </svg>
      <span className="font-bold">TV</span>
    </span>
  ),
  netflix: <span className="text-3xl font-black tracking-tight" style={{ color: '#e5252a', fontFamily: 'Impact, "Arial Narrow", sans-serif' }}>NETFLIX</span>,
  plex: (
    <span className="flex items-center gap-1 text-3xl font-black" style={{ color: '#fff' }}>
      PLEX
      <svg width="16" height="26" viewBox="0 0 8 13" shapeRendering="crispEdges" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={i < 4 ? i : 6 - i} y={i * 2} width="3" height="2" fill="#e5a00d" transform="translate(0 0)" />
        ))}
      </svg>
    </span>
  ),
  max: (
    <span className="flex flex-col items-center leading-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <span className="text-2xl font-black tracking-widest" style={{ color: '#fff' }}>HBO</span>
      <span className="text-3xl font-black lowercase" style={{ color: '#b99cff' }}>max</span>
    </span>
  ),
  youtube: (
    <span className="flex items-center gap-2">
      <svg width="40" height="28" viewBox="0 0 20 14" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="0" y="1" width="20" height="12" rx="3" fill="#ff0000" />
        <polygon points="8,4 8,10 13,7" fill="#fff" />
      </svg>
      <span className="text-xl font-bold" style={{ color: '#282828', fontFamily: 'Arial, Helvetica, sans-serif' }}>YouTube</span>
    </span>
  ),
}

const TILE_BG = { weather: '#3e9bb0', netflix: '#0b0a14', plex: '#1f2326', max: 'linear-gradient(180deg, #0c0a1e, #1d1140)', youtube: '#ffffff' }

// Menú de la tele inteligente: el canal del tiempo y las aplicaciones. Elegir uno lo pone en la tele de la sala y cierra el
// menú; «Apagar» la apaga. Esc cierra sin cambiar nada.
export default function SmartTv({ channel, onSelect, onClose }) {
  const { copy } = useValleCopy()
  const tv = copy.smartTv
  const firstRef = useRef(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-4" style={{ background: tone('scrim', 'rgba(15,14,34,0.7)') }}>
      <section role="dialog" aria-modal="true" aria-labelledby="tv-title" className="w-full max-w-2xl rounded-xl p-5" style={{ background: '#101018', color: '#fff', boxShadow: `0 0 0 4px #3a3b42, 0 0 0 8px ${PAL.ink}` }}>
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 id="tv-title" className="px-text text-xl font-semibold">{tv.title}</h2>
          <button type="button" data-sound="back" className="rounded border border-[#55565e] px-3 py-1 text-sm" onClick={onClose}>{tv.close}</button>
        </header>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TV_CHANNELS.map((id, index) => (
            <li key={id}>
              <button
                ref={index === 0 ? firstRef : null}
                type="button"
                data-sound="select"
                aria-pressed={channel === id}
                aria-label={tv.channels[id]}
                className="grid h-24 w-full place-items-center rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#7fd0dc]"
                style={{ background: TILE_BG[id], boxShadow: channel === id ? '0 0 0 4px #f8d77a' : '0 0 0 2px #3a3b42' }}
                onClick={() => onSelect(id)}
              >
                {BRANDS[id]}
              </button>
            </li>
          ))}
          <li>
            <button type="button" data-sound="back" className="grid h-24 w-full place-items-center rounded-lg text-lg font-semibold" style={{ background: '#2a2b33', boxShadow: '0 0 0 2px #3a3b42' }} onClick={() => onSelect(null)}>
              ⏻ {tv.off}
            </button>
          </li>
        </ul>
        {channel && <p className="px-text mt-4 text-sm" style={{ color: '#9a9ba3' }}>{tv.now}: {tv.channels[channel]}</p>}
      </section>
    </div>
  )
}
