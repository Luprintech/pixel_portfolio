import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'

// El panel redefine los tokens de su interior para que el contenido compartido con el modo clásico
// (Content.jsx) se lea igual sobre el juego: lavanda con tarjetas marfil en el valle y azul en modo noche.
export const panelStyle = {
  background: tone('lavender', PAL.ink),
  color: tone('ink', PAL.bone),
  ['--px-ink']: tone('ink', '#0f0e22'),
  ['--px-ring']: tone('lavender-deep', PAL.saffron),
  ['--text-primary']: tone('ink', PAL.bone),
  ['--text-secondary']: tone('ink', '#cfc5e0'),
  ['--bg-secondary']: tone('lavender-deep', '#2e2d5a'),
  ['--bg-surface']: tone('ivory', '#242350'),
  ['--bg-elevated']: tone('ivory', '#242350'),
  ['--border-color']: tone('ink', '#4b4380'),
  ['--accent-secondary']: tone('berry-deep', '#4cb3c9'),
  ['--accent-primary']: tone('berry-deep', PAL.saffron),
}
