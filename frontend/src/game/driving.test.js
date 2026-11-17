import { describe, expect, it } from 'vitest'
import { CAR_SPEED, createCar, freeExitSpot, stepCar } from './driving.js'

const BOUNDS = { w: 1000, h: 800 }
const drive = (car, input, ms, step = 16) => {
  for (let t = 0; t < ms; t += step) stepCar(car, input, step, BOUNDS)
  return car
}

describe('stepCar', () => {
  it('acelera poco a poco hasta su velocidad y frena al soltar', () => {
    const car = createCar(500, 400)
    stepCar(car, { x: 1, y: 0 }, 16, BOUNDS)
    expect(car.vx).toBeGreaterThan(0)
    expect(car.vx).toBeLessThan(CAR_SPEED / 2)
    drive(car, { x: 1, y: 0 }, 2000)
    expect(car.vx).toBeCloseTo(CAR_SPEED, 0)
    drive(car, { x: 0, y: 0 }, 2000)
    expect(Math.abs(car.vx)).toBeLessThan(1)
  })

  it('va en cualquier dirección y en diagonal no corre más', () => {
    const car = drive(createCar(500, 400), { x: 1, y: 1 }, 3000)
    expect(Math.hypot(car.vx, car.vy)).toBeCloseTo(CAR_SPEED, 0)
  })

  it('mira hacia donde gira en horizontal y conserva el lado al subir o bajar', () => {
    const car = createCar(500, 400)
    expect(car.facing).toBe('left')
    drive(car, { x: 1, y: 0 }, 200)
    expect(car.facing).toBe('right')
    drive(car, { x: 0, y: -1 }, 200)
    expect(car.facing).toBe('right')
    drive(car, { x: -1, y: 0.3 }, 200)
    expect(car.facing).toBe('left')
  })

  it('no sale del mapa', () => {
    const car = drive(createCar(40, 40), { x: -1, y: -1 }, 3000)
    expect(car.x - 33).toBeGreaterThanOrEqual(0)
    expect(car.y - 31).toBeGreaterThanOrEqual(0)
    drive(car, { x: 1, y: 1 }, 20000)
    expect(car.x + 33).toBeLessThanOrEqual(BOUNDS.w)
    expect(car.y).toBeLessThanOrEqual(BOUNDS.h)
  })

  it('devuelve cuánto acelera (0 parado, 1 a tope) para el sonido del motor', () => {
    const car = createCar(500, 400)
    expect(stepCar(car, { x: 0, y: 0 }, 16, BOUNDS)).toBe(0)
    drive(car, { x: 1, y: 0 }, 3000)
    expect(stepCar(car, { x: 1, y: 0 }, 16, BOUNDS)).toBeCloseTo(1, 1)
  })
})

describe('freeExitSpot', () => {
  it('baja por delante del coche si está libre', () => {
    expect(freeExitSpot({ x: 500, y: 400 }, [], BOUNDS)).toEqual({ x: 500, y: 410 })
  })

  it('si delante choca, prueba detrás y luego los lados', () => {
    const front = { x: 480, y: 400, w: 40, h: 20 }
    expect(freeExitSpot({ x: 500, y: 400 }, [front], BOUNDS)).toEqual({ x: 500, y: 386 })
    const back = { x: 480, y: 380, w: 40, h: 10 }
    expect(freeExitSpot({ x: 500, y: 400 }, [front, back], BOUNDS)).toEqual({ x: 460, y: 398 })
  })

  it('sin hueco libre no se puede bajar', () => {
    const wall = { x: 0, y: 0, w: 1000, h: 800 }
    expect(freeExitSpot({ x: 500, y: 400 }, [wall], BOUNDS)).toBeNull()
  })

  it('no baja fuera del mapa', () => {
    const spot = freeExitSpot({ x: 500, y: 795 }, [], BOUNDS)
    expect(spot.y).toBeLessThanOrEqual(BOUNDS.h)
  })
})
