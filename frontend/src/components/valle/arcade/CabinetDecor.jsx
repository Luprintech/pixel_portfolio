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
export function PushButton({ color, shade, className = 'h-9 w-9' }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10" shapeRendering="crispEdges" className={`pointer-events-none shrink-0 ${className}`}>
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

// Botón real de insertar moneda: la ranura con el saldo debajo. Es uno de los botones del panel de mandos; el resto es adorno. Con la
// ranura llena o sin monedas sigue enfocable, y el aviso de por qué no pasa nada lo da la propia pantalla.
export function CoinButton({ label, coins, flash = false, onInsert, className = '' }) {
  return (
    <button
      type="button"
      data-arcade
      aria-label={`${label} (${coins})`}
      className={`pointer-events-auto flex min-h-11 min-w-11 cursor-pointer flex-col items-center gap-0.5 px-2 py-1 ${flash ? 'arcade-insert' : ''} ${className}`}
      style={{ background: PAL.ink2, color: PAL.saffronLight, boxShadow: `0 0 0 2px ${PAL.saffron}, 0 0 0 4px ${PAL.ink}` }}
      onClick={onInsert}
    >
      <CoinSlot />
      <span aria-hidden="true" className="px-text whitespace-nowrap text-xs font-semibold leading-none">{label} · {coins}</span>
    </button>
  )
}

// Joystick grande visto desde arriba, para el panel de mandos: base cuadrada con tornillos, palo y bola roja con brillo.
function BigJoystick({ className }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" shapeRendering="crispEdges" className={`pointer-events-none shrink-0 ${className}`}>
      <rect x="1" y="1" width="22" height="22" fill={PAL.ink} />
      <rect x="2" y="2" width="20" height="20" fill={PAL.stone} />
      <rect x="2" y="2" width="20" height="2" fill={PAL.mist} />
      <rect x="3" y="3" width="2" height="2" fill={PAL.ink} />
      <rect x="19" y="3" width="2" height="2" fill={PAL.ink} />
      <rect x="3" y="19" width="2" height="2" fill={PAL.ink} />
      <rect x="19" y="19" width="2" height="2" fill={PAL.ink} />
      <rect x="11" y="13" width="2" height="6" fill={PAL.ink} />
      <rect x="6" y="3" width="12" height="12" fill={PAL.ink} />
      <rect x="7" y="4" width="10" height="10" fill={PAL.tileDark} />
      <rect x="7" y="4" width="9" height="9" fill={PAL.tile} />
      <rect x="9" y="6" width="3" height="2" fill={PAL.bone} />
      <rect x="9" y="8" width="1" height="1" fill={PAL.bone} />
    </svg>
  )
}

// Rejilla de altavoz: columnas de ranuras oscuras sobre el panel.
function SpeakerGrille() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 10" shapeRendering="crispEdges" className="pointer-events-none h-10 w-16 shrink-0">
      <rect width="16" height="10" fill={PAL.ink} />
      {[1, 4, 7, 10, 13].map((x) => <rect key={x} x={x} y="1" width="2" height="8" fill={PAL.stone} />)}
    </svg>
  )
}

// Pegatina del lateral: una estrella sobre un círculo, a modo de logotipo.
function Sticker() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" shapeRendering="crispEdges" className="pointer-events-none h-12 w-12 shrink-0">
      <rect x="3" y="0" width="6" height="12" fill={PAL.ink} />
      <rect x="1" y="1" width="10" height="10" fill={PAL.ink} />
      <rect x="0" y="3" width="12" height="6" fill={PAL.ink} />
      <rect x="2" y="2" width="8" height="8" fill={PAL.lagoon} />
      <rect x="5" y="3" width="2" height="6" fill={PAL.saffronLight} />
      <rect x="3" y="5" width="6" height="2" fill={PAL.saffronLight} />
    </svg>
  )
}

// Franja de rayas amarillas y oscuras que separa la cabecera del panel de los mandos.
function Stripes() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 48 3" preserveAspectRatio="none" shapeRendering="crispEdges" className="pointer-events-none h-3 w-full">
      <rect width="48" height="3" fill={PAL.ink2} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 4} y="0" width="2" height="3" fill={PAL.saffron} />)}
    </svg>
  )
}

// Ilustración del panel en el selector táctil (estrellas, franjas y montañas en pixel art). Con ella se quitan la rejilla y las
// rayas del panel, que el dibujo ya trae.
const PANEL_ART = '/arcade/fondo-movil.png'

// Panel de mandos de la recreativa, de adorno salvo el botón de moneda (`coin`, si se da): rejilla de altavoz, luces y pegatina arriba; joystick grande, botones y, en el
// centro, el botón de insertar moneda (o su ranura de adorno). Ocupa el alto que le dejen y reparte los elementos sin recargarlo.
export function ControlPanel({ className = '', compact = false, art = false, coin = null }) {
  const button = compact ? 'h-10 w-10' : 'h-14 w-14'
  return (
    <div aria-hidden={coin ? undefined : 'true'} className={`${coin ? '' : 'pointer-events-none '}flex flex-col ${art ? 'justify-end' : 'justify-evenly'} gap-3 p-3 ${className}`} style={{ background: PAL.ink, ...(art && { backgroundImage: `url(${PANEL_ART})`, backgroundSize: 'cover', backgroundPosition: 'center 70%', imageRendering: 'pixelated' }), boxShadow: `inset 0 0 0 2px ${PAL.stone}` }}>
      {!compact && !art && (
        <>
          <div className="flex items-center justify-between gap-2">
            <SpeakerGrille />
            <div className="flex items-center gap-1.5">
              <Led color={PAL.tile} />
              <Led color={PAL.saffron} delay={400} />
              <Led color={PAL.meadow} delay={800} />
            </div>
            <Sticker />
          </div>
          <Stripes />
        </>
      )}
      <div className="flex items-center justify-between gap-2">
        <BigJoystick className={compact ? 'h-20 w-20' : 'h-32 w-32'} />
        <div className="flex flex-col items-center gap-3">
          {coin ? <CoinButton {...coin} /> : <CoinSlot />}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1.5">
            <PushButton className={button} color={PAL.tile} shade={PAL.tileDark} />
            <PushButton className={button} color={PAL.saffron} shade={PAL.tileDark} />
          </div>
          <div className={`flex gap-1.5 ${compact ? 'ml-5' : 'ml-8'}`}>
            <PushButton className={button} color={PAL.lagoonLight} shade={PAL.lagoon} />
          </div>
        </div>
      </div>
    </div>
  )
}
