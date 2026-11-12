import { useCallback, useEffect, useRef, useState } from 'react'
import { PAL } from '../../../game/palette'
import { bandDirections, heldDirections } from '../../../game/arcade/touchDirections'
import { tone } from '../../../lib/tone'

const RADIUS = 38
const DIRECTIONS = ['up', 'down', 'left', 'right']

const ink = () => tone('ink', PAL.ink)
const ring = () => `0 0 0 3px ${ink()}, 0 0 0 6px ${tone('lavender-deep', PAL.saffron)}, 0 0 0 9px ${ink()}`
// La zona activa se ve (un panel hundido) para que se entienda que no hace falta acertar con el palo: vale cualquier punto.
const zoneStyle = { background: 'rgba(15,14,34,0.55)', boxShadow: `inset 0 0 0 2px ${PAL.stone}` }

// Mantiene las direcciones pulsadas y avisa solo de lo que cambia: pulsar y soltar cada una una vez, no en cada movimiento del dedo.
// Si el juego se cierra con el dedo puesto el `pointerup` no llega, así que al desmontar se sueltan todas.
function useDirections(onDirection) {
  const held = useRef(new Set())
  const apply = useCallback((next) => {
    DIRECTIONS.forEach((dir) => {
      if (next.has(dir) !== held.current.has(dir)) onDirection(dir, next.has(dir))
    })
    held.current = next
  }, [onDirection])
  const release = useCallback(() => apply(new Set()), [apply])
  useEffect(() => release, [release])
  return { apply, release }
}

// Gestos de una zona táctil: el dedo se captura en la zona (sigue mandando aunque salga de ella) y se atiende por separado cada
// puntero, así el pulgar izquierdo y el derecho no se estorban. `touch-none` en la zona impide que el navegador lo tome por un
// gesto (desplazar, recargar, minimizar).
function zoneEvents({ update, release }) {
  return {
    onPointerDown: (event) => {
      event.preventDefault()
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Un puntero que ya terminó no se puede capturar; el gesto sigue sin captura.
      }
      update(event)
    },
    onPointerMove: (event) => {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) update(event)
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
    onContextMenu: (event) => event.preventDefault(),
  }
}

// Joystick de cuatro direcciones. Toda la zona responde, no solo el palo: la dirección sale de dónde está el dedo respecto al
// centro del palo, y más allá de su recorrido cuenta como empujado del todo. Se ve el palo fijo y la bola que sigue al dedo.
function Stick({ label, onDirection }) {
  const baseRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const { apply, release } = useDirections(onDirection)

  const update = (event) => {
    const rect = baseRef.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const len = Math.hypot(dx, dy) || 1
    const pull = Math.min(len, RADIUS)
    const x = (dx / len) * (pull / RADIUS)
    const y = (dy / len) * (pull / RADIUS)
    setKnob({ x: x * RADIUS, y: y * RADIUS })
    apply(heldDirections(x, y, false))
  }
  const off = () => {
    setKnob({ x: 0, y: 0 })
    release()
  }

  return (
    <div role="application" aria-label={label} className="grid h-full w-full touch-none select-none place-items-center" style={zoneStyle} {...zoneEvents({ update, release: off })}>
      <div ref={baseRef} className="pointer-events-none relative h-28 w-28 rounded-full" style={{ background: tone('joy', 'rgba(28,27,58,0.8)'), boxShadow: ring() }}>
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full"
          style={{ background: tone('berry', PAL.saffron), boxShadow: `0 0 0 3px ${ink()}`, transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>
    </div>
  )
}

// Banda de izquierda y derecha para los juegos que solo se mueven de lado: dos flechas grandes que ocupan toda la zona. La mitad
// izquierda mueve a la izquierda y la derecha, a la derecha; se puede arrastrar de una a otra sin levantar el dedo.
function Band({ label, onDirection }) {
  const zoneRef = useRef(null)
  const [side, setSide] = useState(null)
  const { apply, release } = useDirections(onDirection)

  const update = (event) => {
    const rect = zoneRef.current.getBoundingClientRect()
    const dirs = bandDirections((event.clientX - rect.left) / rect.width)
    setSide([...dirs][0])
    apply(dirs)
  }
  const off = () => {
    setSide(null)
    release()
  }

  const arrow = (dir, glyph) => (
    <span
      className="grid flex-1 place-items-center text-5xl leading-none"
      style={{ background: side === dir ? tone('berry', PAL.saffron) : PAL.ink2, color: side === dir ? ink() : PAL.bone, boxShadow: `inset 0 0 0 3px ${side === dir ? ink() : PAL.stone}` }}
    >
      <span aria-hidden="true">{glyph}</span>
    </span>
  )

  return (
    <div ref={zoneRef} role="group" aria-label={label} className="pointer-events-auto flex h-full w-full touch-none select-none gap-2 p-2" style={zoneStyle} {...zoneEvents({ update, release: off })}>
      {arrow('left', '◀')}
      {arrow('right', '▶')}
    </div>
  )
}

// Zona de movimiento de la recreativa: joystick de cuatro direcciones o banda de izquierda y derecha, según el juego.
export function MoveZone({ labels, horizontal, onDirection }) {
  return horizontal ? <Band label={labels.band} onDirection={onDirection} /> : <Stick label={labels.joystick} onDirection={onDirection} />
}

// Botón táctil de la recreativa (A o B). Toda la zona es el botón (no hace falta acertar con el círculo) y, mantenido, avisa de
// que sigue pulsado: la A lo usa para repetir el disparo y la B para mantener el escudo. Va separado de la zona de movimiento
// para que ambos pulgares trabajen sin pisarse.
export function ActionZone({ label, glyph = 'A', small = false, onAction }) {
  const [down, setDown] = useState(false)
  const set = useCallback((on) => {
    setDown(on)
    onAction(on)
  }, [onAction])

  // Se suelta al desmontar (por ejemplo al abrir las opciones con el dedo puesto).
  const setRef = useRef(set)
  setRef.current = set
  useEffect(() => () => setRef.current(false), [])

  const tint = glyph === 'B' ? ['lagoon', PAL.lagoon, PAL.lagoonLight] : ['berry', PAL.tile, PAL.tileDark]
  const events = zoneEvents({ update: () => set(true), release: () => set(false) })
  return (
    <button type="button" aria-label={label} aria-pressed={down} tabIndex={-1} className="grid h-full w-full touch-none select-none place-items-center" style={zoneStyle} {...events}>
      <span
        className={`pointer-events-none grid place-items-center rounded-full font-semibold ${small ? 'h-16 w-16 text-3xl' : 'h-24 w-24 text-4xl'}`}
        style={{ background: down ? tint[2] : tone(tint[0], tint[1]), color: tone('ivory', PAL.bone), boxShadow: down ? `0 0 0 3px ${ink()}` : ring(), transform: down ? 'scale(0.92)' : 'none' }}
      >
        {glyph}
      </span>
    </button>
  )
}

// Botones de la recreativa: A (acción, espada o disparo) y, en los juegos con escudo, B debajo. B se mantiene pulsado para
// levantar el escudo; A y B no se anulan entre sí porque cada zona captura su propio dedo.
export function ActionPad({ labels, guard, onAction, onGuard }) {
  if (!guard) return <ActionZone label={labels.actionLabel} onAction={onAction} />
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="min-h-0 flex-[3]"><ActionZone label={labels.swordLabel} small onAction={onAction} /></div>
      <div className="min-h-0 flex-[2]"><ActionZone label={labels.guardLabel} glyph="B" small onAction={onGuard} /></div>
    </div>
  )
}
