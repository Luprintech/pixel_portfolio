// El agua de la piscina Santuario: destellos que aparecen y se apagan en puntos distintos, y tres bandas de luz que se desplazan despacio de un lado a
// otro, como los reflejos del sol en el agua. Se dibuja sobre la lámina de la piscina (`pool` en `props.js`), sin tocar el sprite. Con la nevada se
// apaga (el agua está helada) y con "reducir movimiento" quedan quietos unos pocos destellos fijos.
import { prefersReducedMotion } from '../lib/reducedMotion.js'

// El agua dentro del dibujo de la piscina (112×84): de la esquina (8, 15) a la (104, 74).
const WATER = { x: 8, y: 15, w: 96, h: 58 }
const LIGHT = 0xd3f0f2
const GLINTS = 16
const BANDS = 3

export default class PoolLife {
  // `at` es el apoyo del dibujo (centro de la base, en píxeles) y `depth` la profundidad de la piscina: los reflejos van justo encima.
  constructor(scene, at, size = { w: 112, h: 84 }, depth = 0) {
    this.scene = scene
    const left = at.x - size.w / 2
    const top = at.y - size.h
    this.reduced = prefersReducedMotion()
    this.group = scene.add.container(0, 0).setDepth(depth + 0.5)
    this.tweens = []
    this.glints = Array.from({ length: GLINTS }, (_, i) => this.addGlint(left, top, i))
    this.bands = this.reduced ? [] : Array.from({ length: BANDS }, (_, i) => this.addBand(left, top, i))
    scene.events.once('shutdown', () => this.destroy())
  }

  randomSpot(left, top) {
    return { x: left + WATER.x + 3 + Math.random() * (WATER.w - 10), y: top + WATER.y + 3 + Math.random() * (WATER.h - 6) }
  }

  addGlint(left, top, index) {
    const spot = this.randomSpot(left, top)
    const glint = this.scene.add.rectangle(spot.x, spot.y, 4, 1, LIGHT).setAlpha(this.reduced ? 0.55 : 0)
    this.group.add(glint)
    if (!this.reduced) {
      // Cada destello se enciende, se apaga y, al volver a empezar, cambia de sitio: nunca parpadea en el mismo punto.
      this.tweens.push(
        this.scene.tweens.add({
          targets: glint,
          alpha: 0.85,
          duration: 700 + (index % 5) * 160,
          yoyo: true,
          repeat: -1,
          delay: index * 260,
          repeatDelay: 900 + (index % 4) * 450,
          onRepeat: () => {
            const next = this.randomSpot(left, top)
            glint.setPosition(next.x, next.y)
          },
        }),
      )
    }
    return glint
  }

  // Una banda de luz: ancha y fina, translúcida, que va y viene a lo largo del agua con un vaivén lento.
  addBand(left, top, index) {
    const y = top + WATER.y + 10 + index * 18
    const band = this.scene.add.rectangle(left + WATER.x + 24 + index * 14, y, 22 + index * 6, 1, LIGHT).setAlpha(0.28)
    this.group.add(band)
    this.tweens.push(this.scene.tweens.add({ targets: band, x: band.x + 24, duration: 4200 + index * 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: index * 700 }))
    return band
  }

  // Con la nevada el agua se hiela y no brilla: el contenedor se funde con el invierno del cielo.
  update(sky) {
    this.group.setAlpha(1 - Math.min(1, sky?.winter ?? 0))
  }

  destroy() {
    this.tweens.forEach((tween) => tween.stop())
    this.group.destroy()
  }
}
