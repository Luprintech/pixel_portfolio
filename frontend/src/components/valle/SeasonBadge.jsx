import { useEffect, useRef, useState } from 'react'
import { SEASON_LABEL_MS } from '../../game/seasonConfig'
import PixelIconButton from './PixelIconButton'

// Iconos de 11×11 de cada estación: una flor, un sol, una hoja y un copo.
const ICONS = {
  spring: [
    '....XXX....',
    '...XXXXX...',
    '.XX.XXX.XX.',
    'XXXX.X.XXXX',
    '.XX.XXX.XX.',
    '...XXXXX...',
    '....XXX....',
    '.....X.....',
    '..XX.X.XX..',
    '...XXXXX...',
    '.....X.....',
  ],
  summer: [
    '.....X.....',
    '.X...X...X.',
    '..X.....X..',
    '....XXX....',
    'X..XXXXX..X',
    'XX.XXXXX.XX',
    'X..XXXXX..X',
    '....XXX....',
    '..X.....X..',
    '.X...X...X.',
    '.....X.....',
  ],
  autumn: [
    '.........XX',
    '.......XXXX',
    '.....XXXXXX',
    '....XXXXXXX',
    '...XXXXXXX.',
    '..XXXXXXX..',
    '..XXXXXX...',
    '.XXXXX.....',
    'XXXX.......',
    'XX.........',
    'X..........',
  ],
  winter: [
    '.....X.....',
    '.X...X...X.',
    '..X..X..X..',
    '...X.X.X...',
    '....XXX....',
    'XXXXXXXXXXX',
    '....XXX....',
    '...X.X.X...',
    '..X..X..X..',
    '.X...X...X.',
    '.....X.....',
  ],
}

// Indicador de la estación del valle, junto a los controles de la esquina. En compacto es solo el icono; su nombre se consulta con el ratón (al pasar
// por encima), con el teclado (al enfocarlo) y en el móvil (al tocarlo, unos segundos), y se enseña solo unos segundos cuando la estación cambia.
// El nombre sale en una etiqueta debajo del icono, para que no empuje ni tape los demás botones de la barra. `changes` cuenta los cambios desde que
// se abrió el valle: al entrar no hay aviso, solo al cambiar.
export default function SeasonBadge({ season, changes = 0, copy, style, className }) {
  const [shown, setShown] = useState(false)
  const [held, setHeld] = useState(false)
  const timer = useRef(null)
  const name = copy.names[season] ?? ''

  const reveal = () => {
    clearTimeout(timer.current)
    setShown(true)
    timer.current = setTimeout(() => setShown(false), SEASON_LABEL_MS)
  }

  // Un cambio de estación enseña el nombre unos segundos (no al entrar: `changes` es 0).
  useEffect(() => {
    if (changes > 0) reveal()
    return () => clearTimeout(timer.current)
  }, [changes, season])

  if (!ICONS[season]) return null
  const open = shown || held
  return (
    <span className="relative inline-flex">
      <PixelIconButton
        rows={ICONS[season]}
        label={`${copy.label}: ${name}`}
        onClick={reveal}
        className={className}
        aria-expanded={open}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      />
      {/* La etiqueta se anuncia a lectores de pantalla cuando cambia; siempre está en el árbol para que el aviso se lea. */}
      <span role="status" className={open ? 'px-text absolute left-0 top-full z-10 mt-2 whitespace-nowrap px-3 py-1 text-sm' : 'sr-only'} style={open ? style : undefined}>
        {name}
      </span>
    </span>
  )
}
