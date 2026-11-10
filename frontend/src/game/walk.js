// Cómo se anda: lectura de teclas y joystick, hacia dónde mira la viajera y qué fotograma de marcha toca.
// Lo comparten el valle y los interiores, y no depende de Phaser (recibe los controles ya creados).
import { WALK_CYCLE } from './avatar/index.js'

// Milisegundos que dura cada fotograma del ciclo de marcha.
const STEP_MS = 140

// Dirección pedida: flechas o WASD y, si no hay teclas, el joystick táctil. Cada eje vale -1, 0 o 1 con teclas.
export function inputVector(cursors, keys, joy = { x: 0, y: 0 }) {
  let vx = 0
  let vy = 0
  if (cursors.left.isDown || keys.A.isDown) vx -= 1
  if (cursors.right.isDown || keys.D.isDown) vx += 1
  if (cursors.up.isDown || keys.W.isDown) vy -= 1
  if (cursors.down.isDown || keys.S.isDown) vy += 1
  return vx === 0 && vy === 0 ? { x: joy.x, y: joy.y } : { x: vx, y: vy }
}

// Hacia dónde mira: gana el eje con más empuje.
export function facingFor(vx, vy) {
  return Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down'
}

// Avanza el ciclo de marcha. Modifica `state` ({ timer, step }): quieta vuelve al fotograma de reposo.
export function advanceWalk(state, moving, delta) {
  if (!moving) {
    state.step = 0
    return state.step
  }
  state.timer += delta
  if (state.timer > STEP_MS) {
    state.timer = 0
    state.step = (state.step + 1) % WALK_CYCLE.length
  }
  return state.step
}
