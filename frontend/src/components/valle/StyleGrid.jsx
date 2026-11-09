import { useEffect, useRef } from 'react'
import { styleChoices } from '../../game/look'
import { PAL } from '../../game/palette'
import { avatarCanvas } from '../../game/avatar/index.js'
import { CROSS, TILE_BACKGROUND, pickShadow } from './pickStyle'

// Recortes del sprite (18×34) para enseñar cada opción dibujada: qué parte del cuerpo se enseña. La
// ampliación la decide la celda (ver `.px-sprite` en pixel.css), así que las tarjetas son iguales
// aunque lo que enseñen sea la cabeza, el pelo entero o los pies.
const VIEWS = {
  head: { sx: 0, sy: 0, sw: 18, sh: 19 },
  hair: { sx: 0, sy: 0, sw: 18, sh: 29 },
  torso: { sx: 1, sy: 17, sw: 16, sh: 14 },
  legs: { sx: 1, sy: 24, sw: 16, sh: 10 },
  feet: { sx: 2, sy: 26, sw: 14, sh: 8 },
}
// Las opciones "sin nada" se marcan con una cruz de píxeles en la esquina de la tarjeta.
const NONE_VALUES = ['ninguno']

// Cada opción se dibuja con el aspecto actual y solo cambia lo que representa, así se ve
// exactamente cómo quedaría, y lleva su nombre debajo.
function PixelTile({ look, field, value, view, active, label, name, onPick }) {
  const ref = useRef(null)
  const { sx, sy, sw, sh } = VIEWS[view]
  useEffect(() => {
    const g = ref.current.getContext('2d')
    g.clearRect(0, 0, sw, sh)
    g.drawImage(avatarCanvas({ ...look, [field]: value }, 'down', 0), sx, sy, sw, sh, 0, 0, sw, sh)
    if (NONE_VALUES.includes(value)) {
      g.fillStyle = PAL.tile
      CROSS.forEach(([x, y]) => g.fillRect(sw - 6 + x, 1 + y, 1, 1))
    }
  }, [look, field, value, sx, sy, sw, sh])
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onPick}
      className="px-pick flex w-full cursor-pointer flex-col p-0"
      style={{ background: PAL.ink, boxShadow: pickShadow(active) }}
    >
      <span className="px-tile flex aspect-square w-full items-center justify-center" style={{ background: TILE_BACKGROUND }}>
        <canvas ref={ref} width={sw} height={sh} className="px-canvas px-sprite block" style={{ '--sw': sw, '--sh': sh }} aria-hidden="true" />
      </span>
      <span className="px-caption" style={{ color: active ? PAL.saffronLight : PAL.bone }}>{name}</span>
    </button>
  )
}

export default function StyleGrid({ field, view, look, label, names, onPick }) {
  return (
    <div className="px-grid">
      {styleChoices(field, look).map((value) => (
        <PixelTile
          key={value}
          look={look}
          field={field}
          value={value}
          view={view}
          active={look[field] === value}
          label={`${label}: ${names[value]}`}
          name={names[value]}
          onPick={() => onPick(value)}
        />
      ))}
    </div>
  )
}
