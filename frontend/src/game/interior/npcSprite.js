// Un personaje quieto dentro de una sala (Atreus en casa, Ylonem y Grace en Gran Capitán): su hoja de sprites sale del mismo generador
// que la viajera, así que comparte rejilla y poses, y aquí solo se registra la textura, se coloca con su sombra y su cuerpo sólido,
// y se le da el idle de siempre: parpadear de vez en cuando y volverse hacia quien se acerca. No hay lógica de diálogos ni de movimiento.
import { DIRS, POSES, frameName, frameRect } from '../avatar/index.js'
import { prefersReducedMotion } from '../../lib/reducedMotion.js'

// Hoja registrada una sola vez por clave. `sheet` y `blink` son funciones para no dibujar el lienzo si la textura ya existe.
function addNpcSheet(scene, key, sheet, blink) {
  if (scene.textures.exists(key)) return
  const texture = scene.textures.addCanvas(key, sheet())
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < POSES; pose++) {
      const { x, y, w, h } = frameRect(dir, pose)
      texture.add(frameName(dir, pose), 0, x, y, w, h)
    }
  })
  scene.textures.addCanvas(`${key}-blink`, blink())
}

// Devuelve lo que la escena necesita para girarlo y para colocarle encima la exclamación de "quiere hablar".
export function buildNpcSprite(scene, { key, sheet, blink, plan, body }, addSolid) {
  addNpcSheet(scene, key, sheet, blink)
  const sprite = scene.add.sprite(plan.x, plan.y, key, frameName(plan.facing, 0)).setOrigin(0.5, 1).setDepth(plan.y)
  scene.add.image(plan.x, plan.y - 1, 'shadow').setDepth(2)
  addSolid({ x: plan.x + body.l, y: plan.y + body.t, w: body.r - body.l, h: body.b - body.t })
  const npc = { key, sprite, facing: plan.facing }
  if (!prefersReducedMotion()) {
    const loop = () => {
      scene.time.delayedCall(2600 + Math.random() * 2600, () => {
        if (npc.facing === 'down') sprite.setTexture(`${key}-blink`)
        scene.time.delayedCall(140, () => {
          sprite.setTexture(key, frameName(npc.facing, 0))
          loop()
        })
      })
    }
    loop()
  }
  return npc
}

// Hacia dónde mira según dónde esté la viajera; vuelve a mirar de frente cuando se aleja.
export function faceTraveller(npc, from, facingFor) {
  const { sprite } = npc
  const dx = from.x - sprite.x
  const dy = from.y - sprite.y
  const next = Math.hypot(dx, dy) < 56 ? facingFor(dx, dy) : 'down'
  if (next === npc.facing) return
  npc.facing = next
  sprite.setTexture(npc.key, frameName(next, 0))
}
