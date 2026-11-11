// Dibuja un fotograma de «Invasión Galáctica» en el lienzo de 240×192: espacio con estrellas y un planeta, enemigos, jefe,
// disparos, nave y marcador (puntos, naves de repuesto y oleada). Solo lee el estado. Sin Phaser ni React.
import { PAL } from '../../palette.js'
import { drawText } from '../../pixelFont.js'
import { ellipse, rect } from '../../pixelKit.js'
import { BOSS_WAVE, H, SHIP_Y, W, WAVES } from './logic.js'
import { galacticSprites } from './sprites.js'

const px = Math.round

function drawSpace(g, state) {
  rect(g, 0, 0, W, H, '#14122e')
  // Un planeta a lo lejos, a un lado, por detrás de todo.
  ellipse(g, 196, 176, 56, 40, '#2e2d5a')
  ellipse(g, 190, 170, 48, 33, '#3b3572')
  rect(g, 150, 160, 36, 2, '#4b4380')
  rect(g, 168, 174, 30, 2, '#2e2d5a')
  state.stars.forEach((s, i) => rect(g, px(s.x), px(s.y), s.size, s.size, i % 4 === 0 ? PAL.lagoonLight : i % 3 === 0 ? PAL.saffronLight : PAL.bone))
}

function drawHud(g, sprites, state) {
  rect(g, 0, 0, W, 12, '#0e0d22')
  rect(g, 0, 11, W, 1, '#2e2d5a')
  drawText(g, 6, 3, String(Math.min(999999, state.score)).padStart(6, '0'), PAL.bone)
  // Una nave por cada vida de repuesto (la que se está jugando no cuenta).
  for (let i = 0; i < Math.min(6, state.lives); i++) g.drawImage(sprites.life, W - 14 - i * 12, 2)
  // La oleada: un punto por oleada superada y uno encendido para la actual; al llegar al jefe, todos encendidos.
  const total = WAVES.length + 1
  for (let i = 0; i < total; i++) rect(g, 84 + i * 8, 4, 4, 4, i + 1 < state.wave ? PAL.saffron : i + 1 === state.wave ? PAL.bone : '#46446a')
  if (state.wave === BOSS_WAVE) rect(g, 84 + (total - 1) * 8 + 1, 5, 2, 2, PAL.tile)
}

function drawFoe(g, sprites, f, time) {
  const frame = Math.floor(time / 260 + f.id) % 2
  if (f.type === 'orb' && f.hit > 0) return g.drawImage(sprites.orbHit, px(f.x - 6), px(f.y - 6))
  const sprite = sprites.foe[f.type][frame]
  return g.drawImage(sprite, px(f.x - sprite.width / 2), px(f.y - sprite.height / 2))
}

function drawBoss(g, sprites, boss, time) {
  const tone = boss.hurt > 0 ? 'hurt' : boss.phase >= 1 ? 'rage' : 'normal'
  const sprite = sprites.boss[tone]
  g.drawImage(sprite, px(boss.x - sprite.width / 2), px(boss.y - sprite.height / 2))
  if (boss.shield > 0) {
    g.globalAlpha = 0.55 + 0.25 * Math.sin(time / 60)
    ellipse(g, px(boss.x), px(boss.y), 30, 20, PAL.lagoonLight)
    g.globalAlpha = 1
    ellipse(g, px(boss.x), px(boss.y), 26, 16, '#14122e')
    g.drawImage(sprite, px(boss.x - sprite.width / 2), px(boss.y - sprite.height / 2))
  }
  // Barra de vida del jefe, bajo el marcador.
  const filled = Math.max(0, Math.round((boss.hp / 44) * 120))
  rect(g, 60, 14, 120, 3, '#2e2d5a')
  rect(g, 60, 14, filled, 3, PAL.tile)
}

export function drawGame(g, state, time) {
  const sprites = galacticSprites()
  g.imageSmoothingEnabled = false
  drawSpace(g, state)
  state.foes.forEach((f) => !f.out && drawFoe(g, sprites, f, time))
  if (state.boss) drawBoss(g, sprites, state.boss, time)
  state.bullets.forEach((b) => g.drawImage(sprites.bullet, px(b.x - 1), px(b.y - 4)))
  state.shots.forEach((s) => g.drawImage(sprites.shot, px(s.x - 2), px(s.y - 2)))
  if (!state.over || state.over === 'won') {
    const blink = state.ship.invul > 0 && Math.floor(time / 90) % 2
    if (!blink) g.drawImage(sprites.ship[Math.floor(time / 90) % 2], px(state.ship.x - 8), SHIP_Y - 8)
  }
  state.fx.forEach((p) => {
    g.globalAlpha = Math.min(1, p.ms / 260)
    rect(g, px(p.x), px(p.y), 2, 2, p.color)
  })
  g.globalAlpha = 1
  drawHud(g, sprites, state)
}
