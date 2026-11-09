import { useEffect, useRef } from 'react'
import { PAL } from '../../game/palette'
import { pickShadow } from './pickStyle'

// Selector de cualquier color: un cuadrado más al final de la fila que abre la paleta del navegador.
// Se confirma al cerrarla (evento `change`), no mientras se arrastra, porque cada cambio repinta
// todas las tarjetas. Un color que no es de la paleta lo muestra el propio cuadrado, marcado.
function CustomColor({ value, active, label, hint, onPick }) {
  const ref = useRef(null)

  useEffect(() => {
    const input = ref.current
    const commit = () => onPick(input.value)
    input.addEventListener('change', commit)
    return () => input.removeEventListener('change', commit)
  }, [onPick])

  return (
    <label
      className={`px-custom ${active ? '' : 'px-custom--empty'} relative block h-11 w-11 cursor-pointer`}
      title={hint}
      style={{ background: active ? value : PAL.bone, boxShadow: pickShadow(active) }}
    >
      <input
        // Sin controlar: al pulsar «Restablecer» cambia `value` y la clave lo vuelve a montar.
        key={value}
        ref={ref}
        type="color"
        defaultValue={value}
        aria-label={`${label}: ${hint}`}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  )
}

// Muestras de color del creador: una por tono de la paleta, con su nombre como etiqueta accesible, y
// opcionalmente el selector de cualquier otro color.
export default function Swatches({ colors, value, label, names, customHint, onPick }) {
  return (
    <div className="flex flex-wrap gap-4">
      {colors.map((color) => {
        const active = value === color
        return (
          <button
            key={color}
            type="button"
            aria-pressed={active}
            aria-label={`${label}: ${names[color]}`}
            title={names[color]}
            onClick={() => onPick(color)}
            className="px-pick h-11 w-11 cursor-pointer p-0"
            style={{ background: color, boxShadow: pickShadow(active) }}
          />
        )
      })}
      {customHint && <CustomColor value={value} active={!colors.includes(value)} label={label} hint={customHint} onPick={onPick} />}
    </div>
  )
}
