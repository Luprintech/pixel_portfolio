import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../game/palette'
import { linesAt, typedCount } from '../../lib/loadingConsole'
import { playKeyTick, playLineDone } from '../../lib/loadingSound'
import { prefersReducedMotion } from '../../lib/reducedMotion'
import { tone } from '../../lib/tone'

// Una tecla suena cada dos letras: una por letra sería un zumbido en un móvil.
const KEY_EVERY = 2

// Pantalla de carga del valle: frases de lo que se está preparando, una debajo de otra, con sonido de consola.
// Se pinta al instante sobre el color de la página, así no hay un hueco vacío mientras el mundo se prepara.
// Con "reducir movimiento" salen todas de golpe y sin sonido.
export default function LoadingConsole({ lines, title }) {
  const still = useRef(prefersReducedMotion()).current
  const [elapsed, setElapsed] = useState(still ? Infinity : 0)
  const lastCount = useRef(0)
  const lastLines = useRef(0)

  useEffect(() => {
    if (still) return undefined
    const start = performance.now()
    const timer = setInterval(() => setElapsed(performance.now() - start), 32)
    return () => clearInterval(timer)
  }, [still])

  const visible = linesAt(lines, elapsed)
  const count = typedCount(visible)

  // Los efectos de sonido se disparan al cambiar lo escrito, no en el reloj: si el móvil se retrasa, el sonido sigue a la pantalla.
  useEffect(() => {
    if (still) return
    if (Math.floor(count / KEY_EVERY) > Math.floor(lastCount.current / KEY_EVERY)) playKeyTick(count)
    lastCount.current = count
    const finished = visible.filter((text, i) => text.length === lines[i].length).length
    if (finished > lastLines.current) playLineDone()
    lastLines.current = finished
  })

  const last = visible.length - 1
  return (
    <div className="px-text absolute inset-0 grid place-items-center p-6" style={{ color: tone('ink', PAL.bone) }} role="status" aria-label={title}>
      <ul className="w-full max-w-sm space-y-2 text-lg" aria-hidden="true">
        {visible.map((text, i) => (
          <li key={lines[i]} className="min-h-[1.5em] whitespace-pre-wrap break-words">
            {text}
            {i === last && <span className="ml-1 inline-block h-[1em] w-[0.6em] translate-y-[0.15em] animate-pulse" style={{ background: tone('ink', PAL.bone) }} />}
          </li>
        ))}
      </ul>
    </div>
  )
}
