import { describe, expect, it } from 'vitest'
import { CHAIR, CHAIR_ZONE, DECK, STAIRS, TABLE, TELESCOPE, climb, stairLift } from '../terrace.js'
import { BACK_RAIL, BACK_RAIL_Y, CORNER_POSTS, FLOOR_DEPTH, FLOOR_TOP, FRONT_RAIL, LOWER_WALL, LOWER_WINDOW, PARASOL, STRAND, frontRailPosts, lowerWindowXs, noseY, railPosts, stairRailPosts, stairRailTop, strandPoints } from './terraceProps.js'

describe('composición de la cubierta de la casa de Lupe', () => {
  it('la balaustrada trasera es un tramo continuo de esquina a esquina, con los postes altos en los extremos', () => {
    expect(BACK_RAIL.from).toBe(DECK.left - 4)
    expect(BACK_RAIL.right).toBe(DECK.right)
    expect(CORNER_POSTS.left).toBe(BACK_RAIL.from)
    expect(CORNER_POSTS.right + 3).toBe(BACK_RAIL.right)
    // El poste izquierdo cae en la columna del poste de esquina de la escalera: una sola pieza de arriba abajo.
    expect(CORNER_POSTS.left).toBe(FRONT_RAIL.x)
    expect(BACK_RAIL_Y).toBeLessThan(FLOOR_TOP)
    expect(railPosts(BACK_RAIL.from, BACK_RAIL.right - BACK_RAIL.from).at(-1)).toBe(CORNER_POSTS.right)
  })

  it('la guirnalda cuelga de un poste a otro, sin pasar sobre el telescopio', () => {
    // Sobre el tubo, el buscador y el ocular (el punto más alto, a 36 píxeles de la base) no pasa ninguna bombilla.
    strandPoints()
      .filter((p) => p.x >= TELESCOPE.x - 15 && p.x <= TELESCOPE.x + 10)
      .forEach((p) => expect(p.y + 3, `columna ${p.x}`).toBeLessThan(TELESCOPE.base - 36))
  })

  it('la barandilla delantera arranca en el poste de la escalera, a la altura del pasamanos, y llega al muro de la casa', () => {
    expect(FRONT_RAIL.x).toBe(stairRailPosts(STAIRS).at(-1))
    expect(FRONT_RAIL.x).toBeLessThanOrEqual(DECK.left)
    // El barandal sigue la línea donde acaba el pasamanos.
    expect(FRONT_RAIL.top + 2).toBe(stairRailTop(FRONT_RAIL.x + 2, STAIRS))
    expect(FRONT_RAIL.right).toBe(DECK.right)
  })

  it('las dos ventanas bajo la cubierta quedan con el mismo margen a los lados y entre ellas', () => {
    const [first, second] = lowerWindowXs()
    const margins = [first - LOWER_WALL.x, second - (first + LOWER_WINDOW.w), LOWER_WALL.right - 2 - (second + LOWER_WINDOW.w)]
    expect(Math.max(...margins) - Math.min(...margins)).toBeLessThanOrEqual(1)
  })

  it('la silla cabe en la cubierta entre el telescopio y la mesa, y se sienta uno desde delante', () => {
    // El tubo llega hasta su culata (a 10 columnas del centro del trípode) y la silla empieza después.
    expect(CHAIR.x - 10).toBeGreaterThan(TELESCOPE.x + 10)
    expect(CHAIR.x + 10).toBeLessThan(TABLE.x - 11)
    // La franja de uso está sobre suelo que se pisa y no dentro de la silla.
    expect(CHAIR_ZONE.y).toBeGreaterThan(CHAIR.base)
    expect(CHAIR_ZONE.y + CHAIR_ZONE.h).toBeLessThanOrEqual(DECK.feet)
    const spot = climb('deck', CHAIR.x, CHAIR.base - 1)
    expect(spot.y).toBeGreaterThanOrEqual(CHAIR.base + 2)
  })

  it('el pasamanos tiene un poste al pie y otro arriba, y todos los peldaños quedan protegidos', () => {
    const posts = stairRailPosts(STAIRS)
    expect(posts[0]).toBeLessThanOrEqual(STAIRS.x + STAIRS.run)
    posts.slice(1).forEach((px, i) => expect(px - posts[i], `tramo ${i}`).toBeLessThanOrEqual(13))
  })

  it('el suelo de la cubierta cubre las filas donde se pisa', () => {
    expect(FLOOR_TOP).toBeLessThanOrEqual(DECK.top)
    expect(FLOOR_TOP + FLOOR_DEPTH).toBeGreaterThanOrEqual(DECK.feet)
  })

  it('la barandilla delantera reparte sus postes a partes iguales, con uno en cada extremo', () => {
    const posts = frontRailPosts()
    expect(posts[0]).toBe(FRONT_RAIL.x)
    expect(posts[posts.length - 1]).toBe(FRONT_RAIL.right - 3)
    // Reparto uniforme: la diferencia entre el tramo más largo y el más corto es de un píxel por el redondeo.
    const gaps = posts.slice(1).map((px, i) => px - posts[i])
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1)
    expect(Math.max(...gaps)).toBeLessThanOrEqual(20)
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

  it('la guirnalda va de un poste a otro, con los extremos a la misma altura y las bombillas a distancias iguales', () => {
    const points = strandPoints()
    expect(points[0].x).toBe(CORNER_POSTS.left + 1)
    expect(points[points.length - 1].x).toBe(CORNER_POSTS.right + 1)
    expect(points[0].y).toBe(points[points.length - 1].y)
    // Cae hacia el centro: el punto más bajo está entre los dos postes.
    const lowest = points.reduce((a, b) => (b.y > a.y ? b : a))
    expect(lowest.y).toBeGreaterThan(points[0].y)
    const bulbs = points.filter((p) => p.bulb).map((p) => p.x)
    expect(bulbs).toHaveLength(STRAND.bulbs)
    const gaps = bulbs.slice(1).map((x, i) => x - bulbs[i])
    expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1)
  })

  it('cada tramo de balaustrada acaba en un poste', () => {
    ;[[BACK_RAIL.from, BACK_RAIL.right - BACK_RAIL.from], [10, 20], [10, 33]].forEach(([x, w]) => {
      const posts = railPosts(x, w)
      expect(posts[0]).toBe(x)
      expect(x + w - posts[posts.length - 1]).toBeLessThanOrEqual(7)
    })
  })
})
