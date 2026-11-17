import { PAL } from '../../game/palette'

// Botón cuadrado con un icono dibujado píxel a píxel (11×11). Se genera una fila de rectángulos por tramo
// para que el borde salga nítido a cualquier tamaño. Solo tiene icono: su nombre va en `label`, para
// lectores de pantalla y como información emergente.
const pathOf = (rows) =>
  rows
    .flatMap((row, y) => [...row.matchAll(/X+/g)].map((run) => `M${run.index} ${y}h${run[0].length}v1h-${run[0].length}z`))
    .join('')

// Lo que no se nombra aquí (foco, ratón, estado expandido) pasa tal cual al botón.
export default function PixelIconButton({ rows, label, onClick, popup = false, disabled = false, className = '!min-h-11 !w-11', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-haspopup={popup ? 'dialog' : undefined}
      title={label}
      className={`px-btn px-btn--bone !p-0 ${className}`}
      style={{ color: PAL.ink }}
      {...rest}
    >
      <svg viewBox="0 0 11 11" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path d={pathOf(rows)} fill="currentColor" />
      </svg>
    </button>
  )
}
