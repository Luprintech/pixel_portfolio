// Sentarse, como en los juegos de granja: la viajera se coloca sobre el asiento con la pose sentada del generador del
// avatar (`SIT_POSE`: cuerpo bajado sobre las piernas, que asoman por delante) y no se mueve hasta que se levanta. Se
// dibuja por delante del mueble (el respaldo queda detrás y las piernas delante). Lo comparten los interiores (sillas y
// sofá) y el valle (bancos). Sin dependencias de Phaser: recibe el sprite y la sombra ya creados.
import { SIT_POSE, frameName } from './avatar/index.js'

// Sienta a `sprite` en `seat` ({ x, y, facing, depth }): `x, y` es donde quedan sus pies. Devuelve el sitio desde el que
// se levantará.
export function sitDown(sprite, shadow, seat) {
  const from = { x: sprite.x, y: sprite.y }
  sprite.body.setVelocity(0, 0)
  sprite.body.enable = false
  sprite.setPosition(seat.x, seat.y)
  sprite.setFrame(frameName(seat.facing, SIT_POSE))
  sprite.setDepth(seat.depth)
  shadow.setVisible(false)
  return from
}

// Levanta a `sprite` y la devuelve a `from`, con el cuerpo físico de nuevo en marcha.
export function standUp(sprite, shadow, from) {
  sprite.body.enable = true
  sprite.body.reset(from.x, from.y)
  shadow.setVisible(true)
}
