// Dibuja un fotograma de «La espada del Bucle» en el lienzo de 240×192 (marcador de 16 píxeles y campo de 15×11 baldosas). Solo
// lee el estado: no lo cambia. El texto de los diálogos no se pinta aquí: va en un bocadillo HTML junto al mago (ver
// `ArcadeMachine.jsx`). Sin dependencias de Phaser ni de React.
import { WALK_CYCLE } from '../../avatar/index.js'
import { PAL } from '../../palette.js'
import { drawText } from '../../pixelFont.js'
import { rect } from '../../pixelKit.js'
import { blockAt, chestAt, isOpen, swordBox, tileChar, wizardTile } from './logic.js'
import { dungeonSprites } from './sprites.js'
import { COLS, HUD, ROOMS, ROWS, TILE, WIDTH } from './world.js'

const WALK_MS = 140
const px = (value) => Math.round(value)

function drawHud(g, sprites, { player }) {
  rect(g, 0, 0, WIDTH, HUD, PAL.ink)
  rect(g, 0, HUD - 1, WIDTH, 1, '#46446a')
  for (let i = 0; i < player.maxHp; i++) g.drawImage(sprites.heart[i < player.hp ? 'full' : 'empty'], 4 + i * 10, 4)
  let x = 62
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

// Qué dibujo lleva cada casilla según la sala y lo que ha pasado en ella.
function tileSprite(sprites, state, theme, ch, col, row) {
  if (chestAt(state, col, row)) {
    const open = isOpen(state, col, row)
    if (theme === 'forest') return open ? sprites.tile.forestChestOpen : sprites.tile.forestChest
    return open ? sprites.tile.chestOpen : sprites.tile.chest
  }
  if (ch === 'L') return state.doors.has(`${state.room}:${col},${row}`) ? null : sprites.tile.L
  if (ch === 'G') return state.solved.has(state.room) ? null : sprites.tile.G
  if (ch === 'S') return blockAt(state, col, row) ? sprites.tile.SOn : sprites.tile.S
  if (ch === 'U') return theme === 'forest' ? sprites.tile.caveMouth : sprites.tile.U
  if (ch === 'F') return sprites.tile.flowers
  return sprites.tile[ch] ?? null
}

function drawTiles(g, sprites, state, time) {
  const { theme } = ROOMS[state.room]
  const floor = theme === 'forest' ? sprites.tile.grass : sprites.tile.floor
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TILE
      const y = HUD + row * TILE
      const ch = tileChar(state, col, row)
      g.drawImage(floor, x, y)
      if (ch === '~') g.drawImage(sprites.tile['~'][Math.floor(time / 600) % 2], x, y)
      else if (ch !== '.' && ch !== 'W' && ch !== 'C') {
        const sprite = tileSprite(sprites, state, theme, ch, col, row)
        if (sprite) g.drawImage(sprite, x, y)
      } else if (ch === 'C' && chestAt(state, col, row)) g.drawImage(tileSprite(sprites, state, theme, ch, col, row), x, y)
    }
  }
  state.blocks.forEach((block) => g.drawImage(sprites.tile.block, block.col * TILE, HUD + block.row * TILE))
}

// Dibuja todo el fotograma. `time` son los milisegundos del reloj de la pantalla (para el agua, el parpadeo y los brillos).
export function drawGame(g, state, time) {
  const sprites = dungeonSprites()
  g.imageSmoothingEnabled = false
  drawHud(g, sprites, state)
  drawTiles(g, sprites, state, time)
  state.pickups.forEach((pickup) => {
    const bob = Math.round(Math.sin(time / 180 + pickup.x) * 1)
    g.drawImage(sprites.pickup[pickup.type], px(pickup.x - 4), HUD + px(pickup.y - 4) + bob)
  })

  const wizard = wizardTile(state.room)
  const actors = [
    ...(wizard ? [{ y: wizard.row * TILE + 8, draw: () => g.drawImage(sprites.wizard, wizard.col * TILE, HUD + wizard.row * TILE) }] : []),
    ...state.enemies.map((enemy) => ({ y: enemy.y, draw: () => drawEnemy(g, sprites, enemy, time) })),
    { y: state.player.y, draw: () => drawPlayer(g, sprites, state, time) },
  ].sort((a, b) => a.y - b.y)
  actors.forEach((actor) => actor.draw())

  drawQuestMark(g, state, time)
  state.shots.forEach((shot) => g.drawImage(sprites.ball, px(shot.x - 4), HUD + px(shot.y - 4)))
  drawVictory(g, sprites, state, time)
  state.fx.forEach((p) => {
    g.globalAlpha = Math.min(1, p.ms / 260)
    rect(g, px(p.x), HUD + px(p.y), 2, 2, p.color)
  })
  g.globalAlpha = 1
}

function drawEnemy(g, sprites, enemy, time) {
  if (enemy.hurt > 0 && Math.floor(time / 60) % 2) return
  const frame = Math.floor(time / 300 + enemy.phase) % 2
  let sprite = sprites.enemy[enemy.type][frame]
  if (enemy.boss) {
    // Avisa de la embestida parpadeando en claro y, al cambiar de fase, se queda morado y quieto.
    if (enemy.mode === 'windup' && Math.floor(time / 90) % 2) sprite = sprites.bossFlash[frame]
    else if (enemy.mode === 'stun') sprite = sprites.bossCalm[frame]
    const shake = enemy.mode === 'windup' ? (Math.floor(time / 50) % 2 ? 1 : -1) : 0
    g.drawImage(sprite, px(enemy.x - sprite.width / 2) + shake, HUD + px(enemy.y - sprite.height / 2))
    return
  }
  g.drawImage(sprite, px(enemy.x - sprite.width / 2), HUD + px(enemy.y - sprite.height / 2))
}

function drawPlayer(g, sprites, state, time) {
  const { player } = state
  if (player.hurt > 0 && Math.floor(time / 80) % 2) return
  const step = player.moving ? WALK_CYCLE[Math.floor(player.walk / WALK_MS) % WALK_CYCLE.length] : 0
  // Sin espada conseguida (o con ella en el aire) la viajera va con las manos libres: `heroSwing` es el dibujo sin hoja.
  const set = player.swing > 0 || !player.sword ? sprites.heroSwing : sprites.hero
  g.drawImage(set[player.dir][step], px(player.x - 8), HUD + px(player.y - 11))
  if (player.guard) {
    // El escudo en alto va delante de ella, en el lado al que mira; si mira hacia arriba queda detrás del cuerpo.
    const shield = sprites.guard[player.dir]
    const offset = { up: [0, -10], down: [0, 8], left: [-9, 0], right: [9, 0] }[player.dir]
    g.drawImage(shield, px(player.x + offset[0] - shield.width / 2), HUD + px(player.y + offset[1] - shield.height / 2 + 1))
  }
  if (player.swing > 0) {
    const box = swordBox(player)
    const blade = sprites.blade[player.dir]
    g.drawImage(blade, px((box.x0 + box.x1) / 2 - blade.width / 2), HUD + px((box.y0 + box.y1) / 2 - blade.height / 2))
  }
}

// Exclamación amarilla de misión sobre la cabeza del mago, con un saltito, justo antes de que hable.
function drawQuestMark(g, state, time) {
  const wizard = wizardTile(state.room)
  if (state.intro !== 'notice' || !wizard) return
  const x = wizard.col * TILE + 6
  const y = HUD + wizard.row * TILE - 14 - Math.round(Math.abs(Math.sin(time / 120)) * 3)
  rect(g, x - 1, y - 1, 6, 12, PAL.ink)
  rect(g, x, y, 4, 7, PAL.saffron)
  rect(g, x, y + 8, 4, 3, PAL.saffron)
  rect(g, x + 1, y + 1, 1, 5, PAL.saffronLight)
}

// Escena de victoria: el Cristal del Bucle aparece en el centro de la sala y sube despacio, con destellos alrededor.
function drawVictory(g, sprites, state, time) {
  const scene = state.victory
  if (!scene?.crystal) return
  const rise = Math.min(1, (scene.ms - 700) / 1400)
  const x = 120
  const y = 16 + 88 - rise * 16
  g.globalAlpha = 0.22
  rect(g, x - 14, y - 12, 28, 28, PAL.lagoonLight)
  g.globalAlpha = 1
  g.drawImage(sprites.crystal, x - 7, px(y - 9) + Math.round(Math.sin(time / 260)))
  for (let i = 0; i < 4; i++) {
    const angle = time / 500 + (i * Math.PI) / 2
    rect(g, px(x + Math.cos(angle) * 16), px(y + Math.sin(angle) * 11), 2, 2, i % 2 ? PAL.saffronLight : '#ffffff')
  }
}
