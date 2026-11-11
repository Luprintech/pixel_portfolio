// A partir de qué fracción del recorrido del joystick cuenta como "pulsar" una dirección (el juego solo distingue pulsada o no).
const THRESHOLD = 0.35

// Qué direcciones quedan pulsadas con el pulgar en (x, y), de -1 a 1. En los juegos que solo se mueven de lado (`horizontal`)
// no hay arriba ni abajo, y así un pulgar algo torcido no se pierde en una dirección que el juego ignora.
export function heldDirections(x, y, horizontal) {
  const held = new Set()
  if (x <= -THRESHOLD) held.add('left')
  if (x >= THRESHOLD) held.add('right')
  if (!horizontal && y <= -THRESHOLD) held.add('up')
  if (!horizontal && y >= THRESHOLD) held.add('down')
  return held
}
