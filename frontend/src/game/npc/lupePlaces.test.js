import { describe, expect, it } from 'vitest'
import { BUILDINGS, TILE, blockedWaterTiles, plazaTiles, roadTiles } from '../world.js'
import { initialStory } from '../story/story.js'
import { ENTRANCE, HOME, TOUR_GOAL, placesFor } from './lupePlaces.js'
import { NAV_REGION } from './valleNav.js'

const story = (tour) => ({ ...initialStory(), welcome: 'done', tour })
const points = [ENTRANCE.post, ...ENTRANCE.spots, HOME.post, ...HOME.spots]

describe('sitios de Lupe', () => {
  const walkable = new Set([...roadTiles(), ...plazaTiles()])
  const water = blockedWaterTiles()
  const tileOf = ({ x, y }) => `${Math.floor(x / TILE)},${Math.floor(y / TILE)}`

  it('están sobre el camino, fuera del agua y dentro de la zona de caminos', () => {
    points.forEach((p) => {
      expect(walkable.has(tileOf(p)), JSON.stringify(p)).toBe(true)
      expect(water.has(tileOf(p))).toBe(false)
      expect(p.x).toBeGreaterThan(NAV_REGION.x + 8)
      expect(p.x).toBeLessThan(NAV_REGION.x + NAV_REGION.width - 8)
      expect(p.y).toBeGreaterThan(NAV_REGION.y + 4)
      expect(p.y).toBeLessThan(NAV_REGION.y + NAV_REGION.height - 4)
    })
  })

  it('ninguno cae dentro de un edificio', () => {
    points.forEach(({ x, y }) => {
      const tx = Math.floor(x / TILE)
      const ty = Math.floor(y / TILE)
      expect(BUILDINGS.some((b) => tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h)).toBe(false)
    })
  })

  it('el destino de la visita está junto a la puerta de la casa, al lado y no encima', () => {
    const home = BUILDINGS.find((b) => b.id === 'about')
    const doorX = home.door.x * TILE + TILE / 2
    expect(Math.abs(TOUR_GOAL.x - doorX)).toBeGreaterThan(14)
    expect(Math.abs(TOUR_GOAL.x - doorX)).toBeLessThan(48)
    expect(TOUR_GOAL.y).toBeGreaterThanOrEqual(home.door.y * TILE)
  })

  it('el sitio habitual cambia a la puerta de su casa solo cuando la visita se ha completado', () => {
    ;['none', 'pending', 'accepted', 'cancelled'].forEach((tour) => expect(placesFor(story(tour))).toBe(ENTRANCE))
    expect(placesFor(story('completed'))).toBe(HOME)
  })
})
