// Dibuja un fotograma del juego retro en un lienzo de 160×160 (marcador de 16 píxeles y campo de 10×9 baldosas). Solo
// lee el estado: no lo cambia. Sin dependencias de Phaser ni de React.
import { WALK_CYCLE } from '../avatar/index.js'
import { PAL } from '../palette.js'
import { drawText } from '../pixelFont.js'
import { rect } from '../pixelKit.js'
import { chestAt, isOpen, swordBox, tileChar } from './logic.js'
import { retroSprites } from './sprites.js'
import { COLS, HUD, ROOMS, ROWS, TILE, WIDTH } from './world.js'

const WALK_MS = 140

function drawHud(g, sprites, { player }) {
  rect(g, 0, 0, WIDTH, HUD, PAL.ink)
  rect(g, 0, HUD - 1, WIDTH, 1, '#46446a')
  for (let i = 0; i < player.maxHp; i++) g.drawImage(sprites.heart[i < player.hp ? 'full' : 'empty'], 4 + i * 10, 4)
  let x = 44
  if (player.sword) {
    g.drawImage(sprites.icon.sword, x, 4)
    x += 12
  }
  for (let i = 0; i < player.keys; i++) {
    g.drawImage(sprites.icon.key, x, 4)
    x += 10
  }
  g.drawImage(sprites.icon.coin, WIDTH - 36, 4)
  drawText(g, WIDTH - 24, 5, String(Math.min(99, player.coins)).padStart(2, '0'), PAL.bone)
}

function drawTiles(g, sprites, state, time) {
  const { theme, map } = ROOMS[state.room]
  const floor = theme === 'forest' ? sprites.tile.grass : sprites.tile.floor
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = HUD + row * TILE
      const ch = tileChar(state, col, row)
      g.drawImage(floor, x, y)
      if (chestAt(state, col, row)) g.drawImage(isOpen(state, col, row) ? sprites.tile.chestOpen : sprites.tile.chest, x, y)
      else if (ch === '.' || ch === 'N' || ch === 'C') continue
      else if (ch === 'L') {
        if (!state.doors.has(`${state.room}:${col},${row}`)) g.drawImage(sprites.tile.L, x, y)
      } else if (ch === '~') g.drawImage(sprites.tile['~'][Math.floor(time / 600) % 2], x, y)
      else if (sprites.tile[ch]) g.drawImage(sprites.tile[ch], x, y)
    }
  }
  map.forEach((line, row) => {
    const col = line.indexOf('N')
    if (col >= 0) g.drawImage(sprites.sage, col * TILE, HUD + row * TILE)
  })
}

// Dibuja todo el fotograma. `time` son los milisegundos del reloj de la pantalla (para el agua y el parpadeo).
export function drawGame(g, state, time) {
  const sprites = retroSprites()
  g.imageSmoothingEnabled = false
  drawHud(g, sprites, state)
  drawTiles(g, sprites, state, time)
  state.pickups.forEach((pickup) => g.drawImage(sprites.pickup[pickup.type], Math.round(pickup.x - 4), HUD + Math.round(pickup.y - 4)))

  const actors = [
    ...state.enemies.map((enemy) => ({ y: enemy.y, draw: () => drawEnemy(g, sprites, enemy, time) })),
    { y: state.player.y, draw: () => drawPlayer(g, sprites, state, time) },
  ].sort((a, b) => a.y - b.y)
  actors.forEach((actor) => actor.draw())
}

function drawEnemy(g, sprites, enemy, time) {
  if (enemy.hurt > 0 && Math.floor(time / 60) % 2) return
  const frame = Math.floor(time / 300 + enemy.phase) % 2
  const sprite = sprites.enemy[enemy.type][frame]
  g.drawImage(sprite, Math.round(enemy.x - sprite.width / 2), HUD + Math.round(enemy.y - sprite.height / 2))
}

function drawPlayer(g, sprites, state, time) {
  const { player } = state
  if (player.hurt > 0 && Math.floor(time / 80) % 2) return
  const step = player.moving ? WALK_CYCLE[Math.floor(player.walk / WALK_MS) % WALK_CYCLE.length] : 0
  g.drawImage(sprites.hero[player.dir][step], Math.round(player.x - 8), HUD + Math.round(player.y - 11))
  if (player.swing > 0) {
    const box = swordBox(player)
    const blade = sprites.blade[player.dir]
    g.drawImage(blade, Math.round((box.x0 + box.x1) / 2 - blade.width / 2), HUD + Math.round((box.y0 + box.y1) / 2 - blade.height / 2))
  }
}
