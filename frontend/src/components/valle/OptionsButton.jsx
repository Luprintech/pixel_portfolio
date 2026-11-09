import PixelIconButton from './PixelIconButton'

// Engranaje de 11×11 con un agujero de 3×3.
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

// Botón de opciones: solo el engranaje. Abre el diálogo de opciones que le pasa quien lo usa.
export default function OptionsButton({ label, onClick, className }) {
  return <PixelIconButton rows={GEAR} label={label} onClick={onClick} popup className={className} />
}
