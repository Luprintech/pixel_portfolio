// Rampas en diagonal (la de la Universidad): con los cuerpos rectangulares de Phaser, andar solo en horizontal por una rampa
// que sube dejaría a la viajera atascada contra el borde de abajo a cada píxel. Si pide ir a un lado sin pedir subir o bajar
// y tiene los pies sobre la rampa, se le añade el avance vertical de la pendiente. Sin Phaser.

// Una rampa es un tramo recto de la línea de los pies, de (x0, y0) a (x1, y1), en píxeles del mundo.
const REACH = 3

export function onRamp(ramp, x, y) {
  if (x < ramp.x0 || x > ramp.x1) return false
  const lineY = ramp.y0 + ((x - ramp.x0) * (ramp.y1 - ramp.y0)) / (ramp.x1 - ramp.x0)
  return Math.abs(y - lineY) <= REACH
}

// Vertical que corresponde al avance horizontal `vx` sobre la rampa en la que está (si no está en ninguna, `vy` sin tocar).
export function followRamp(ramps, x, y, vx, vy) {
  if (Math.abs(vy) > 0.15 || Math.abs(vx) <= 0.15) return vy
  const ramp = ramps.find((r) => onRamp(r, x, y))
  return ramp ? (vx * (ramp.y1 - ramp.y0)) / (ramp.x1 - ramp.x0) : vy
}
