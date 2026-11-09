import { PAL } from '../../../game/palette'

// Flecha circular dibujada píxel a píxel (12×12): un aro con hueco arriba a la derecha y una punta
// de flecha grande al final del arco de arriba, que apunta en el sentido del giro. Cada fila es [x, ancho].
const ROWS = [
  [[7, 1]],
  [[4, 3], [7, 2]],
  [[3, 1], [7, 3]],
  [[2, 1], [7, 2]],
  [[1, 1], [7, 1]],
  [[1, 1]],
  [[1, 1], [10, 1]],
  [[1, 1], [10, 1]],
  [[2, 1], [9, 1]],
  [[3, 1], [8, 1]],
  [[4, 4]],
]

// Un solo botón para girar la escena, pequeño y en la esquina de arriba a la derecha de su caja:
// abajo pisaba los pies y la cola de los sprites, y arriba queda el aire que dejan los minRows.
export default function TurnButton({ label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="px-btn px-btn--bone absolute right-3 top-3 z-10 !min-h-9 !w-9 !p-0"
    >
      <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        {ROWS.flatMap((cells, row) =>
          cells.map(([x, w]) => <path key={`${row}-${x}`} d={`M${x} ${row}h${w}v1h-${w}z`} fill={PAL.ink} />),
        )}
      </svg>
    </button>
  )
}
