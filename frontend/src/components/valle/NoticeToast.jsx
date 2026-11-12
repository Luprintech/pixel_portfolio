import { PAL } from '../../game/palette'

// Pececito de 9×5 píxeles: una fila por cadena, `#` es el cuerpo y `o` el ojo.
const FISH = ['..###....', '.#####.##', '###o####.', '.#####.##', '..###....']

// Aviso corto de lo que pasa en el valle (de momento, los lances de pesca y la caña encontrada), bajo el de guardado. Igual que
// `SaveToast`: un `status` educado que los lectores de pantalla anuncian sin interrumpir, sin clics y con la animación de `.px-prompt-in`.
export default function NoticeToast({ message, style }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[7.25rem] z-20 max-w-[calc(100%-2rem)] -translate-x-1/2" role="status" aria-live="polite">
      {message && (
        <p key={message.id} className="px-text px-prompt-in flex items-center gap-2 px-3 py-1 text-center text-sm" style={style}>
          <svg width="18" height="10" viewBox="0 0 9 5" shapeRendering="crispEdges" aria-hidden="true" className="shrink-0">
            {FISH.flatMap((row, y) =>
              [...row].map((cell, x) => (cell === '.' ? null : <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={cell === 'o' ? PAL.ink : PAL.lagoonLight} />)),
            )}
          </svg>
          {message.text}
        </p>
      )}
    </div>
  )
}
