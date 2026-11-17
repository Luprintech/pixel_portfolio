import { describe, expect, it } from 'vitest'
import { FOUNTAIN_BODY, FOUNTAIN_OCCLUDER, FOUNTAIN_SIZE } from './granCapitanFountain.js'
import { FOUNTAIN_JETS, JET_HEIGHTS, jetPhase } from './fountainJets.js'
import { approach, figureBox, isHidden } from './seeThrough.js'
import { PROPS, TILE } from './world.js'
import { CAT_PLAZA, FEED_SPOTS, FILM_SPOTS, FOUNTAIN, PIGEON_HOMES, SUN_SPOTS } from './npc/granPlaces.js'

const fountain = PROPS.find((prop) => prop.kind === 'fountain')
const base = { x: fountain.at[0] * TILE, y: fountain.at[1] * TILE }
const insideBody = ({ x, y }) => FOUNTAIN_BODY.some(({ l, r, t, b }) => x >= base.x + l && x <= base.x + r && y >= base.y + t && y <= base.y + b)
// Una figura de 18×34 (la viajera) con los pies en (x, y).
const figure = (x, y) => figureBox({ x, y, displayWidth: 18, displayHeight: 34, originX: 0.5, originY: 1 })
const item = { px: base.x, py: base.y, area: FOUNTAIN_OCCLUDER }

describe('fuente del Gran Capitán', () => {
  it('sigue en el centro de la plaza, con el estanque donde estaba el de antes, y donde la buscan los NPC', () => {
    expect(base.x).toBe(FOUNTAIN.x)
    expect(Math.round(base.y)).toBe(FOUNTAIN.y)
    // El centro del estanque (la franja de en medio del cuerpo) cae en la fila 39,8, donde caía el de la fuente anterior.
    const mid = FOUNTAIN_BODY[Math.floor(FOUNTAIN_BODY.length / 2)]
    expect(Math.abs((base.y + (mid.t + mid.b) / 2) / TILE - 39.8)).toBeLessThan(0.2)
  })

  it('su cuerpo sólido cubre el pretil entero: franjas seguidas, simétricas y más anchas en el centro', () => {
    FOUNTAIN_BODY.forEach((band, i) => {
      expect(band.l).toBe(-band.r)
      if (i > 0) expect(band.t).toBe(FOUNTAIN_BODY[i - 1].b)
    })
    const widths = FOUNTAIN_BODY.map(({ l, r }) => r - l)
    expect(Math.max(...widths)).toBe(widths[Math.floor(widths.length / 2)])
    expect(Math.max(...widths)).toBeGreaterThan(130)
    expect(Math.max(...widths)).toBeLessThanOrEqual(FOUNTAIN_SIZE.w)
    expect(FOUNTAIN_BODY.at(-1).b).toBeLessThanOrEqual(0)
  })

  it('ningún sitio de paseo de los NPC cae dentro del estanque', () => {
    const spots = [...PIGEON_HOMES, CAT_PLAZA, FOUNTAIN, ...SUN_SPOTS, ...FEED_SPOTS.map((spot) => spot.to), ...FILM_SPOTS.map((spot) => spot.to)]
    spots.forEach((spot) => expect(insideBody(spot), `${spot.x},${spot.y}`).toBe(false))
  })

  it('se aclara con alguien tapado detrás del monumento, no delante ni a los lados', () => {
    // Detrás, con los pies al norte del estanque y la figura tras el pedestal.
    expect(isHidden(figure(base.x, base.y + FOUNTAIN_BODY[0].t - 2), item)).toBe(true)
    expect(isHidden(figure(base.x + 20, base.y - 90), item)).toBe(true)
    // Delante: los pies más abajo que la base, así que se dibuja encima.
    expect(isHidden(figure(base.x, base.y + 6), item)).toBe(false)
    // A los lados del estanque, aunque esté a la misma altura: el pedestal no le tapa.
    expect(isHidden(figure(base.x - 78, base.y - 40), item)).toBe(false)
    expect(isHidden(figure(base.x + 78, base.y - 40), item)).toBe(false)
    // Rozando el borde del pedestal no basta.
    expect(isHidden(figure(base.x + 44, base.y - 80), item)).toBe(false)
  })

  it('el aclarado se acerca a su objetivo sin pasarse', () => {
    expect(approach(1, 0.5, 0.2)).toBeCloseTo(0.8)
    expect(approach(0.6, 0.5, 0.2)).toBe(0.5)
    expect(approach(0.5, 1, 0.7)).toBe(1)
  })

  it('los surtidores están dentro del estanque, con el pie fijo, y no suben y bajan todos a la vez', () => {
    FOUNTAIN_JETS.forEach(({ x, y, h }) => {
      // El pie, sobre el agua: dentro de la elipse del estanque.
      const dx = (x - FOUNTAIN_SIZE.w / 2) / 68
      const dy = (y - 111) / 30
      expect(dx * dx + dy * dy, `${x},${y}`).toBeLessThan(1)
      // La cresta más alta no se sale del dibujo.
      expect(y - 1 - h).toBeGreaterThan(0)
    })
    const phases = new Set(FOUNTAIN_JETS.map((_, i) => jetPhase(i)))
    expect(phases.size).toBe(JET_HEIGHTS.length)
  })
})
