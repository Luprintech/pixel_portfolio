import { useLayoutEffect, useRef, useState } from 'react'
import { OBJECT_POSITION, sceneToScreen } from '../../game/titleView'

const MARGIN = 12
// Hueco entre el bocadillo y la cabeza de quien habla, donde va la cola.
const TAIL = 14
const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))

// Ajusta el ancho del bocadillo a su línea más larga. Con `w-max` y un ancho máximo, el navegador
// deja la caja en el máximo aunque `text-wrap: balance` acorte las líneas, y queda un hueco vacío a
// la derecha. Norma para todos los bocadillos: el texto aprovecha todo el ancho de la caja.
function fitToText(bubble) {
  const paragraph = bubble.firstElementChild
  if (!paragraph) return
  bubble.style.width = ''
  const range = document.createRange()
  range.selectNodeContents(paragraph)
  // La animación de entrada escala el párrafo; se deshace para medir el ancho real.
  const scale = paragraph.getBoundingClientRect().width / paragraph.offsetWidth || 1
  const textWidth = range.getBoundingClientRect().width / scale
  const style = getComputedStyle(paragraph)
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)
  // El píxel extra evita que un redondeo parta la última palabra a otra línea.
  const fitted = Math.ceil(textWidth + padding) + 1
  if (fitted < bubble.offsetWidth) bubble.style.width = `${fitted}px`
}

// Bocadillo de diálogo sobre un punto de la escena de la portada. Se coloca encima del punto,
// se queda dentro de la pantalla y la cola sigue apuntando a quien habla. Es decorativo: el texto
// de bienvenida para lectores de pantalla va aparte.
export default function LupeBubble({ text, anchor, canvasRef, avoidRef }) {
  const bubbleRef = useRef(null)
  const [place, setPlace] = useState(null)
  const { x, y } = anchor

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const bubble = bubbleRef.current
    if (!canvas || !bubble) return undefined
    const locate = () => {
      fitToText(bubble)
      const box = canvas.getBoundingClientRect()
      const point = sceneToScreen(box, { x, y }, OBJECT_POSITION)
      const parentWidth = canvas.offsetParent?.clientWidth ?? box.width
      const width = bubble.offsetWidth
      const top = canvas.offsetTop + point.y - bubble.offsetHeight - TAIL
      // Si el bocadillo cae a la altura del menú, se desplaza para no taparlo.
      let minLeft = MARGIN
      const menu = avoidRef?.current
      if (menu) {
        const overlaps = top < menu.offsetTop + menu.offsetHeight && top + bubble.offsetHeight > menu.offsetTop
        if (overlaps) minLeft = menu.offsetLeft + menu.offsetWidth + MARGIN
      }
      const left = clamp(canvas.offsetLeft + point.x - width / 2, minLeft, parentWidth - width - MARGIN)
      setPlace({ left, top: canvas.offsetTop + point.y, tail: canvas.offsetLeft + point.x - left })
    }
    locate()
    // La fuente pixel puede llegar después del primer pintado y cambia el ancho del texto.
    document.fonts?.ready.then(locate)
    window.addEventListener('resize', locate)
    return () => window.removeEventListener('resize', locate)
  }, [text, x, y, canvasRef, avoidRef])

  return (
    <div
      ref={bubbleRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-10 w-max max-w-[min(19rem,calc(100%-1.5rem))] lg:max-w-[min(28rem,calc(100%-1.5rem))]"
      style={{
        left: place?.left ?? 0,
        top: place?.top ?? 0,
        visibility: place ? 'visible' : 'hidden',
        transform: `translateY(calc(-100% - ${TAIL}px))`,
        ['--tail']: `${place?.tail ?? 0}px`,
      }}
    >
      {/* La clave reinicia la animación de entrada con cada frase nueva. */}
      <p key={text} className="px-bubble text-base sm:text-lg lg:text-2xl">{text}</p>
    </div>
  )
}
