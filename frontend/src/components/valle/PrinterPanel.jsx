import { useCallback, useEffect, useRef, useState } from 'react'
import { FIGURES, figureCanvas } from '../../game/interior/figures'
import { PAL } from '../../game/palette'
import { playPrintDone, startPrinterSound } from '../../lib/printerSound'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// Lo que dura la impresión de la figura (la real tardaría horas; esto es un juego).
const PRINT_MS = 9000
const LAYERS = 120
const BAMBU = '#00ae42'
const FIGURE = FIGURES.find((figure) => figure.id === 'pokemon')

// Pantalla táctil de la impresora Bambu Lab A1 mini: oscura, con acentos verdes, el archivo, las temperaturas y el avance de
// la impresión. `initial` es 'done' si ya había una figura sin recoger; `onMode` avisa a la sala (la impresora de verdad
// cambia de animación) y `onClaim` entrega la figura. Esc cierra: si se está imprimiendo, se cancela.
export default function PrinterPanel({ initial, claimed, onMode, onProgress, onClaim, onClose }) {
  const { copy } = useValleCopy()
  const p = copy.printer
  const [phase, setPhase] = useState(initial === 'done' ? 'done' : 'ready')
  const [progress, setProgress] = useState(0)
  const closeRef = useRef(null)
  const figure = useRef(figureCanvas(FIGURE).toDataURL()).current

  const close = useCallback(() => {
    if (phase === 'printing') onMode('idle')
    onClose()
  }, [phase, onMode, onClose])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Imprimiendo: avanza el progreso, suena la impresora y, al llegar al final, el pitido de terminado.
  useEffect(() => {
    if (phase !== 'printing') return undefined
    const stopSound = startPrinterSound()
    const start = performance.now()
    const timer = setInterval(() => {
      const fraction = Math.min(1, (performance.now() - start) / PRINT_MS)
      setProgress(fraction)
      onProgress(fraction)
      if (fraction >= 1) {
        clearInterval(timer)
        stopSound()
        playPrintDone()
        onMode('done')
        setPhase('done')
      }
    }, 120)
    return () => {
      clearInterval(timer)
      stopSound()
    }
  }, [phase, onMode, onProgress])

  const start = () => {
    setProgress(0)
    onMode('printing')
    setPhase('printing')
  }
  const claim = () => {
    onMode('idle')
    onClaim()
    onClose()
  }

  const percent = Math.round(progress * 100)
  const left = Math.max(0, Math.ceil((PRINT_MS * (1 - progress)) / 1000))
  const hot = phase === 'printing'
  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-3" style={{ background: tone('scrim', 'rgba(15,14,34,0.7)') }}>
      <section role="dialog" aria-modal="true" aria-label={p.title} className="w-full max-w-md overflow-hidden rounded-xl text-sm" style={{ background: '#1b1c20', color: '#e8e8ea', boxShadow: `0 0 0 3px #3a3b42, 0 0 0 6px ${PAL.ink}` }}>
        <header className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: '#26272c' }}>
          <span className="flex items-center gap-2 font-semibold">
            <span className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ background: BAMBU, color: '#fff' }}>BAMBU LAB</span>
            {p.title}
          </span>
          <button ref={closeRef} type="button" data-sound="back" className="rounded border border-[#55565e] px-3 py-1 text-xs" onClick={close}>{p.close}</button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-4 rounded-lg p-3" style={{ background: '#26272c' }}>
            <img src={figure} alt="" className="h-20 w-20 shrink-0 rounded [image-rendering:pixelated]" style={{ background: '#33343b', opacity: phase === 'printing' ? 0.55 : 1 }} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{p.file}</p>
              <p className="text-xs" style={{ color: '#9a9ba3' }}>{phase === 'ready' ? (claimed ? p.claimed : p.ready) : phase === 'printing' ? p.printing : p.done}</p>
              <p className="mt-2 flex gap-4 text-xs" style={{ color: '#9a9ba3' }}>
                <span>{p.nozzle} {hot ? 220 : 25}°C</span>
                <span>{p.bed} {hot ? 60 : 25}°C</span>
              </p>
            </div>
          </div>

          {phase !== 'ready' && (
            <div>
              <div className="h-3 overflow-hidden rounded-full" style={{ background: '#33343b' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={phase === 'done' ? 100 : percent} aria-label={p.progress}>
                <div className="h-full" style={{ width: `${phase === 'done' ? 100 : percent}%`, background: BAMBU }} />
              </div>
              <p className="mt-2 flex justify-between text-xs" style={{ color: '#9a9ba3' }}>
                <span>{phase === 'done' ? '100 %' : `${percent} %`}</span>
                <span>{p.layer} {phase === 'done' ? LAYERS : Math.round(progress * LAYERS)} / {LAYERS}</span>
                <span>{phase === 'done' ? p.finished : `${left} s`}</span>
              </p>
            </div>
          )}

          {phase === 'ready' && !claimed && (
            <button type="button" className="w-full rounded-lg py-3 text-base font-bold text-white" style={{ background: BAMBU }} onClick={start}>{p.print}</button>
          )}
          {phase === 'done' && (
            <button type="button" className="w-full rounded-lg py-3 text-base font-bold text-white" style={{ background: BAMBU }} onClick={claim}>{p.take}</button>
          )}
        </div>
      </section>
    </div>
  )
}
