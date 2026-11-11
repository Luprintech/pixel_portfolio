// Piezas comunes de los tres juegos de la recreativa: el tamaño del lienzo, el generador de números con semilla, el reloj de
// partida y algunos ayudantes de cálculo. Sin canvas, sin teclado y sin React: cada juego es una función de paso pura
// (`step(state, input, dt)`) y se prueba entera sin navegador.

// Todos los juegos se dibujan en el mismo lienzo apaisado de 240×192 (5:4), para que la pantalla de la recreativa no cambie de
// forma al pasar de uno a otro y el zoom sea siempre el mismo.
export const FRAME = { width: 240, height: 192 }

// Generador pseudoaleatorio con la semilla guardada en el estado: la misma partida se repite igual y las pruebas son estables.
export function random(state) {
  state.seed = (state.seed + 0x6d2b79f5) >>> 0
  let t = Math.imul(state.seed ^ (state.seed >>> 15), 1 | state.seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// Entero al azar en [min, max], ambos incluidos.
export const randomInt = (state, min, max) => min + Math.floor(random(state) * (max - min + 1))

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// ¿Se tocan dos cajas `{ x0, x1, y0, y1 }`?
export const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

// Caja centrada en (x, y) con medio lado `half` (o medio ancho y medio alto si se da `halfY`).
export const boxAt = (x, y, half, halfY = half) => ({ x0: x - half, x1: x + half, y0: y - halfY, y1: y + halfY })

// Partículas de las explosiones: se crean, se mueven y se apagan solas. Las usan los tres juegos y solo las dibuja el renderizador.
export function burst(state, x, y, colors, count = 10, speed = 70) {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + random(state) * 0.6
    const push = speed * (0.4 + random(state) * 0.8)
    state.fx.push({ x, y, vx: Math.cos(angle) * push, vy: Math.sin(angle) * push, ms: 380 + random(state) * 240, life: 620, color: colors[i % colors.length] })
  }
}

export function updateFx(state, dt) {
  state.fx.forEach((p) => {
    p.ms -= dt
    p.x += (p.vx * dt) / 1000
    p.y += (p.vy * dt) / 1000
    p.vx *= 0.96
    p.vy *= 0.96
  })
  state.fx = state.fx.filter((p) => p.ms > 0)
}
