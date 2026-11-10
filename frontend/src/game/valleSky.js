// Ciclo de día y noche, tiempo y estaciones del valle. El estado sale de `skyAt` (titleSky.js), el mismo
// de la portada, así que el día dura lo mismo y llueve, truena o nieva igual; aquí solo se decide cómo
// se ve sobre un mapa que se recorre con la cámara. Funciones puras: ValleScene las aplica a Phaser.
import { DAY_MS, lightningAt, skyAt, startPhase, strikesBetween } from './titleSky.js'
import { paintRain, paintSnow, tintLayers } from './titleSkyPaint.js'

export { tintLayers }

// Quien entra al valle lo ve a la luz del día: la visita empieza en la mañana (fase 0,36, con sol pleno) en
// lugar de a una hora al azar como en la portada, donde quedarse a oscuras es parte del juego.
const FIRST_PHASE = 0.36

// En el valle se pasea sin prisa: un día dura 8 minutos y el tiempo (con él, el otoño y el invierno) cambia
// cada 3. En la portada, que es un vistazo, el mismo ciclo va cuatro veces más rápido.
export const VALLE_PACE = 4

export const clockOffset = (seed) => ((((FIRST_PHASE - startPhase(seed)) % 1) + 1) % 1) * DAY_MS * VALLE_PACE

// Estado del cielo del valle a un instante de su reloj (en milisegundos reales, ya con el desplazamiento).
export const valleSkyAt = (ms, seed) => skyAt(ms, seed, false, VALLE_PACE)
export const valleStrikesBetween = (fromMs, toMs, seed) => strikesBetween(fromMs, toMs, seed, VALLE_PACE)

const clamp01 = (v) => Math.min(1, Math.max(0, v))

// Luz de una ventana: cada edificio se enciende a su hora, escalonados entre el anochecer y la noche
// cerrada. `rank` (0 a 1) lo da la posición del edificio en la lista; cuanto más bajo, antes.
export function windowGlow(gloom, rank) {
  return clamp01((gloom - (0.3 + 0.45 * rank)) / 0.12)
}

// Farolas: se encienden todas a la vez, un poco antes que las ventanas.
export const lampGlow = (gloom) => clamp01((gloom - 0.25) / 0.2)

// Dibuja el tiempo sobre un lienzo del tamaño de la pantalla en píxeles de juego: lluvia, nieve y el
// destello de cada rayo. El lienzo se borra antes, así que lo que no hay queda transparente.
export function paintWeather(g, sky, ms, seed, size) {
  g.clearRect(0, 0, size.width, size.height)
  paintRain(g, sky, ms, size)
  paintSnow(g, sky, ms, size)
  const strike = lightningAt(ms, seed, VALLE_PACE)
  if (strike) {
    g.globalAlpha = 0.45 * strike.flash
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, size.width, size.height)
    g.globalAlpha = 1
  }
}
