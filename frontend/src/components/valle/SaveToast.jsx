import { PAL } from '../../game/palette'

// Corazón de 7×6 píxeles: una fila por cadena, `#` es relleno y `o` el brillo.
const HEART = ['.##.##.', '#o#####', '#######', '.#####.', '..###..', '...#...']

// Aviso corto de guardado, bajo la barra del valle. Es un `status` educado: los lectores de pantalla lo anuncian
// sin interrumpir, y no recibe clics (el juego sigue debajo). Se anima con `.px-prompt-in`, que ya respeta
// "reducir movimiento".
export default function SaveToast({ message, style }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[4.25rem] z-20 -translate-x-1/2" role="status" aria-live="polite">
      {message && (
        <p key={message.id} className="px-text px-prompt-in flex items-center gap-2 px-3 py-1 text-sm" style={style}>
          <svg width="14" height="12" viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden="true">
            {HEART.flatMap((row, y) =>
              [...row].map((cell, x) => (cell === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={cell === 'o' ? PAL.bone : PAL.tile} />)),
            )}
          </svg>
          {message.text}
        </p>
      )}
    </div>
  )
}
