import { useRef, useState } from 'react'
import { PAL } from '../../game/palette'

const RADIUS = 38

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

  const ring = `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}, 0 0 0 9px ${PAL.ink}`

  return (
    <>
      <div
        ref={baseRef}
        role="application"
        aria-label="Joystick"
        className="absolute bottom-8 left-8 z-20 h-28 w-28 touch-none select-none rounded-full"
        style={{ background: 'rgba(28,27,58,0.8)', boxShadow: ring }}
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
          style={{ background: PAL.saffron, boxShadow: `0 0 0 3px ${PAL.ink}`, transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
      <button
        type="button"
        aria-label="A"
        className="absolute bottom-10 right-8 z-20 h-16 w-16 touch-none select-none rounded-full px-title text-3xl"
        style={{ background: PAL.tile, color: PAL.bone, boxShadow: ring, textShadow: 'none' }}
        onPointerDown={() => game?.events.emit('action')}
      >
        A
      </button>
    </>
  )
}
