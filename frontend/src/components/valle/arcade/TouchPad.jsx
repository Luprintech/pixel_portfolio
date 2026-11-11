import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../../game/palette'
import { heldDirections } from '../../../game/arcade/touchDirections'
import { tone } from '../../../lib/tone'

const RADIUS = 34
const DIRECTIONS = ['up', 'down', 'left', 'right']

// Joystick táctil y botón A de la recreativa: se leen como las teclas, igual que el joystick del valle (más sencillo que una
// cruceta de cuatro botones). El botón A actúa o dispara y, mantenido, repite el disparo.
export default function TouchPad({ labels, action, horizontal, onDirection, onAction }) {
  const baseRef = useRef(null)
  const held = useRef(new Set())
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  // Avisa solo de lo que cambia: pulsar y soltar cada dirección una vez, no en cada movimiento del dedo.
  const apply = (next) => {
    DIRECTIONS.forEach((dir) => {
      if (next.has(dir) !== held.current.has(dir)) onDirection(dir, next.has(dir))
    })
    held.current = next
  }

  const release = () => {
    setKnob({ x: 0, y: 0 })
    apply(new Set())
  }

  // Si la pantalla de juego se cierra con el dedo puesto, el `pointerup` no llega: se sueltan las direcciones al desmontar.
  const releaseRef = useRef(release)
  releaseRef.current = release
  useEffect(() => () => releaseRef.current(), [])

  const move = (event) => {
    const rect = baseRef.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy) || 1
    const clamped = Math.min(len, RADIUS)
    const x = (dx / len) * (clamped / RADIUS)
    const y = (dy / len) * (clamped / RADIUS)
    setKnob({ x: x * RADIUS, y: horizontal ? 0 : y * RADIUS })
    apply(heldDirections(x, y, horizontal))
  }

  const press = (on) => (event) => {
    event.preventDefault()
    onAction(on)
  }
  const ink = tone('ink', PAL.ink)
  const ring = `0 0 0 3px ${ink}, 0 0 0 6px ${tone('lavender-deep', PAL.saffron)}, 0 0 0 9px ${ink}`

  return (
    <div className="flex w-full max-w-md items-center justify-between px-5 pb-2" style={{ color: PAL.ink }}>
      <div
        ref={baseRef}
        role="application"
        aria-label={labels.joystick ?? 'Joystick'}
        className="relative h-24 w-24 shrink-0 touch-none select-none rounded-full"
        style={{ background: tone('joy', 'rgba(28,27,58,0.8)'), boxShadow: ring }}
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          move(event)
        }}
        onPointerMove={(event) => event.buttons && move(event)}
        onPointerUp={release}
        onPointerCancel={release}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div
          className="absolute left-1/2 top-1/2 h-10 w-10 rounded-full"
          style={{ background: tone('berry', PAL.saffron), boxShadow: `0 0 0 3px ${ink}`, transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <button
        type="button"
        aria-label={action}
        className="px-btn select-none touch-none !min-h-16 !w-16 !rounded-full !p-0 text-xl"
        onPointerDown={press(true)}
        onPointerUp={press(false)}
        onPointerLeave={press(false)}
        onPointerCancel={press(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        A
      </button>
    </div>
  )
}
