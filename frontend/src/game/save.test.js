import { beforeEach, describe, expect, it } from 'vitest'
import { colorName, DEFAULT_LOOK, defaultLook, isValidLook, LOOK_LABELS, LOOK_SECTIONS, LOOK_TABS, randomLook, selectBody, upgradeLook, visibleBlocks } from './look'
import { DEFAULT_PET } from './pet'
import { initialStory } from './story/story'
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

  it('cada avatar conserva su propio aspecto al alternar', () => {
    expect(defaultLook('hombre')).toMatchObject({ body: 'hombre', hairStyle: 'cortoClasico', top: 'camiseta' })
    expect(defaultLook('mujer')).toEqual(DEFAULT_LOOK)
    const woman = { ...DEFAULT_LOOK, hairStyle: 'rizado', skin: '#7a4f35' }
    // Un avatar sin tocar arranca con su aspecto de partida, sin heredar lo del otro.
    expect(selectBody({ mujer: woman }, 'hombre')).toEqual(defaultLook('hombre'))
    // Volver a uno ya editado recupera sus cambios.
    expect(selectBody({ mujer: woman, hombre: defaultLook('hombre') }, 'mujer')).toBe(woman)
  })

  it('el color del vello y el pantalón solo aparecen cuando tienen sentido', () => {
    // Todo lo que se enseña de un aspecto: los campos de estilo y, debajo de cada uno, sus colores.
    const visible = (look) => LOOK_SECTIONS.flatMap((section) => visibleBlocks(section, look)).flatMap((block) => [block.key, ...block.colors])
    expect(visible(DEFAULT_LOOK)).not.toContain('beardColor')
    expect(visible(DEFAULT_LOOK)).not.toContain('bottom')
    expect(visible({ ...DEFAULT_LOOK, trait: 'barba', top: 'camiseta' })).toEqual(expect.arrayContaining(['beardColor', 'bottom', 'bottomColor']))
    expect(visible({ ...DEFAULT_LOOK, hairStyle: 'calvo' })).not.toContain('hair')
    // Con peto no hay prenda de abajo, pero su color sigue pudiéndose elegir.
    expect(visible({ ...DEFAULT_LOOK, top: 'peto' })).toEqual(expect.arrayContaining(['bottomColor']))
    expect(visible({ ...DEFAULT_LOOK, top: 'peto' })).not.toContain('bottom')
  })

  it('las partidas de antes de las láminas de referencia pasan a los estilos nuevos', () => {
    const { trait: _trait, ...rest } = DEFAULT_LOOK
    const old = { ...rest, beard: 'bigote', face: 'timida', accessory: 'flor', shoes: 'botas' }
    expect(upgradeLook(old)).toMatchObject({ trait: 'bigote', face: 'verguenza', accessory: 'horquillas', shoes: 'botines' })
    expect(upgradeLook({ ...rest, beard: 'ninguna' })).toMatchObject({ trait: 'ninguno' })
  })

  it('cada apartado del creador está en una pestaña y todos los campos tienen etiqueta', () => {
    LOOK_SECTIONS.forEach((section) => expect(LOOK_TABS, section.id).toContain(section.tab))
    expect(LOOK_TABS).toEqual(['body', 'clothes', 'pet'])
    LOOK_SECTIONS.flatMap((section) => section.fields).forEach(({ key, colors = [] }) => [key, ...colors.map((color) => color.key)].forEach((name) => expect(LOOK_LABELS.es[name], name).toBeTruthy()))
  })

  it('acepta cualquier color #rrggbb elegido con el selector personalizado', () => {
    const custom = { ...DEFAULT_LOOK, hair: '#123456', skin: '#ABCDEF', topColor: '#00ff7f' }
    expect(isValidLook(custom)).toBe(true)
    expect(upgradeLook(custom)).toMatchObject({ hair: '#123456', topColor: '#00ff7f' })
    expect(colorName('es', 'hair', '#123456')).toBe('Personalizado #123456')
    expect(colorName('es', 'hair', '#b8527a')).toBe('Rosa')
  })

  it('rechaza colores mal formados y estilos fuera de la lista', () => {
    ;['rojo', '#12345', '#gggggg', 'url(x)', 123456].forEach((hair) => expect(upgradeLook({ ...DEFAULT_LOOK, hair })).toBeNull())
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
    const pet = { kind: 'perro', breed: 'husky', coat: '#8c93a6', marks: '#f4efe3' }
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK, pet, petName: 'Nube' })
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK, pet, petName: 'Nube', story: initialStory() })
  })

  it('el nombre de la mascota se limpia como el de la viajera y no existe sin mascota', () => {
    const pet = { kind: 'gato', breed: 'persa', coat: '#c9cbd6', marks: '#f4efe3' }
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK, pet, petName: '  <b>Mi   gata</b> con un nombre larguísimo ' })
    expect(loadSave().petName).toBe('bMi gatab con un')
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK, pet: DEFAULT_PET, petName: 'Nube' })
    expect(loadSave().petName).toBe('')
  })

  it('una partida de la versión 2 se lee con la mascota y sin nombre para ella', () => {
    const pet = { kind: 'perro', breed: 'husky', coat: '#8c93a6', marks: '#f4efe3' }
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: 2, name: 'Lupe', look: DEFAULT_LOOK, pet }))
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK, pet, petName: '', story: initialStory() })
  })

  it('una partida de la versión 1 se lee sin mascota', () => {
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: 1, name: 'Lupe', look: DEFAULT_LOOK }))
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK, pet: DEFAULT_PET, petName: '', story: initialStory() })
  })

  it('una partida de la versión 4 se lee con la bienvenida de Lupe pendiente', () => {
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: 4, name: 'Lupe', look: DEFAULT_LOOK, pet: DEFAULT_PET }))
    expect(loadSave().story).toEqual(initialStory())
  })

  it('guarda la historia y la recupera; una visita en curso vuelve como pendiente', () => {
    const story = { welcome: 'done', tour: 'accepted', heard: ['inicio.bienvenida'], explained: ['dedicas'] }
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK, story })
    expect(loadSave().story).toEqual({ ...story, tour: 'pending' })
    writeSave({ name: 'Lupe', look: DEFAULT_LOOK, story: { ...story, tour: 'completed' } })
    expect(loadSave().story.tour).toBe('completed')
  })

  it('una historia dañada no tira la partida', () => {
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK, story: { welcome: 'x', tour: 7, heard: 'no' } }))
    expect(loadSave().story).toEqual(initialStory())
  })

  it('una mascota dañada no tira la partida', () => {
    localStorage.setItem('valle-del-bucle:save', JSON.stringify({ version: SAVE_VERSION, name: 'Lupe', look: DEFAULT_LOOK, pet: { kind: 'dragon', breed: 'x' } }))
    expect(loadSave().pet).toEqual(DEFAULT_PET)
  })

  it('migra el aspecto antiguo y lo reescribe al guardar', () => {
    const old = { hair: '#1c1b3a', skin: '#a8714f', dress: '#7a3f8f', trim: '#cfd6e6' }
    const upgraded = upgradeLook(old)
    localStorage.setItem('valle-del-bucle:look', JSON.stringify(old))
    expect(loadSave()).toEqual({ version: SAVE_VERSION, name: '', look: upgraded, pet: DEFAULT_PET, petName: '', story: initialStory() })
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
