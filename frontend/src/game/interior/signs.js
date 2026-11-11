// Rótulo de «LUPRINTECH» sobre la vitrina del rincón maker, inspirado en el neón real de Lupe: letras azul celeste (LUPRIN) y
// rosa claro (TECH) con contorno oscuro, sin placa de fondo. Se dibuja con la misma función apagado (en la vitrina, de día) y
// encendido (en la capa de luces, de noche, ver `ledLights.js`), y el brillo rosa sale de las propias letras. Sin Phaser ni React.
import { textPixels } from '../pixelFont.js'
import { rect } from './draw.js'

const WORD = 'LUPRINTECH'
// Una sola línea: cada letra mide 3 de ancho con 1 de hueco, y alrededor queda margen para el contorno y el brillo.
export const SIGN_W = 44
export const SIGN_H = 9
const LEFT = 2
const TOP = 2
const COLORS = {
  off: { outline: '#2a0f3a', blue: '#8fb8cc', pink: '#d3a9c6', glow: 0.07 },
  on: { outline: '#2a0a3a', blue: '#a6ecff', pink: '#ffd6f2', glow: 1 },
}
const NEIGHBOURS = [[0, -1], [-1, 0], [1, 0], [0, 1]]

// Pinta el rótulo con su esquina en (ox, oy), de `SIGN_W` × `SIGN_H`: primero el brillo de las letras, luego el contorno y
// por último las letras. Apagado el brillo es casi invisible.
export function drawLuprintechSign(g, ox, oy, lit) {
  const c = COLORS[lit ? 'on' : 'off']
  const pixels = textPixels(WORD).map((p) => ({ ...p, x: ox + LEFT + p.x, y: oy + TOP + p.y }))
  ;[[2, 0.1], [1, 0.16]].forEach(([r, alpha]) => {
    g.globalAlpha = alpha * c.glow
    pixels.forEach(({ x, y }) => rect(g, x - r, y - r, r * 2 + 1, r * 2 + 1, '#ff4fd8'))
  })
  g.globalAlpha = 1
  pixels.forEach(({ x, y }) => NEIGHBOURS.forEach(([dx, dy]) => rect(g, x + dx, y + dy, 1, 1, c.outline)))
  pixels.forEach(({ x, y, index }) => rect(g, x, y, 1, 1, index < 6 ? c.blue : c.pink))
}
