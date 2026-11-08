import { useEffect, useRef } from 'react'
import { PAL } from '../../game/palette'
import { useValleCopy } from '../../lib/valleCopy'
import { AboutBlock, ContactBlock, PostsBlock, ProjectsBlock, StackBlock } from './Content'

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
    <div className="absolute inset-0 z-30 grid place-items-center p-4" style={{ background: 'rgba(15,14,34,0.7)' }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-title"
        className="px-frame flex max-h-[85dvh] w-full max-w-2xl flex-col"
        style={{ background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron, ['--text-primary']: PAL.bone, ['--text-secondary']: '#cfc5e0', ['--bg-secondary']: '#2e2d5a', ['--bg-surface']: '#242350', ['--bg-elevated']: '#242350', ['--border-color']: '#4b4380', ['--accent-secondary']: '#4cb3c9', ['--accent-primary']: PAL.saffron }}
      >
        <header className="flex items-start justify-between gap-4 p-5 pb-2">
          <h2 id="zone-title" className="px-title text-4xl sm:text-5xl" style={{ color: PAL.bone }}>{copy.zones[zone]}</h2>
          <button ref={closeRef} type="button" className="px-btn px-btn--bone shrink-0" style={{ color: PAL.ink }} onClick={onClose}>
            {copy.hud.close}
          </button>
        </header>
        <div className="overflow-y-auto p-5 pt-3">{body}</div>
      </section>
    </div>
  )
}
