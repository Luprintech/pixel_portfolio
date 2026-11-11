import { PAL } from '../../../game/palette'

// Cruceta táctil y botón A de la recreativa: se leen como las teclas. En los juegos que solo se mueven de lado (`horizontal`) la
// cruceta se reduce a izquierda y derecha. El botón A actúa o dispara y, mantenido, repite el disparo.
export default function TouchPad({ labels, action, horizontal, onDirection, onAction }) {
  const hold = (dir, on) => (event) => {
    event.preventDefault()
    onDirection(dir, on)
  }
  const button = (dir, symbol, className) => (
    <button
      key={dir}
      type="button"
      aria-label={labels[dir]}
      className={`px-btn px-btn--bone !min-h-12 !w-12 !p-0 select-none touch-none ${className}`}
      onPointerDown={hold(dir, true)}
      onPointerUp={hold(dir, false)}
      onPointerLeave={hold(dir, false)}
      onPointerCancel={hold(dir, false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {symbol}
    </button>
  )
  const press = (on) => (event) => {
    event.preventDefault()
    onAction(on)
  }
  return (
    <div className="flex w-full max-w-md items-center justify-between px-4 pb-1" style={{ color: PAL.ink }}>
      {horizontal ? (
        <div className="flex gap-2">
          {button('left', '◀', '')}
          {button('right', '▶', '')}
        </div>
      ) : (
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          {button('up', '▲', 'col-start-2 row-start-1')}
          {button('left', '◀', 'col-start-1 row-start-2')}
          {button('right', '▶', 'col-start-3 row-start-2')}
          {button('down', '▼', 'col-start-2 row-start-3')}
        </div>
      )}
      <button
        type="button"
        aria-label={action}
        className="px-btn select-none touch-none !min-h-16 !w-16 !rounded-full !p-0 text-xl"
        onPointerDown={press(true)}
        onPointerUp={press(false)}
        onPointerLeave={press(false)}
        onPointerCancel={press(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        A
      </button>
    </div>
  )
}
