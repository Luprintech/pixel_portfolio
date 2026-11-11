import { useEffect, useMemo, useRef } from 'react'
import { CONSOLES, consoleCanvas } from '../../game/interior/consoles'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'
import { panelStyle } from './panelStyle'

// Ventana (no a pantalla completa) con las consolas de la estantería de Lupe, cada una con su nombre. Sustituye a la conversación
// que antes se abría al mirar la estantería. Esc o el botón la cierran.
export default function ConsolesViewer({ onClose }) {
  const { copy } = useValleCopy()
  const closeRef = useRef(null)
  const images = useMemo(() => Object.fromEntries(CONSOLES.map((item) => [item.id, consoleCanvas(item).toDataURL()])), [])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-4" style={{ background: tone('scrim', 'rgba(15,14,34,0.7)') }}>
      <section role="dialog" aria-modal="true" aria-labelledby="consoles-title" className="px-frame flex max-h-[85dvh] w-full max-w-xl flex-col" style={panelStyle}>
        <header className="flex items-start justify-between gap-4 p-5 pb-2">
          <h2 id="consoles-title" className="px-title text-3xl" style={{ color: tone('ink', PAL.bone) }}>{copy.consoles.title}</h2>
          <button ref={closeRef} type="button" data-sound="back" className="px-btn px-btn--bone shrink-0" style={{ color: PAL.ink }} onClick={onClose}>{copy.hud.close}</button>
        </header>
        <ul className="grid grid-cols-2 gap-4 overflow-y-auto p-5 pt-3 sm:grid-cols-3">
          {CONSOLES.map((item) => (
            <li key={item.id} className="flex flex-col items-center gap-2 text-center">
              <img src={images[item.id]} alt="" className="h-20 w-28 object-contain [image-rendering:pixelated]" style={{ background: tone('ivory', PAL.bone), boxShadow: `0 0 0 3px ${PAL.ink}` }} />
              <span className="px-text text-sm">{copy.consoles.items[item.id]}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
