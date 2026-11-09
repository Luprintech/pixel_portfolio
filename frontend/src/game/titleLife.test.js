import { describe, expect, it } from 'vitest'
import { COPY } from '../lib/valleCopy.js'
import { CAT_HOME, CAT_MAX_Y, CAT_MIN_Y, CAT_NEAR } from './titleCat.js'
import { INTRO_MS, LOOP_MS, ambientKey, eventsBetween, lifeAt, playKind } from './titleLife.js'

const CLEAR = { storm: 0, rain: 0, rainbow: 0, dark: 0, phase: 0.5, autumn: 0 }
const AUTUMN = { ...CLEAR, rain: 0.65, autumn: 1 }
const NIGHT = { ...CLEAR, dark: 1, phase: 0.05 }
const skyOf = (sky) => () => sky

// Recorre un bucle entero y devuelve todas las posiciones de la gata.
const loopOf = (sky, step = 100) => {
  const frames = []
  for (let ms = INTRO_MS; ms < INTRO_MS + LOOP_MS; ms += step) frames.push(lifeAt(ms, skyOf(sky)))
  return frames
}

describe('titleLife', () => {
  it('Lupe saluda con la mano al principio y luego se queda quieta', () => {
    expect(lifeAt(500, skyOf(CLEAR)).pose).toBe('idle')
    expect(lifeAt(1500, skyOf(CLEAR))).toMatchObject({ pose: 'wave', say: { key: 'hello', who: 'lupe' } })
    expect(lifeAt(6000, skyOf(CLEAR)).pose).toBe('idle')
  })

  it('la bienvenida sigue el orden: saludo, presentación, cómo empezar y modo clásico', () => {
    const keys = []
    for (let ms = 0; ms < INTRO_MS; ms += 100) {
      const say = lifeAt(ms, skyOf(CLEAR)).say
      if (say && keys[keys.length - 1] !== say.key) keys.push(say.key)
    }
    expect(keys).toEqual(['hello', 'welcome', 'journey', 'classic'])
  })

  it('la bienvenida solo se cuenta una vez; después empieza el bucle', () => {
    const intro = new Set()
    for (let ms = INTRO_MS; ms < INTRO_MS + LOOP_MS * 3; ms += 200) {
      const say = lifeAt(ms, skyOf(CLEAR)).say
      if (say) intro.add(say.key)
    }
    ;['hello', 'welcome', 'journey', 'classic'].forEach((key) => expect(intro.has(key)).toBe(false))
    expect(intro.has('meetCat')).toBe(true)
  })

  it('Khalessi pasea, se acerca a Lupe, la acompaña y vuelve a su sitio', () => {
    const cats = loopOf(CLEAR).map((life) => life.cat)
    expect([cats[0].x, cats[0].y]).toEqual(CAT_HOME)
    expect(cats.some((cat) => cat.walking && cat.facing === -1)).toBe(true)
    expect(cats.some((cat) => cat.x === CAT_NEAR[0] && cat.y === CAT_NEAR[1] && !cat.walking)).toBe(true)
    expect(cats.some((cat) => cat.walking && cat.facing === 1)).toBe(true)
  })

  it('Khalessi usa la profundidad del prado, no solo de izquierda a derecha', () => {
    const ys = loopOf(CLEAR, 50).map((life) => life.cat.y)
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(20)
    ys.forEach((y) => {
      expect(y).toBeGreaterThanOrEqual(CAT_MIN_Y - 1)
      expect(y).toBeLessThanOrEqual(CAT_MAX_Y + 1)
    })
  })

  it('sus movimientos son continuos: nunca se teletransporta', () => {
    ;[CLEAR, AUTUMN, NIGHT].forEach((sky) => {
      let previous = null
      loopOf(sky, 50).forEach(({ cat }) => {
        // A 16 px/s, en 50 ms son 0,8 px; con margen para los saltos y la entrada a un juego.
        if (previous) expect(Math.hypot(cat.x - previous.x, cat.y - previous.y)).toBeLessThan(4)
        previous = cat
      })
    })
  })

  it('de vez en cuando Khalessi se sienta y se asea, siempre lejos de Lupe', () => {
    const poses = new Set()
    loopOf(NIGHT).forEach(({ cat }) => {
      if (cat.sit) {
        poses.add(cat.sit)
        expect([cat.x, cat.y]).toEqual(CAT_HOME)
        expect(cat.walking).toBe(false)
      }
    })
    expect([...poses].sort()).toEqual(['sit', 'wash'])
  })

  it('el juego depende del cielo: mariposas en primavera, avellanas en otoño y aseo si no hay nada', () => {
    expect(playKind(CLEAR)).toBe('butterflies')
    expect(playKind(AUTUMN)).toBe('nuts')
    expect(playKind(NIGHT)).toBe('groom')
  })

  it('persiguiendo mariposas salta y se mueve por el prado', () => {
    const cats = loopOf(CLEAR, 50).map((life) => life.cat)
    expect(cats.some((cat) => cat.lift > 4)).toBe(true)
    const xs = cats.map((cat) => cat.x)
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(30)
  })

  it('en otoño empuja una avellana, que sale de su sitio y acaba donde empezó', () => {
    const lives = loopOf(AUTUMN, 50)
    const moving = lives.map((life) => life.nuts[0])
    const start = moving[0]
    expect(moving.some(([x, y]) => Math.hypot(x - start[0], y - start[1]) > 10)).toBe(true)
    expect(moving[moving.length - 1]).toEqual(start)
    // Al rodar bota: se levanta del suelo y vuelve a posarse.
    const heights = moving.map(([, , lift]) => lift)
    expect(Math.max(...heights)).toBeGreaterThan(2)
    expect(Math.min(...heights)).toBe(0)
    expect(heights.every((h) => h >= 0 && h <= 5)).toBe(true)
    // Las otras avellanas no se tocan, y las tres están siempre en el suelo del prado.
    lives.forEach((life) => {
      expect(life.nuts).toHaveLength(3)
      expect(life.nuts[1]).toEqual(lives[0].nuts[1])
      life.nuts.forEach(([, y]) => {
        expect(y).toBeGreaterThan(CAT_MIN_Y + 10)
        expect(y).toBeLessThan(180)
      })
    })
  })

  it('la gata golpea la avellana desde su lado: mirando hacia ella y a su altura', () => {
    let hits = 0
    loopOf(AUTUMN, 20).forEach(({ cat, nuts }) => {
      if (cat.lift > 1) {
        hits += 1
        const [nx, ny] = nuts[0]
        expect(Math.abs(cat.y + 13 - ny)).toBeLessThan(10)
        expect(Math.abs(cat.x + 13 - nx)).toBeLessThan(40)
      }
    })
    expect(hits).toBeGreaterThan(0)
  })

  it('Lupe acaricia a la gata solo cuando está a su lado, y la gata maúlla', () => {
    for (let ms = INTRO_MS; ms < INTRO_MS + LOOP_MS; ms += 100) {
      const life = lifeAt(ms, skyOf(CLEAR))
      if (life.pose === 'pet') expect([life.cat.x, life.cat.y]).toEqual(CAT_NEAR)
      if (life.say?.who === 'khalessi') expect(life.say.key).toBe('meow')
    }
  })

  it('el maullido suena una vez por vuelta, en el instante justo', () => {
    expect(eventsBetween(0, INTRO_MS)).toEqual([])
    expect(eventsBetween(INTRO_MS, INTRO_MS + LOOP_MS * 3)).toEqual(['meow', 'meow', 'meow'])
    let meowAt = 0
    for (let ms = INTRO_MS; !meowAt && ms < INTRO_MS + LOOP_MS; ms++) if (eventsBetween(ms - 1, ms).length) meowAt = ms
    expect(eventsBetween(meowAt - 1, meowAt)).toEqual(['meow'])
    expect(eventsBetween(meowAt, meowAt + 100)).toEqual([])
  })

  it('el comentario del tiempo se ajusta al cielo', () => {
    expect(ambientKey({ ...CLEAR, storm: 1, rain: 1 })).toBe('ambientStorm')
    expect(ambientKey({ ...CLEAR, rain: 0.65 })).toBe('ambientRain')
    expect(ambientKey({ ...CLEAR, rainbow: 0.9 })).toBe('ambientRainbow')
    expect(ambientKey({ ...CLEAR, dark: 1, phase: 0.05 })).toBe('ambientNight')
    expect(ambientKey({ ...CLEAR, dark: 0.45, phase: 0.24 })).toBe('ambientDawn')
    expect(ambientKey(CLEAR)).toBe('ambientDay')
  })

  it('los consejos rotan entre vueltas', () => {
    const tips = new Set()
    for (let lap = 0; lap < 3; lap++) {
      for (let ms = 0; ms < LOOP_MS; ms += 100) {
        const say = lifeAt(INTRO_MS + lap * LOOP_MS + ms, skyOf(CLEAR)).say
        if (say?.key.startsWith('tip')) tips.add(say.key)
      }
    }
    expect(tips.size).toBe(3)
  })
})

describe('textos de la portada', () => {
  const KEYS = [
    'hello', 'welcome', 'journeyNew', 'journeyBack', 'classic', 'notice', 'meetCat', 'petting', 'meow', 'catLoves',
    'tipRelax', 'tipOptions', 'tipCustomize',
    'ambientDawn', 'ambientDay', 'ambientNight', 'ambientRain', 'ambientStorm', 'ambientRainbow',
  ]

  it('cada frase del guion tiene su texto en español y en inglés', () => {
    ;['es', 'en'].forEach((lang) => KEYS.forEach((key) => expect(COPY[lang].lupe[key], `${lang}.${key}`).toBeTruthy()))
  })

  it('todas las frases que emite el guion existen en el texto', () => {
    const said = new Set()
    const skies = [CLEAR, { ...CLEAR, rain: 1, storm: 1 }, { ...CLEAR, dark: 1, phase: 0.05 }, { ...CLEAR, rainbow: 1 }, { ...CLEAR, dark: 0.45, phase: 0.24 }]
    skies.forEach((sky) => {
      for (let ms = 0; ms < INTRO_MS + LOOP_MS * 3; ms += 100) {
        const say = lifeAt(ms, skyOf(sky)).say
        if (say) said.add(say.key === 'journey' ? 'journeyNew' : say.key)
      }
    })
    said.forEach((key) => expect(COPY.es.lupe[key], key).toBeTruthy())
  })
})
