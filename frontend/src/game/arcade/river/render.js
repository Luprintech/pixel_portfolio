// Dibuja un fotograma de «Río en Peligro» en el lienzo de 240×192: el río fila a fila según el nivel, las pistas, las islas, los
// puentes, los objetivos, las balas, la avioneta y el cuadro de mandos (puntos, vidas y combustible). Solo lee el estado.
// Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../../palette.js'
import { drawText } from '../../pixelFont.js'
import { hash2, rect } from '../../pixelKit.js'
import { LANDING_RUNWAY, PLANE_Y, TAKEOFF_RUNWAY, W, H, BRIDGE_ROW, riverAt } from './level.js'
import { riverSprites } from './sprites.js'

const px = Math.round
const screenY = (state, wy) => PLANE_Y - (wy - state.dist)
const PANEL_Y = 180

// El río, fila a fila: tierra, orilla de arena y agua con destellos que se desplazan con el mundo.
function drawRiver(g, state) {
  for (let y = 0; y < H; y++) {
    const wy = state.dist + (PLANE_Y - y)
    const { left, right } = riverAt(state.seed, wy)
    const l = px(left)
    const r = px(right)
    rect(g, 0, y, W, 1, TONE.grass[3])
    if (Math.floor(wy / 7) % 11 === 0) rect(g, 0, y, W, 1, TONE.grass[2])
    rect(g, l - 2, y, 2, 1, TONE.sand[1])
    rect(g, r, y, 2, 1, TONE.sand[1])
    rect(g, l, y, r - l, 1, PAL.lagoon)
    const row = Math.floor(wy)
    if (hash2(row >> 2, 3, 9) > 0.86) {
      const x = l + 6 + Math.floor(hash2(row >> 2, 5, 9) * Math.max(1, r - l - 24))
      rect(g, x, y, 10, 1, PAL.lagoonLight)
    }
  }
}

// Árboles sueltos por las orillas, fijos en el mundo.
function drawBanks(g, sprites, state) {
  const first = Math.floor((state.dist - 40) / 22)
  for (let i = first; i < first + Math.ceil((H + 80) / 22); i++) {
    const wy = i * 22
    const { left, right } = riverAt(state.seed, wy)
    const y = screenY(state, wy)
    if (hash2(i, 1, 4) > 0.55 && left > 20) g.drawImage(sprites.tree, px(left - 12 - hash2(i, 2, 4) * (left - 24) * 0.9), px(y))
    if (hash2(i, 3, 4) > 0.55 && right < W - 20) g.drawImage(sprites.tree, px(right + 6 + hash2(i, 4, 4) * (W - right - 16) * 0.9), px(y))
  }
}

function drawRunways(g, state) {
  const strip = (x, y0, y1, half, lit) => {
    const top = px(screenY(state, y1))
    const height = px(y1 - y0)
    rect(g, x - half, top, half * 2, height, '#46446a')
    rect(g, x - half, top, 2, height, PAL.bone)
    rect(g, x + half - 2, top, 2, height, PAL.bone)
    for (let y = top + 4; y < top + height; y += 12) rect(g, x - 1, y, 2, 6, PAL.bone)
    if (!lit) return
    for (let y = top; y < top + height; y += 16) {
      rect(g, x - half - 3, y, 2, 2, PAL.saffron)
      rect(g, x + half + 1, y, 2, 2, PAL.saffron)
    }
  }
  strip(W / 2, TAKEOFF_RUNWAY.y0, TAKEOFF_RUNWAY.y1, 22, false)
  strip(LANDING_RUNWAY.x, LANDING_RUNWAY.y0, LANDING_RUNWAY.y1, LANDING_RUNWAY.half, true)
}

function drawBridge(g, state, bridge) {
  const y = px(screenY(state, bridge.wy))
  const { left, right } = riverAt(state.seed, bridge.wy)
  if (!bridge.alive) {
    // Pilares rotos a cada lado.
    rect(g, px(left) - 6, y - 4, 6, 8, '#6c6a8c')
    rect(g, px(right), y - 4, 6, 8, '#6c6a8c')
    return
  }
  rect(g, 0, y - BRIDGE_ROW / 2, W, BRIDGE_ROW, '#9a6a45')
  rect(g, 0, y - BRIDGE_ROW / 2, W, 2, '#b98458')
  rect(g, 0, y + BRIDGE_ROW / 2 - 2, W, 2, '#5a3a28')
  for (let x = 4; x < W; x += 10) rect(g, x, y - 2, 1, 5, '#7a4f35')
  rect(g, px(left) - 6, y - 8, 6, 16, '#6c6a8c')
  rect(g, px(right), y - 8, 6, 16, '#6c6a8c')
  // Tablilla de «peligro» en el centro, para que se reconozca de lejos como objetivo.
  if (bridge.hp < 2) rect(g, W / 2 - 14, y - 3, 28, 6, PAL.tile)
  rect(g, W / 2 - 4, y - 2, 8, 4, PAL.saffron)
}

function drawObject(g, sprites, state, o, time) {
  const y = screenY(state, o.wy)
  if (y < -24 || y > H + 24) return
  if (o.type === 'bridge') return drawBridge(g, state, o)
  if (!o.alive) return undefined
  if (o.type === 'island') {
    const x0 = px(o.x - o.hw)
    const top = px(y - o.hh)
    rect(g, x0 - 2, top + 2, o.hw * 2 + 4, o.hh * 2 - 4, TONE.sand[1])
    rect(g, x0, top, o.hw * 2, o.hh * 2, TONE.grass[2])
    rect(g, x0 + 3, top + 3, o.hw * 2 - 6, 3, TONE.grass[3])
    rect(g, x0 + 4, top + o.hh, 4, 4, TONE.grass[0])
    return undefined
  }
  if (o.type === 'jet' && !o.active) return undefined
  let sprite = sprites[o.type]
  if (o.type === 'heli') sprite = sprite[Math.floor(time / 70) % 2]
  else if (o.type === 'jet') sprite = sprite[o.side]
  return g.drawImage(sprite, px(o.x - sprite.width / 2), px(y - sprite.height / 2))
}

function drawPlane(g, sprites, state, time) {
  const { plane } = state
  if (state.over === 'lost') return
  if (plane.invul > 0 && state.phase !== 'takeoff' && Math.floor(time / 90) % 2) return
  const bank = plane.bank > 0.35 ? 1 : plane.bank < -0.35 ? -1 : 0
  // Despegando o aterrizando: la avioneta va por el suelo (abajo, grande) y sube a su altura; con ella va su sombra.
  const lift = plane.lift
  const y = px(PLANE_Y + (1 - lift) * 20)
  if (lift < 1) g.drawImage(sprites.shadow, px(plane.x - 8) + 1, PLANE_Y + 13)
  g.drawImage(sprites.plane[bank], px(plane.x - 8), y - 8 - Math.round(lift * 2))
}

function drawPanel(g, sprites, state, time) {
  rect(g, 0, PANEL_Y, W, H - PANEL_Y, '#0e0d22')
  rect(g, 0, PANEL_Y, W, 1, '#46446a')
  drawText(g, 6, PANEL_Y + 4, String(Math.min(999999, state.score)).padStart(6, '0'), PAL.bone)
  for (let i = 0; i < Math.min(6, state.lives); i++) g.drawImage(sprites.life, W - 14 - i * 12, PANEL_Y + 2)
  // Indicador de combustible: una barra con tramos; en el último tercio se vuelve roja y parpadea.
  const x0 = 78
  const total = 84
  rect(g, x0 - 2, PANEL_Y + 2, total + 4, 8, '#2e2d5a')
  const low = state.fuel < 28
  const color = low ? (Math.floor(time / 180) % 2 ? PAL.tile : PAL.saffron) : PAL.meadow
  rect(g, x0, PANEL_Y + 4, Math.round((state.fuel / 100) * total), 4, color)
  for (let i = 1; i < 4; i++) rect(g, x0 + (total * i) / 4, PANEL_Y + 3, 1, 6, '#0e0d22')
  rect(g, x0 - 8, PANEL_Y + 3, 5, 6, PAL.tile)
  rect(g, x0 - 7, PANEL_Y + 4, 1, 4, PAL.bone)
  rect(g, x0 - 7, PANEL_Y + 4, 3, 1, PAL.bone)
  rect(g, x0 - 7, PANEL_Y + 6, 2, 1, PAL.bone)
}

export function drawGame(g, state, time) {
  const sprites = riverSprites()
  g.imageSmoothingEnabled = false
  drawRiver(g, state)
  drawRunways(g, state)
  drawBanks(g, sprites, state)
  const objects = state.objects
  objects.forEach((o) => drawObject(g, sprites, state, o, time))
  state.bullets.forEach((b) => g.drawImage(sprites.bullet, px(b.x - 1), px(screenY(state, b.wy) - 3)))
  drawPlane(g, sprites, state, time)
  state.fx.forEach((p) => {
    g.globalAlpha = Math.min(1, p.ms / 260)
    rect(g, px(p.x), px(p.y), 2, 2, p.color)
  })
  g.globalAlpha = 1
  drawPanel(g, sprites, state, time)
}
