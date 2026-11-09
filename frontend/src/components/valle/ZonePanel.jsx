import { useEffect, useRef } from 'react'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'
import { AboutBlock, ContactBlock, PostsBlock, ProjectsBlock, StackBlock } from './Content'

// El panel redefine los tokens de su interior para que el contenido compartido con el modo clásico
// (Content.jsx) se lea igual sobre el juego: lavanda con tarjetas marfil en el valle y azul en modo noche.
const panelStyle = {
  background: tone('lavender', PAL.ink),
  color: tone('ink', PAL.bone),
  ['--px-ink']: tone('ink', '#0f0e22'),
  ['--px-ring']: tone('lavender-deep', PAL.saffron),
  ['--text-primary']: tone('ink', PAL.bone),
  ['--text-secondary']: tone('ink', '#cfc5e0'),
  ['--bg-secondary']: tone('lavender-deep', '#2e2d5a'),
  ['--bg-surface']: tone('ivory', '#242350'),
  ['--bg-elevated']: tone('ivory', '#242350'),
  ['--border-color']: tone('ink', '#4b4380'),
  ['--accent-secondary']: tone('berry-deep', '#4cb3c9'),
  ['--accent-primary']: tone('berry-deep', PAL.saffron),
}

// Panel con el contenido de cada zona. Mismo contenido que el modo clásico.
export default function ZonePanel({ zone, onClose }) {
  const { copy } = useValleCopy()
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const body = {
    about: <AboutBlock />,
    projects: <ProjectsBlock limit={3} onNavigate={onClose} />,
    contact: <ContactBlock onNavigate={onClose} />,
    blog: <PostsBlock limit={3} onNavigate={onClose} />,
    stack: <StackBlock />,
  }[zone]

  return (
    <div className="absolute inset-0 z-30 grid place-items-center p-4" style={{ background: tone('scrim', 'rgba(15,14,34,0.7)') }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-title"
        className="px-frame flex max-h-[85dvh] w-full max-w-2xl flex-col"
        style={panelStyle}
      >
        <header className="flex items-start justify-between gap-4 p-5 pb-2">
          <h2 id="zone-title" className="px-title text-4xl sm:text-5xl" style={{ color: tone('ink', PAL.bone) }}>{copy.zones[zone]}</h2>
          <button ref={closeRef} type="button" className="px-btn px-btn--bone shrink-0" style={{ color: PAL.ink }} onClick={onClose}>
            {copy.hud.close}
          </button>
        </header>
        <div className="overflow-y-auto p-5 pt-3">{body}</div>
      </section>
    </div>
  )
}
