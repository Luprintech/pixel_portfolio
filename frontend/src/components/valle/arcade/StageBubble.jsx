import { useLayoutEffect, useRef } from 'react'

const MARGIN = 8
// Hueco entre el bocadillo y la cabeza de quien habla, donde va la cola.
const TAIL = 14

// Bocadillo de un personaje dentro del escenario de un juego (el mago de la aventura). Se coloca junto a su personaje, en
// píxeles de la pantalla del juego (`x`, `y` ya con la escala aplicada), sin salirse de ella, y su cola apunta a quien habla. Es
// decorativo para el ratón; para los lectores de pantalla el texto se anuncia con `role="status"`.
export default function StageBubble({ x, y, width, height, text, more, fontSize }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const bubble = ref.current
    if (!bubble) return
    // El texto se reparte en líneas hasta el ancho máximo y la caja se queda tan ancha como ese máximo aunque la línea más larga
    // sea más corta (queda un hueco a la derecha): se mide el texto real y la caja se ajusta a él.
    const paragraph = bubble.firstElementChild
    bubble.style.width = ''
    const range = document.createRange()
    range.selectNodeContents(paragraph)
    const style = getComputedStyle(paragraph)
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
    bubble.style.width = `${Math.ceil(range.getBoundingClientRect().width + padding) + 1}px`
    const own = bubble.offsetWidth
    const left = Math.min(Math.max(x - own / 2, MARGIN), Math.max(MARGIN, width - own - MARGIN))
    // Si el personaje está arriba del todo (o la pantalla es baja), el bocadillo no cabe encima: se queda dentro del escenario,
    // algo solapado con quien habla, y se le quita la cola porque ya no señala a nadie con precisión.
    const wanted = y - bubble.offsetHeight - TAIL
    const top = Math.min(Math.max(wanted, MARGIN), Math.max(MARGIN, height - bubble.offsetHeight - MARGIN))
    paragraph.dataset.flat = top === wanted ? '' : 'true'
    bubble.style.transform = `translate(${left}px, ${top}px)`
    bubble.style.setProperty('--tail', `${Math.min(own - 12, Math.max(12, x - left))}px`)
    bubble.style.visibility = 'visible'
  }, [x, y, width, height, text, fontSize])

  return (
    <div ref={ref} role="status" className="pointer-events-none absolute left-0 top-0 z-10 w-max" style={{ visibility: 'hidden', maxWidth: `${Math.round(width * (width < 420 ? 0.84 : 0.62))}px` }}>
      <p key={text} className="px-bubble" style={{ fontSize }}>
        {text}
        {more && <span aria-hidden="true"> ▼</span>}
      </p>
    </div>
  )
}
