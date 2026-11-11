// Dibujo de Khalessi fuera de casa. Las texturas llevan prefijo propio (`valle-khalessi`) para no pisar las de la casa:
// si la sala volviera a registrar las suyas, los sprites de este mundo se quedarían sin imagen.
import { khalessiCanvas, khalessiSitCanvas } from '../pets/index.js'
import { shadowSprite } from '../sprites.js'

const addCanvas = (scene, key, canvas) => {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas)
}

function frameOf(cat) {
  const beat = Math.floor(cat.tick / 220) % 2
  if (cat.pose === 'walk') return `valle-khalessi-walk-${beat}`
  if (cat.pose === 'wash') return `valle-khalessi-wash-${beat}`
  return `valle-khalessi-sit-${Math.floor(cat.tick / 800) % 2}`
}

export default class CatActor {
  constructor(scene, cat) {
    ;[0, 1].forEach((step) => {
      addCanvas(scene, `valle-khalessi-sit-${step}`, khalessiSitCanvas(false, step))
      addCanvas(scene, `valle-khalessi-wash-${step}`, khalessiSitCanvas(true, step))
      addCanvas(scene, `valle-khalessi-walk-${step}`, khalessiCanvas(step, step))
    })
    addCanvas(scene, 'valle-khalessi-shadow', shadowSprite(16, 4))
    this.shadow = scene.add.image(cat.x, cat.y - 1, 'valle-khalessi-shadow').setDepth(2)
    this.sprite = scene.add.image(cat.x, cat.y, frameOf(cat)).setOrigin(0.5, 1).setDepth(cat.y)
  }

  // La gata del dibujo mira a la derecha: se refleja al mirar a la izquierda.
  render(cat) {
    this.sprite.setTexture(frameOf(cat)).setFlipX(cat.face === 'left').setPosition(cat.x, cat.y).setDepth(Math.round(cat.y))
    this.shadow.setPosition(cat.x, cat.y - 1)
  }

  setVisible(visible) {
    this.sprite.setVisible(visible)
    this.shadow.setVisible(visible)
  }

  destroy() {
    this.sprite.destroy()
    this.shadow.destroy()
  }
}
