// A partir de qué fracción del recorrido del joystick cuenta como "pulsar" una dirección (el juego solo distingue pulsada o no).
const THRESHOLD = 0.35

// Si un eje pesa menos de esta fracción del otro, el dedo apunta a una sola dirección: así empujar hacia arriba con el pulgar algo
// torcido no mete un paso lateral. Las diagonales de verdad (cerca de 45°) se conservan.
const AXIS_BIAS = 0.5

// Qué direcciones quedan pulsadas con el pulgar en (x, y), de -1 a 1. En los juegos que solo se mueven de lado (`horizontal`)
// no hay arriba ni abajo, y así un pulgar algo torcido no se pierde en una dirección que el juego ignora.
export function heldDirections(x, y, horizontal) {
  const held = new Set()
  const sideways = !horizontal && Math.abs(x) < Math.abs(y) * AXIS_BIAS ? 0 : x
  const vertical = !horizontal && Math.abs(y) < Math.abs(x) * AXIS_BIAS ? 0 : y
  if (sideways <= -THRESHOLD) held.add('left')
  if (sideways >= THRESHOLD) held.add('right')
  if (!horizontal && vertical <= -THRESHOLD) held.add('up')
  if (!horizontal && vertical >= THRESHOLD) held.add('down')
  return held
}

// Banda de izquierda y derecha (Invasión Galáctica): la mitad izquierda de la banda es "izquierda" y la derecha, "derecha", sin
// zona muerta, para que el pulgar no tenga que acertar. `fraction` es la posición del dedo a lo ancho de la banda, de 0 a 1
// (fuera de ella se toma el extremo más cercano).
export function bandDirections(fraction) {
  return new Set([fraction < 0.5 ? 'left' : 'right'])
}
