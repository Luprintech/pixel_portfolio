import { useCallback, useEffect, useRef, useState } from 'react'
import { FIGURES, figureCanvas } from '../../game/interior/figures'
import { PREPARE_MS, PRINT_MS, idleJob, jobAt, progressOf } from '../../game/interior/printJob'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

const LAYERS = 120
const BAMBU = '#00ae42'
const FIGURE = FIGURES.find((figure) => figure.id === 'pokemon')

// Pantalla táctil de la impresora Bambu Lab A1 mini: oscura, con acentos verdes, el archivo, las temperaturas y el avance de
// la impresión. Solo lanza el trabajo: al pulsar Imprimir enseña «Preparando impresión…» un momento, avisa a la sala (`onStart`)
// y se cierra; la impresión se ve después en la propia máquina y se recoge allí (ver `game/interior/printJob.js`). Si se abre
// con una impresión en marcha, enseña su avance sin poder pararla. `job` es el trabajo de la sala al abrir. Esc cierra.
export default function PrinterPanel({ job, claimed, onStart, onClose }) {
  const { copy } = useValleCopy()
  const p = copy.printer
  const [now, setNow] = useState(() => performance.now())
  const [preparing, setPreparing] = useState(false)
  const closeRef = useRef(null)
  const figure = useRef(figureCanvas(FIGURE).toDataURL()).current
  const current = jobAt(job ?? idleJob(), now)
  const phase = preparing ? 'preparing' : current.state === 'printing' ? 'printing' : current.state === 'done' ? 'done' : 'ready'
  const progress = progressOf(current, now)

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Preparando: un instante de «calentando» y se lanza la impresión (cerrar antes, con Esc, la cancela).
  useEffect(() => {
    if (!preparing) return undefined
    const timer = setTimeout(onStart, PREPARE_MS)
    return () => clearTimeout(timer)
  }, [preparing, onStart])

  // Con una impresión en marcha el avance se refresca solo.
  useEffect(() => {
    if (phase !== 'printing') return undefined
    const timer = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(timer)
  }, [phase])

  const STATUS = { ready: claimed ? p.claimed : p.ready, preparing: p.heating, printing: p.printing, done: p.waiting }
  const percent = Math.round(progress * 100)
  const left = Math.max(0, Math.ceil((PRINT_MS * (1 - progress)) / 1000))
  const hot = phase === 'printing' || phase === 'preparing'
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
              <p className="text-xs" style={{ color: '#9a9ba3' }}>{STATUS[phase]}</p>
              <p className="mt-2 flex gap-4 text-xs" style={{ color: '#9a9ba3' }}>
                <span>{p.nozzle} {hot ? 220 : 25}°C</span>
                <span>{p.bed} {hot ? 60 : 25}°C</span>
              </p>
            </div>
          </div>

          {phase === 'preparing' && (
            <p className="flex items-center gap-3 text-sm font-semibold" role="status">
              <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full motion-safe:animate-pulse" style={{ background: BAMBU }} />
              {p.preparing}
            </p>
          )}

          {(phase === 'printing' || phase === 'done') && (
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
            <button type="button" className="w-full rounded-lg py-3 text-base font-bold text-white" style={{ background: BAMBU }} onClick={() => setPreparing(true)}>{p.print}</button>
          )}
          {phase === 'done' && <p className="text-xs" style={{ color: '#9a9ba3' }}>{p.pickUp}</p>}
        </div>
      </section>
    </div>
  )
}
