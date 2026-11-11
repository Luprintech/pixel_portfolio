import { describe, expect, it } from 'vitest'
import { DECK, STAIRS, TELESCOPE, stairLift } from '../terrace.js'
import { BACK_RAIL, FLOOR_DEPTH, FLOOR_TOP, FRONT_RAIL, PARASOL, STRAND, frontRailPosts, noseY, railPosts, strandPoints } from './terraceProps.js'

describe('composición de la cubierta de la casa de Lupe', () => {
  it('el telescopio queda en el hueco de la balaustrada trasera y con la guirnalda por encima', () => {
    // El trípode (nueve píxeles a cada lado) no toca ni el poste de la esquina ni el tramo de la derecha.
    expect(BACK_RAIL.post + 3).toBeLessThanOrEqual(TELESCOPE.x - 10)
    expect(BACK_RAIL.from).toBeGreaterThanOrEqual(TELESCOPE.x + 10)
    // Sobre el tubo y su campana (30 píxeles por encima de la base) no pasa ninguna bombilla.
    strandPoints()
      .filter((p) => p.x >= TELESCOPE.x - 8 && p.x <= TELESCOPE.x + 20)
      .forEach((p) => expect(p.y + 3, `columna ${p.x}`).toBeLessThan(TELESCOPE.base - 30))
  })

  it('la barandilla delantera deja libre la entrada desde la escalera', () => {
    expect(FRONT_RAIL.x).toBeGreaterThanOrEqual(DECK.left + 10)
    expect(FRONT_RAIL.right).toBeGreaterThan(DECK.right)
  })

  it('el suelo de la cubierta cubre las filas donde se pisa', () => {
    expect(FLOOR_TOP).toBeLessThanOrEqual(DECK.top)
    expect(FLOOR_TOP + FLOOR_DEPTH).toBeGreaterThanOrEqual(DECK.feet)
  })

  it('la barandilla delantera tiene un poste cada pocos píxeles y uno en cada extremo', () => {
    const posts = frontRailPosts()
    expect(posts[0]).toBe(FRONT_RAIL.x)
    expect(posts[posts.length - 1]).toBe(FRONT_RAIL.right - 3)
    posts.slice(1).forEach((px, i) => expect(px - posts[i]).toBeLessThanOrEqual(18))
  })

  it('la guirnalda pasa por encima de la sombrilla, sin cruzar su cubierta', () => {
    strandPoints()
      .filter((p) => p.x >= PARASOL.cx - PARASOL.rx && p.x <= PARASOL.cx + PARASOL.rx)
      .forEach((p) => expect(p.y + 3, `columna ${p.x}`).toBeLessThan(PARASOL.top))
  })

  it('los pies de la viajera apoyan en la huella de cada peldaño', () => {
    // A mitad de cada peldaño el pie está a la altura del filo; en los bordes, a menos de la mitad de la subida.
    for (let i = 0; i < STAIRS.steps; i++) {
      const mid = STAIRS.x + i * STAIRS.run + STAIRS.run / 2
      const feet = STAIRS.bottom - stairLift(mid)
      expect(Math.abs(feet - noseY(i, STAIRS)), `peldaño ${i}`).toBeLessThanOrEqual(1.5)
    }
  })

  it('la guirnalda va del mástil a la pared y cada bombilla cae a siete columnas de la anterior', () => {
    const points = strandPoints()
    expect(points[0].x).toBe(STRAND.from.x)
    expect(points[points.length - 1].x).toBe(STRAND.to.x)
    const bulbs = points.filter((p) => p.bulb).map((p) => p.x)
    bulbs.slice(1).forEach((x, i) => expect(x - bulbs[i]).toBe(7))
  })

  it('cada tramo de balaustrada acaba en un poste', () => {
    ;[[BACK_RAIL.from, DECK.right + 1 - BACK_RAIL.from], [10, 20], [10, 33]].forEach(([x, w]) => {
      const posts = railPosts(x, w)
      expect(posts[0]).toBe(x)
      expect(x + w - posts[posts.length - 1]).toBeLessThanOrEqual(7)
    })
  })
})
