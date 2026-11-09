import PixelIconButton from './PixelIconButton'

// Camiseta de 11×11: la ropa es lo primero que se reconoce del creador de aspecto.
const SHIRT = [
  '.XXX...XXX.',
  'XXXXX.XXXXX',
  'XXXXXXXXXXX',
  'XXXXXXXXXXX',
  '..XXXXXXX..',
  '..XXXXXXX..',
  '..XXXXXXX..',
  '..XXXXXXX..',
  '..XXXXXXX..',
  '..XXXXXXX..',
  '..XXXXXXX..',
]

// Botón que abre el creador de aspecto desde el valle.
export default function CustomizeButton({ label, onClick, className }) {
  return <PixelIconButton rows={SHIRT} label={label} onClick={onClick} className={className} />
}
