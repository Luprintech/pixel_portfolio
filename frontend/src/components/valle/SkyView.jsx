import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../game/palette'
import { VIEW_H, VIEW_W, paintSkyView, skyKind } from '../../game/skyView'
import { softenColor } from '../../game/titleSoften'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// El reloj de la vista empieza un poco adelantado: así la primera bandada de pájaros y la primera estrella fugaz
// llegan en unos segundos y no hay que esperar a la vuelta del ciclo.
const START_MS = 8500
const KIND_CHECK_MS = 500

const prefersStill = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Vista del cielo por el telescopio de la casa de Lupe. Pinta con el estado del cielo del valle (hora y tiempo), que
// se lee en cada fotograma de `getSky`. Con ella abierta el juego queda bloqueado (lo hace Valle.jsx con `zone`): se
// sale con Esc o con el botón.
export default function SkyView({ getSky, pastel, onClose }) {
  const { copy } = useValleCopy()
  const canvasRef = useRef(null)
  const closeRef = useRef(null)
  const [kind, setKind] = useState(() => skyKind(getSky()))

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const g = canvasRef.current?.getContext('2d')
    if (!g) return undefined
    const still = prefersStill()
    const start = performance.now()
    let lastCheck = 0
    let frame = 0
    const draw = (now) => {
      const raw = getSky()
      // El cielo pastel baja la saturación de sus franjas, igual que la portada.
      const sky = pastel ? { ...raw, bands: raw.bands.map((band) => softenColor(band)) } : raw
      paintSkyView(g, sky, START_MS + (now - start), still)
      if (now - lastCheck > KIND_CHECK_MS) {
        lastCheck = now
        setKind(skyKind(sky))
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [getSky, pastel])

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-4" style={{ background: tone('scrim', 'rgba(15,14,34,0.7)') }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sky-title"
        className="px-frame flex max-h-[92dvh] w-full max-w-2xl flex-col gap-3 p-5"
        style={{ background: tone('lavender', PAL.ink), color: tone('ink', PAL.bone) }}
      >
        <header className="flex items-start justify-between gap-4">
          <h2 id="sky-title" className="px-title text-3xl sm:text-4xl" style={{ color: tone('ink', PAL.bone) }}>{copy.sky.title}</h2>
          <button ref={closeRef} type="button" data-sound="back" className="px-btn px-btn--bone shrink-0" style={{ color: PAL.ink }} onClick={onClose}>
            {copy.sky.close}
          </button>
        </header>
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          role="img"
          aria-label={copy.sky.kinds[kind]}
          className="block w-full"
          style={{ imageRendering: 'pixelated', aspectRatio: `${VIEW_W} / ${VIEW_H}`, background: '#14132e' }}
        />
        <p className="px-text flex flex-wrap items-baseline justify-between gap-x-4 text-base" role="status">
          <span>{copy.sky.kinds[kind]}</span>
          <span className="text-sm opacity-80">{copy.sky.hint}</span>
        </p>
      </section>
    </div>
  )
}
