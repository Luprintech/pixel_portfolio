import Swatches from './Swatches'

const MUTED = '#cfc5e0'
const BONE = '#f1e6cf'

// La fila de colores de un campo: su título, el nombre del color elegido a la derecha y debajo las
// muestras. Va siempre justo debajo de las opciones dibujadas a las que tiñe. `nested` la pone un
// peldaño por debajo de ellas (texto más pequeño); sin él es el título del bloque (piel, ojos...).
export default function ColorRow({ title, name, nested, colors, value, label, names, customHint, onPick }) {
  return (
    <div role="group" aria-label={label} className={`px-text min-w-0 ${nested ? 'mt-5' : ''}`}>
      <div className={`mb-3 flex items-baseline justify-between gap-3 ${nested ? 'text-sm' : 'text-base'}`}>
        <span style={{ color: MUTED }}>{title}</span>
        <span style={{ color: BONE }}>{name}</span>
      </div>
      <Swatches colors={colors} value={value} label={label} names={names} customHint={customHint} onPick={onPick} />
    </div>
  )
}
