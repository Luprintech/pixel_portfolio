import { beforeEach, describe, expect, it, vi } from 'vitest'

// La captura "ya cargada" o "aún sin cargar", según el caso, sin red ni navegador de verdad.
const art = vi.hoisted(() => ({ image: null, listeners: [] }))
vi.mock('./furniture/tvScreens.js', async (original) => ({
  ...(await original()),
  tvArtImage: () => art.image,
  onTvArtLoaded: (listener) => art.listeners.push(listener),
}))

const { attachTvArt } = await import('./tvArt.js')
const piece = { kind: 'tvUnit', x: 338, y: 80 }

function fakeScene() {
  const texture = { setFilter: vi.fn() }
  const images = []
  const scene = {
    sys: { settings: { status: 4 } },
    textures: { exists: vi.fn(() => false), addCanvas: vi.fn(() => texture) },
    add: {
      image: vi.fn((x, y, key) => {
        const image = { x, y, key, visible: true, setDisplaySize: vi.fn(() => image), setDepth: vi.fn(() => image), setVisible: vi.fn((v) => ((image.visible = v), image)) }
        images.push(image)
        return image
      }),
    },
  }
  return { scene, texture, images }
}
const fakeSwitch = () => {
  const api = { mode: 'off', set: vi.fn((next) => { api.mode = next }) }
  return api
}

describe('captura de YouTube sobre la tele', () => {
  beforeEach(() => {
    art.image = null
    art.listeners.length = 0
    HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} })
  })

  it('se pone justo sobre la pantalla de la tele, ajustada a su hueco, y solo se ve con el canal de YouTube', () => {
    art.image = { naturalWidth: 1255 }
    const { scene, images, texture } = fakeScene()
    const tv = fakeSwitch()
    attachTvArt(scene, tv, piece)
    const [image] = images
    // La tele mide 72×48 con la base en (338, 80): su pantalla (16, 5, 40×22) está centrada en (338, 48).
    expect([image.x, image.y]).toEqual([338, 48])
    expect(image.setDisplaySize).toHaveBeenCalledWith(40, 22)
    expect(texture.setFilter).toHaveBeenCalled()
    expect(image.visible).toBe(false)
    tv.set('youtube')
    expect(image.visible).toBe(true)
    tv.set('netflix')
    expect(image.visible).toBe(false)
    tv.set('off')
    expect(image.visible).toBe(false)
  })

  it('si la captura aún no ha cargado, espera y la pone al cargar, respetando el canal actual', () => {
    const { scene, images } = fakeScene()
    const tv = fakeSwitch()
    attachTvArt(scene, tv, piece)
    expect(images).toHaveLength(0)
    tv.set('youtube')
    art.image = { naturalWidth: 1255 }
    art.listeners.forEach((listener) => listener())
    expect(images).toHaveLength(1)
    expect(images[0].visible).toBe(true)
  })

  it('no hace nada en una escena ya cerrada ni sin tele', () => {
    art.image = { naturalWidth: 1255 }
    const closed = fakeScene()
    closed.scene.sys.settings.status = 8
    attachTvArt(closed.scene, fakeSwitch(), piece)
    expect(closed.images).toHaveLength(0)
    expect(() => attachTvArt(fakeScene().scene, undefined, piece)).not.toThrow()
  })
})
