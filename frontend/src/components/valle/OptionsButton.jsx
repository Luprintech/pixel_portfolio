import { PAL } from '../../game/palette'

// Engranaje dibujado píxel a píxel (11×11, agujero de 3×3). Se genera una fila de rectángulos por tramo
// para que el borde salga nítido a cualquier tamaño.
const GEAR = [
  '....XXX....',
  '.XX.XXX.XX.',
  '.XXXXXXXXX.',
  '..XXXXXXX..',
  'XXXX...XXXX',
  'XXXX...XXXX',
  'XXXX...XXXX',
  '..XXXXXXX..',
  '.XXXXXXXXX.',
  '.XX.XXX.XX.',
  '....XXX....',
]

const GEAR_PATH = GEAR.flatMap((row, y) =>
  [...row.matchAll(/X+/g)].map((run) => `M${run.index} ${y}h${run[0].length}v1h-${run[0].length}z`),
).join('')

// Botón de opciones de la portada: solo el engranaje, con su nombre para lectores de pantalla y
// como información emergente. Abre el diálogo de opciones que le pasa quien lo usa.
export default function OptionsButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-haspopup="dialog"
      title={label}
      className="px-btn px-btn--bone !min-h-11 !w-11 !p-0"
      style={{ color: PAL.ink }}
    >
      <svg viewBox="0 0 11 11" width="22" height="22" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path d={GEAR_PATH} fill="currentColor" />
      </svg>
    </button>
  )
}
