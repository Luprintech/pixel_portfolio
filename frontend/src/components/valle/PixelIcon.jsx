import { iconCells, iconSize } from '../../game/desktop'

// Icono pixel art de `game/desktop.js` pintado como SVG sin suavizar. Lo usan el escritorio, el navegador y la lista de logros.
export default function PixelIcon({ id, size = 40, className }) {
  const side = iconSize(id)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${side} ${side}`} shapeRendering="crispEdges" aria-hidden="true" className={className}>
      {iconCells(id).map(({ x, y, color }) => (
        <rect key={`${x},${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  )
}
