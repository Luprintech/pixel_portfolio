import { PAL } from '../../game/palette'

// Copa de 9×9 píxeles: una fila por cadena, `#` es el cuerpo, `o` el brillo y `.` vacío.
const CUP = ['#########', '#o#####.#', '.#######.', '..#####..', '...###...', '....#....', '....#....', '...###...', '..#####..']

// Aviso de logro completado: aparece bajo la barra del valle y se anuncia con educación (`status`), sin recibir clics. Usa
// `.px-prompt-in`, que ya respeta «reducir movimiento».
export default function AchievementToast({ toast, copy, style }) {
  const item = toast ? copy.achievements.items[toast.id] : null
  return (
    <div className="pointer-events-none absolute left-1/2 top-[7rem] z-20 w-[min(22rem,92vw)] -translate-x-1/2" role="status" aria-live="polite">
      {item && (
        <p key={toast.key} className="px-text px-prompt-in flex items-center gap-3 px-3 py-2 text-sm" style={style}>
          <svg width="27" height="27" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true">
            {CUP.flatMap((row, y) =>
              [...row].map((cell, x) => (cell === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={cell === 'o' ? PAL.bone : PAL.saffron} />)),
            )}
          </svg>
          <span>
            <strong className="block">{copy.achievements.unlocked}</strong>
            {item.name}
          </span>
        </p>
      )}
    </div>
  )
}
