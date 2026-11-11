import { useEffect, useMemo, useRef } from 'react'
import { FIGURES, figureCanvas } from '../../game/interior/figures'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'
import { panelStyle } from './panelStyle'

// Visor de las figuras impresas en 3D de la vitrina, ampliadas para verlas de cerca. Si Lupe ha entregado la del pokémon
// (logro), también sale. Más adelante se podrán añadir fotos de las figuras reales junto a estos dibujos.
export default function FiguresViewer({ unlocked, onClose }) {
  const { copy } = useValleCopy()
  const closeRef = useRef(null)
  const shown = useMemo(() => FIGURES.filter((figure) => !figure.unlock || unlocked.has(figure.unlock)), [unlocked])
  const images = useMemo(() => Object.fromEntries(FIGURES.map((figure) => [figure.id, figureCanvas(figure).toDataURL()])), [])

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
      <section role="dialog" aria-modal="true" aria-labelledby="figures-title" className="px-frame flex max-h-[85dvh] w-full max-w-2xl flex-col" style={panelStyle}>
        <header className="flex items-start justify-between gap-4 p-5 pb-2">
          <h2 id="figures-title" className="px-title text-4xl" style={{ color: tone('ink', PAL.bone) }}>{copy.figures.title}</h2>
          <button ref={closeRef} type="button" data-sound="back" className="px-btn px-btn--bone shrink-0" style={{ color: PAL.ink }} onClick={onClose}>{copy.hud.close}</button>
        </header>
        <ul className="grid grid-cols-2 gap-4 overflow-y-auto p-5 pt-3 sm:grid-cols-3">
          {shown.map((figure) => {
            const card = (
              <>
                <img src={images[figure.id]} alt="" className="h-28 w-28 object-contain [image-rendering:pixelated]" style={figure.bare ? undefined : { background: figure.dark ? PAL.ink : tone('ivory', PAL.bone), boxShadow: `0 0 0 3px ${PAL.ink}` }} />
                <span className="px-text text-sm">{copy.figures.items[figure.id]}</span>
              </>
            )
            const layout = 'flex flex-col items-center gap-2 text-center'
            // Una figura con enlace (el Funko) es toda ella un enlace externo: se abre en otra pestaña sin salir del juego.
            return (
              <li key={figure.id}>
                {figure.href ? <a href={figure.href} target="_blank" rel="noopener noreferrer" className={`${layout} rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4`}>{card}</a> : <div className={layout}>{card}</div>}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
