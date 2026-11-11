import { describe, expect, it } from 'vitest'
import { skyAt } from '../titleSky.js'
import { VALLE_PACE } from '../valleSky.js'
import { duskGlow, lightsOn, roomFlash, ROOM_FLASH, stringLightBulbs } from './interiorLight.js'
import { LED_DEPTH, LED_LAYERS, ledStrips } from './ledLights.js'
import { ROOF_DOOR, SPOTS, WALL_BASE, WALL_X, homeRoom } from './homeLayout.js'

const sky = (patch) => ({ dark: 0, cloud: 0.2, gloom: 0, rain: 0, snow: 0, ...patch })

describe('luz de la casa', () => {
  it('el amanecer y el atardecer calientan la sala; el día y la noche cerrados, no', () => {
    expect(duskGlow(sky({ dark: 0 }))).toBe(0)
    expect(duskGlow(sky({ dark: 1 }))).toBe(0)
    expect(duskGlow(sky({ dark: 0.5 }))).toBeGreaterThan(0.9)
    expect(duskGlow(sky({ dark: 0.5, cloud: 1 }))).toBeLessThan(duskGlow(sky({ dark: 0.5 })))
  })

  it('las luces se encienden al anochecer y no de día', () => {
    expect(lightsOn(sky({ gloom: 0 }))).toBe(0)
    expect(lightsOn(sky({ gloom: 0.3 }))).toBe(0)
    expect(lightsOn(sky({ gloom: 1 }))).toBe(1)
    expect(lightsOn(sky({ gloom: 0.45 }))).toBeGreaterThan(0)
  })

  it('con el estado real del valle: de día apagadas, de noche encendidas, y la hora de dentro es la de fuera', () => {
    const seed = 11
    let day = null
    let night = null
    for (let ms = 0; ms < 1.2e6 && !(day && night); ms += 1000) {
      const state = skyAt(ms, seed, false, VALLE_PACE)
      if (!day && state.dark === 0 && state.rain === 0 && state.snow === 0) day = state
      if (!night && state.dark === 1) night = state
    }
    expect(lightsOn(day)).toBe(0)
    expect(lightsOn(night)).toBe(1)
  })

  it('un rayo aclara la sala solo un poco y sin rayo no hay fogonazo', () => {
    expect(roomFlash(null)).toBe(0)
    expect(roomFlash({ flash: 1 })).toBe(ROOM_FLASH)
    expect(ROOM_FLASH).toBeLessThan(0.2)
  })

  it('las bombillas de la guirnalda se reparten por tramos y cuelgan del cable', () => {
    const bulbs = stringLightBulbs(20, 200, 4)
    expect(bulbs.length).toBeGreaterThan(10)
    bulbs.forEach((bulb) => {
      expect(bulb.y).toBeGreaterThanOrEqual(4)
      expect(bulb.y).toBeLessThanOrEqual(8)
    })
  })
})

describe('luces decorativas: profundidad', () => {
  const room = homeRoom()
  const strips = ledStrips(room)

  it('cada tira va en una capa conocida y todas las capas existen', () => {
    strips.forEach((strip) => expect(LED_LAYERS).toContain(strip.layer))
    LED_LAYERS.forEach((layer) => expect(strips.some((strip) => strip.layer === layer), layer).toBe(true))
  })

  it('las luces de los muebles quedan justo por delante de su mueble y por detrás de quien pasa por delante', () => {
    expect(LED_DEPTH.wall).toBeLessThan(LED_DEPTH.furniture)
    expect(LED_DEPTH.furniture).toBeGreaterThan(WALL_BASE)
    expect(LED_DEPTH.furniture).toBeLessThan(WALL_BASE + 1)
    expect(LED_DEPTH.shelf).toBeGreaterThan(SPOTS.makerShelf.y)
    expect(LED_DEPTH.shelf).toBeLessThan(SPOTS.makerShelf.y + 1)
    // La viajera se dibuja con la fila de sus pies: la primera que puede pisar por delante de la pared es la 82.
    expect(LED_DEPTH.furniture).toBeLessThan(WALL_BASE + 2)
  })

  it('no hay ninguna luz sobre la escalera de la azotea', () => {
    // El mueble ocupa de su esquina a la fila de su base; el techo, por encima, no cuenta.
    const stairs = { x: WALL_X.stairs - ROOF_DOOR.w / 2, w: ROOF_DOOR.w, top: WALL_BASE - ROOF_DOOR.h }
    strips.forEach((strip) => {
      const over = strip.x < stairs.x + stairs.w && strip.x + strip.w > stairs.x && strip.y + strip.h > stairs.top && strip.y < WALL_BASE
      expect(over, JSON.stringify(strip)).toBe(false)
    })
  })

  it('las mesas no llevan tira de luz propia que dibujaría una mancha de color alrededor', () => {
    ;[WALL_X.atreusDesk, WALL_X.lupeDesk].forEach((x) => strips.forEach((strip) => expect(Math.abs(strip.x + strip.w / 2 - x) < 20 && strip.y > 60, JSON.stringify(strip)).toBe(false)))
  })
})
