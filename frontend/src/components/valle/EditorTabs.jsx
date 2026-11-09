import { useRef } from 'react'

// Pestañas del creador (cuerpo, ropa y mascota). Con el teclado, las flechas pasan de una a otra y
// solo la elegida entra en el orden del tabulador, como en cualquier lista de pestañas.
export default function EditorTabs({ tabs, names, value, label, onChange }) {
  const refs = useRef({})

  const move = (event, index) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = tabs[(index + step + tabs.length) % tabs.length]
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="grid grid-cols-3 gap-3 sm:gap-4">
      {tabs.map((tab, index) => {
        const active = tab === value
        return (
          <button
            key={tab}
            ref={(element) => {
              refs.current[tab] = element
            }}
            id={`tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="editor-panel"
            tabIndex={active ? 0 : -1}
            className={`px-btn !min-h-[52px] ${active ? '' : 'px-btn--bone'}`}
            onClick={() => onChange(tab)}
            onKeyDown={(event) => move(event, index)}
          >
            {names[tab]}
          </button>
        )
      })}
    </div>
  )
}
