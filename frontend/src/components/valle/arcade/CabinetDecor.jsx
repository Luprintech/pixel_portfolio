import { PAL } from '../../../game/palette'

// Adornos del frontal de la recreativa. Son solo dibujo (píxel art en SVG con bordes duros): no reciben clics ni foco y no
// sustituyen a los controles reales, que son los botones de la interfaz y el teclado.

// Lucecita del marco; parpadea por pasos y se queda fija si se pide menos movimiento (ver `.arcade-led` en `index.css`).
export function Led({ color, delay = 0 }) {
  return <span aria-hidden="true" className="arcade-led block h-2 w-2 shrink-0" style={{ background: color, animationDelay: `${delay}ms` }} />
}

// Joystick visto desde arriba: base cuadrada, palo y bola roja.
export function Joystick() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" shapeRendering="crispEdges" className="pointer-events-none h-14 w-14 shrink-0">
      <rect x="1" y="1" width="14" height="14" fill={PAL.ink} />
      <rect x="2" y="2" width="12" height="12" fill={PAL.stone} />
      <rect x="2" y="2" width="12" height="2" fill={PAL.mist} />
      <rect x="7" y="8" width="2" height="4" fill={PAL.ink} />
      <rect x="4" y="2" width="8" height="8" fill={PAL.tileDark} />
      <rect x="5" y="3" width="6" height="6" fill={PAL.tile} />
      <rect x="6" y="4" width="2" height="2" fill={PAL.bone} />
    </svg>
  )
}

// Botón arcade redondo y decorativo, del color que se le dé.
export function PushButton({ color, shade }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10" shapeRendering="crispEdges" className="pointer-events-none h-9 w-9 shrink-0">
      <rect x="3" y="0" width="4" height="10" fill={PAL.ink} />
      <rect x="0" y="3" width="10" height="4" fill={PAL.ink} />
      <rect x="1" y="1" width="8" height="8" fill={PAL.ink} />
      <rect x="2" y="2" width="6" height="6" fill={shade} />
      <rect x="2" y="2" width="5" height="5" fill={color} />
      <rect x="3" y="3" width="2" height="1" fill={PAL.bone} />
    </svg>
  )
}

// Ranura de monedas.
export function CoinSlot() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 14" shapeRendering="crispEdges" className="pointer-events-none h-10 w-8 shrink-0">
      <rect width="12" height="14" fill={PAL.ink} />
      <rect x="1" y="1" width="10" height="12" fill={PAL.stone} />
      <rect x="5" y="3" width="2" height="6" fill={PAL.ink} />
      <rect x="3" y="10" width="6" height="2" fill={PAL.saffron} />
    </svg>
  )
}
