import { useEffect, useLayoutEffect, useRef } from 'react'
import { fitToText, readingTime } from './fitBubble'

const MARGIN = 12
// Hueco entre el bocadillo y la cabeza de quien habla, donde va la cola.
const TAIL = 14
// Bocadillo junto a un personaje del mundo (la reacción de Atreus a la sardina). No abre ningún diálogo ni quita el control:
// sigue al personaje, que la escena sitúa en la pantalla (`bubble-anchor`), se mantiene dentro de la pantalla y desaparece solo
// pasado el tiempo de lectura. El ancho se ajusta al texto (`fitBubble.js`). Es decorativo para el ratón; para lectores de
// pantalla el texto se anuncia con `role="status"`.
export default function WorldBubble({ game, text, onDone }) {
  const bubbleRef = useRef(null)
  const lastAnchor = useRef(null)

  const place = (anchor) => {
    const bubble = bubbleRef.current
    if (!bubble || !anchor) return
    lastAnchor.current = anchor
    const parentWidth = bubble.offsetParent?.clientWidth ?? window.innerWidth
    const width = bubble.offsetWidth
    const left = Math.min(Math.max(anchor.x - width / 2, MARGIN), Math.max(MARGIN, parentWidth - width - MARGIN))
    bubble.style.transform = `translate(${left}px, ${anchor.y - bubble.offsetHeight - TAIL}px)`
    bubble.style.setProperty('--tail', `${anchor.x - left}px`)
    bubble.style.visibility = 'visible'
  }

  // El texto manda el ancho: se ajusta al llegar, y otra vez cuando la fuente pixel termina de cargar.
  useLayoutEffect(() => {
    const bubble = bubbleRef.current
    if (!bubble) return undefined
    const refit = () => {
      fitToText(bubble)
      place(lastAnchor.current)
    }
    refit()
    document.fonts?.ready.then(refit)
    return undefined
  }, [text])

  useEffect(() => {
    game.events.on('bubble-anchor', place)
    return () => game.events.off('bubble-anchor', place)
  }, [game])

  useEffect(() => {
    const timer = setTimeout(onDone, readingTime(text))
    return () => clearTimeout(timer)
  }, [text, onDone])

  return (
    <div
      ref={bubbleRef}
      role="status"
      className="pointer-events-none absolute left-0 top-0 z-20 w-max max-w-[min(15rem,calc(100%-1.5rem))] lg:max-w-[min(20rem,calc(100%-1.5rem))]"
      style={{ visibility: 'hidden' }}
    >
      <p key={text} className="px-bubble text-sm sm:text-base lg:text-xl">{text}</p>
    </div>
  )
}
