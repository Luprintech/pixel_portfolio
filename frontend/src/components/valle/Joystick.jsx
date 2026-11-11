import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'

const RADIUS = 38
// Los controles respetan el área segura (muescas, barra de inicio del iPhone) y dejan de ese lado un margen fijo. El aviso de
// interacción (`Valle.jsx`) sube por encima de ellos con `--valle-prompt-bottom-touch`: ver `pixel.css`.
const EDGE = '2rem'
const safe = (side) => `calc(${EDGE} + env(safe-area-inset-${side}, 0px))`

// Joystick táctil: escribe un vector -1..1 en el registro del juego y un botón A para entrar.
export default function Joystick({ game }) {
  const baseRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  const setVector = (x, y) => {
    setKnob({ x: x * RADIUS, y: y * RADIUS })
    game?.registry.set('joy', { x, y })
  }

  const handleMove = (event) => {
    const rect = baseRef.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy) || 1
    const clamped = Math.min(len, RADIUS)
    setVector((dx / len) * (clamped / RADIUS), (dy / len) * (clamped / RADIUS))
  }

  // La página desmonta el joystick al abrir un diálogo o un panel. Si el dedo seguía en él, el `pointerup` se pierde y el último
  // vector se quedaría en el registro: al cerrar el diálogo la viajera andaría sola hacia ese lado.
  useEffect(() => () => game?.registry.set('joy', { x: 0, y: 0 }), [game])

  const ink = tone('ink', PAL.ink)
  const ring = `0 0 0 3px ${ink}, 0 0 0 6px ${tone('lavender-deep', PAL.saffron)}, 0 0 0 9px ${ink}`

  return (
    <>
      <div
        ref={baseRef}
        role="application"
        aria-label="Joystick"
        className="absolute z-20 h-28 w-28 touch-none select-none rounded-full"
        style={{ left: safe('left'), bottom: safe('bottom'), background: tone('joy', 'rgba(28,27,58,0.8)'), boxShadow: ring }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          handleMove(e)
        }}
        onPointerMove={(e) => e.buttons && handleMove(e)}
        onPointerUp={() => setVector(0, 0)}
        onPointerCancel={() => setVector(0, 0)}
      >
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full"
          style={{ background: tone('berry', PAL.saffron), boxShadow: `0 0 0 3px ${ink}`, transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <button
        type="button"
        aria-label="A"
        data-sound="confirm"
        className="absolute z-20 h-16 w-16 touch-none select-none rounded-full px-title text-3xl"
        style={{ right: safe('right'), bottom: `calc(2.5rem + env(safe-area-inset-bottom, 0px))`, background: tone('berry', PAL.tile), color: tone('ivory', PAL.bone), boxShadow: ring, textShadow: 'none' }}
        onPointerDown={() => game?.events.emit('action')}
      >
        A
      </button>
    </>
  )
}
