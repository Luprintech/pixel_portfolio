import PixelIconButton from './PixelIconButton'

// Más y menos de 11×11, con el trazo de 3 px que se lee bien sobre el mapa.
const PLUS = [
  '...........',
  '....XXX....',
  '....XXX....',
  '....XXX....',
  '.XXXXXXXXX.',
  '.XXXXXXXXX.',
  '.XXXXXXXXX.',
  '....XXX....',
  '....XXX....',
  '....XXX....',
  '...........',
]
const MINUS = PLUS.map((row, y) => (y >= 4 && y <= 6 ? row : '...........'))

// Acercar y alejar la vista del valle. El estado de los límites viene del juego: un botón se apaga cuando ya
// no se puede ir más lejos en esa dirección (por ejemplo, alejar en un móvil vertical).
export default function ZoomControl({ labels, canIn, canOut, onZoom, className }) {
  return (
    <span role="group" aria-label={labels.group} className="flex items-center gap-2">
      <PixelIconButton rows={PLUS} label={labels.in} onClick={() => onZoom(1)} disabled={!canIn} className={className} />
      <PixelIconButton rows={MINUS} label={labels.out} onClick={() => onZoom(-1)} disabled={!canOut} className={className} />
    </span>
  )
}
