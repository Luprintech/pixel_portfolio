import { useLayoutEffect, useRef } from 'react'

const MARGIN = 8
// Hueco entre el bocadillo y la cabeza de quien habla, donde va la cola.
const TAIL = 14

// Bocadillo de un personaje dentro del escenario de un juego (el mago de la aventura). Se coloca junto a su personaje, en
// píxeles de la pantalla del juego (`x`, `y` ya con la escala aplicada), sin salirse de ella, y su cola apunta a quien habla. Es
// decorativo para el ratón; para los lectores de pantalla el texto se anuncia con `role="status"`.
export default function StageBubble({ x, y, width, text, more, fontSize }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const bubble = ref.current
    if (!bubble) return
    const own = bubble.offsetWidth
    const left = Math.min(Math.max(x - own / 2, MARGIN), Math.max(MARGIN, width - own - MARGIN))
    bubble.style.transform = `translate(${left}px, ${y - bubble.offsetHeight - TAIL}px)`
    bubble.style.setProperty('--tail', `${Math.min(own - 12, Math.max(12, x - left))}px`)
    bubble.style.visibility = 'visible'
  }, [x, y, width, text, fontSize])

  return (
    <div ref={ref} role="status" className="pointer-events-none absolute left-0 top-0 z-10 w-max" style={{ visibility: 'hidden', maxWidth: `${Math.round(width * 0.62)}px` }}>
      <p key={text} className="px-bubble" style={{ fontSize }}>
        {text}
        {more && <span aria-hidden="true"> ▼</span>}
      </p>
    </div>
  )
}
