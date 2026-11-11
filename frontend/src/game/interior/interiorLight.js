// Cuentas de la luz dentro de la casa a partir del estado del cielo del valle (`valleSkyAt`): cuánto calienta el atardecer, cuándo
// se encienden las luces del interior y cuánto aclara un rayo. Funciones puras; las pinta `InteriorSky`. Todas parten del mismo
// estado que usa el valle, así que la hora y el tiempo de dentro son los de fuera.
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// Calidez del amanecer y del atardecer (0 a 1): sube cuando el cielo está a medias entre el día y la noche y las nubes
// cargadas la apagan.
export const duskGlow = (sky) => clamp01(1 - Math.abs(sky.dark - 0.5) * 2.4) * (1 - 0.7 * clamp01((sky.cloud - 0.6) / 0.4))

// Cuánto lucen las luces de la casa (guirnalda y tiras led): se encienden al anochecer y también con una tormenta cerrada.
export const lightsOn = (sky) => clamp01((sky.gloom - 0.3) / 0.3)

// Cuánto aclara un rayo la sala entera: apenas un fogonazo, mucho menos que lo que se ve por el cristal.
export const ROOM_FLASH = 0.14
export const roomFlash = (strike) => (strike ? ROOM_FLASH * strike.flash : 0)

// Posición de las bombillas de la guirnalda, en tramos que se descuelgan entre dos puntos: la pinta la decoración de la pared
// y las enciende `ledLights.js`, así que las dos salen de aquí.
export const STRING_SPAN = 56
// Cuánto se descuelga el cable entre dos puntos, en píxeles.
export const STRING_SAG = 4
export function stringLightBulbs(from, to, y) {
  const bulbs = []
  for (let start = from; start < to; start += STRING_SPAN) {
    const end = Math.min(to, start + STRING_SPAN)
    for (let x = start; x <= end; x++) {
      if ((x - start) % 8 !== 4) continue
      const sag = Math.round(Math.sin(((x - start) / (end - start)) * Math.PI) * STRING_SAG)
      bulbs.push({ x, y: y + sag })
    }
  }
  return bulbs
}
