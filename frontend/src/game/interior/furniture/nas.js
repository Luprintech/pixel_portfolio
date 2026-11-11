// El NAS Synology DS225+ de Lupe, de dos bahías, sobre la torre de su ordenador: una caja negra vertical con las dos bahías de discos
// al frente, el botón de encendido y los indicadores LED. Es solo el dibujo y su animación; la conversación está en
// `dialogue/scripts.js` (`nas.*`) y la zona desde la que se usa en `homeLayout.js`. Sin conexión con ningún NAS real.
import { rect } from '../draw.js'

export const NAS = { w: 10, h: 12 }

const BODY = '#23232b'
const EDGE = '#454553'
const BAY = '#33333f'
const BAY_LINE = '#4c4c5c'
const GREEN = '#6dff9b'
const ORANGE = '#ffb347'
// Halos suaves de los LED: un resplandor tenue que se nota igual de día que de noche sin deslumbrar.
const HALO_GREEN = 'rgba(109,255,155,0.22)'
const HALO_ORANGE = 'rgba(255,179,71,0.28)'

// Actividad de cada bahía a lo largo de los fotogramas de la mesa (cuatro): casi siempre encendida, con un parpadeo ocasional en
// momentos distintos para que no latan a la vez.
export const NAS_ACTIVITY = [
  [1, 1, 0, 1],
  [1, 0, 1, 1],
]

// Dibuja el NAS con su esquina superior izquierda en (x, y). `frame` elige el fotograma de los LED.
export function paintNas(g, x, y, frame) {
  rect(g, x, y, NAS.w, NAS.h, BODY)
  rect(g, x, y, NAS.w, 1, EDGE)
  rect(g, x, y, 1, NAS.h, EDGE)
  rect(g, x + NAS.w - 1, y + 1, 1, NAS.h - 1, '#111116')
  // Dos bahías de disco, con la rejilla de ventilación y la ranura de la bandeja.
  ;[0, 1].forEach((bay) => {
    const bx = x + 1 + bay * 4
    rect(g, bx, y + 2, 3, 7, BAY)
    rect(g, bx, y + 4, 3, 1, BAY_LINE)
    rect(g, bx, y + 6, 3, 1, BAY_LINE)
    // LED de actividad en el pie de cada bahía, con su halo.
    if (NAS_ACTIVITY[bay][frame % NAS_ACTIVITY[bay].length]) {
      rect(g, bx, y + 8, 3, 3, HALO_GREEN)
      rect(g, bx + 1, y + 9, 1, 1, GREEN)
    } else {
      rect(g, bx + 1, y + 9, 1, 1, '#1d4a2c')
    }
  })
  // Botón de encendido (con su LED de estado, fijo y de color ámbar suave) arriba a la derecha.
  rect(g, x + 7, y + 1, 2, 1, HALO_ORANGE)
  rect(g, x + 8, y + 1, 1, 1, ORANGE)
  // Pies de goma.
  rect(g, x + 1, y + NAS.h, 2, 1, '#111116')
  rect(g, x + NAS.w - 3, y + NAS.h, 2, 1, '#111116')
}
