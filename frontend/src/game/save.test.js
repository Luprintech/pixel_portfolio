import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, isValidLook, LOOK_SECTIONS, randomLook, switchBody, upgradeLook } from './look'
import { clearSave, loadSave, NAME_MAX, sanitizeName, SAVE_VERSION, writeSave } from './save'

describe('look', () => {
  it('el aspecto por defecto y el aleatorio son válidos', () => {
    expect(isValidLook(DEFAULT_LOOK)).toBe(true)
    for (let i = 0; i < 20; i++) expect(isValidLook(randomLook())).toBe(true)
  })

  it('completa con estilos por defecto un aspecto de solo cuatro colores', () => {
    const old = { hair: '#1c1b3a', skin: '#a8714f', dress: '#7a3f8f', trim: '#cfd6e6' }
    expect(upgradeLook(old)).toEqual({ ...DEFAULT_LOOK, hair: old.hair, skin: old.skin, topColor: old.dress, trim: old.trim })
  })

  it('traduce la ropa guardada antes de separar prenda de arriba, de abajo y calzado', () => {
    const old = { hair: '#1c1b3a', skin: '#a8714f', dress: '#7a3f8f', trim: '#cfd6e6', pants: '#5a3a28' }
    expect(upgradeLook({ ...old, outfit: 'falda', hairStyle: 'recogido' })).toMatchObject({
      top: 'camiseta',
      bottom: 'falda',
      topColor: '#7a3f8f',
      bottomColor: '#5a3a28',
      hairStyle: 'rodete',
    })
    expect(upgradeLook({ ...old, outfit: 'mono' })).toMatchObject({ top: 'peto', bottom: 'pantalon' })
  })

  it('cambiar de avatar cambia peinado y prenda solo si seguían siendo los de partida', () => {
    const man = switchBody(DEFAULT_LOOK, 'hombre')
    expect(man).toMatchObject({ body: 'hombre', hairStyle: 'pixie', top: 'camiseta' })
    const custom = switchBody({ ...DEFAULT_LOOK, hairStyle: 'rizado', top: 'peto' }, 'hombre')
    expect(custom).toMatchObject({ hairStyle: 'rizado', top: 'peto' })
    expect(switchBody(man, 'mujer')).toEqual({ ...DEFAULT_LOOK, body: 'mujer' })
  })

  it('el color del vello y el pantalón solo aparecen cuando tienen sentido', () => {
    const fields = LOOK_SECTIONS.flatMap((section) => section.fields)
    const visible = (look) => fields.filter((f) => !f.when || f.when(look)).map((f) => f.key)
    expect(visible(DEFAULT_LOOK)).not.toContain('beardColor')
    expect(visible(DEFAULT_LOOK)).not.toContain('bottom')
    expect(visible({ ...DEFAULT_LOOK, beard: 'barba', top: 'camiseta' })).toEqual(expect.arrayContaining(['beardColor', 'bottom', 'bottomColor']))
    expect(visible({ ...DEFAULT_LOOK, hairStyle: 'calvo' })).not.toContain('hair')
  })

  it('rechaza colores o estilos fuera de la lista', () => {
    expect(upgradeLook({ ...DEFAULT_LOOK, hair: '#123456' })).toBeNull()
    expect(upgradeLook({ ...DEFAULT_LOOK, top: 'armadura' })).toBeNull()
    expect(upgradeLook(null)).toBeNull()
  })
})

describe('sanitizeName', () => {
  it('quita símbolos y espacios sobrantes', () => {
    expect(sanitizeName('  Lupe   <b>Cano</b> ')).toBe('Lupe bCanob')
    expect(sanitizeName("Nuria-Ñu d'Or")).toBe("Nuria-Ñu d'Or")
  })

  it('corta al límite y no deja espacios al final', () => {
    const name = sanitizeName('a'.repeat(NAME_MAX - 1) + ' bbbb')
    expect(name.length).toBeLessThanOrEqual(NAME_MAX)
    expect(name).toBe(name.trim())
  })

  it('tolera valores que no son texto', () => {
    expect(sanitizeName(undefined)).toBe('')
    expect(sanitizeName(42)).toBe('42')
  })
})

describe('partida guardada', () => {
  beforeEach(() => localStorage.clear())

  it('sin nada guardado no hay partida', () => {
    expect(loadSave()).toBeNull()
  })

  it('guarda y recupera nombre y aspecto con versión', () => {
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK })
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK })
  })

  it('migra el aspecto antiguo y lo reescribe al guardar', () => {
    const old = { hair: '#1c1b3a', skin: '#a8714f', dress: '#7a3f8f', trim: '#cfd6e6' }
    const upgraded = upgradeLook(old)
    localStorage.setItem('valle-del-bucle:look', JSON.stringify(old))
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: '', look: upgraded })
    writeSave({ name: 'Lupe', look: upgraded })
    expect(localStorage.getItem('valle-del-bucle:look')).toBeNull()
  })

  it('ignora una partida dañada o de otra versión', () => {
    localStorage.setItem('valle-del-bucle:save', '{no es json')
    expect(loadSave()).toBeNull()
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: 99, name: 'X', look: DEFAULT_LOOK }))
    expect(loadSave()).toBeNull()
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: SAVE_VERSION, name: 'X', look: { ...DEFAULT_LOOK, hair: '#000' } }))
    expect(loadSave()).toBeNull()
  })

  it('borrar elimina también el formato antiguo', () => {
    localStorage.setItem('valle-del-bucle:look', JSON.stringify(DEFAULT_LOOK))
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK })
    clearSave()
    expect(loadSave()).toBeNull()
  })
})
