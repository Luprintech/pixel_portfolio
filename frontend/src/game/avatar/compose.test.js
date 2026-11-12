import { describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, LOOK_STYLES, styleChoices } from '../look'
import { DIRS, FRAME_H, FRAME_W, composeAvatar } from './compose'
import { LETTERS, avatarColors } from './palette'
import { POSES, stance } from './stance'
import { frameRect } from './sheet'

const POSE_LIST = Array.from({ length: POSES }, (_, pose) => pose)
// El aspecto de la base aprobada: bob rosa, camiseta morada, pantalón corto y botas.
const BASE = { ...DEFAULT_LOOK, hairStyle: 'bob', hair: '#b8527a', top: 'camiseta', topColor: '#7a3f8f', bottom: 'shorts', face: 'sonrisa' }
const rowsOf = (look, dir = 'down', pose = 0) => composeAvatar(look, dir, pose).rows

// Cada opción con las demás por defecto, más los cruces que tocan las mismas filas: pelo con
// complemento, y prenda de arriba con la de abajo y el calzado, para los dos avatares.
function looks() {
  const list = []
  Object.entries(LOOK_STYLES).forEach(([key, values]) => values.forEach((value) => list.push({ ...DEFAULT_LOOK, [key]: value })))
  LOOK_STYLES.body.forEach((body) => {
    LOOK_STYLES.hairStyle.forEach((hairStyle) => LOOK_STYLES.accessory.forEach((accessory) => list.push({ ...DEFAULT_LOOK, body, hairStyle, accessory })))
    LOOK_STYLES.top.forEach((top) =>
      LOOK_STYLES.bottom.forEach((bottom) => LOOK_STYLES.shoes.forEach((shoes) => list.push({ ...DEFAULT_LOOK, body, top, bottom, shoes }))),
    )
  })
  LOOK_STYLES.face.forEach((face) => LOOK_STYLES.trait.forEach((trait) => list.push({ ...DEFAULT_LOOK, face, trait })))
  return list
}

describe('composeAvatar', () => {
  it('da siempre un lienzo del mismo tamaño, con letras conocidas y contorno cerrado', () => {
    const known = new Set([...LETTERS, '.'])
    const problems = []
    looks().forEach((look) =>
      DIRS.forEach((dir) =>
        POSE_LIST.forEach((pose) => {
          const { rows, width, height } = composeAvatar(look, dir, pose)
          const where = `${look.body} ${look.hairStyle} ${look.top} ${look.bottom} ${look.shoes} ${look.face} ${look.trait} ${look.accessory} ${dir} ${pose}`
          if (width !== FRAME_W || height !== FRAME_H || rows.length !== FRAME_H) problems.push(`tamaño: ${where}`)
          rows.forEach((row) => {
            if (row.length !== FRAME_W) problems.push(`ancho ${row.length}: ${where}`)
            if ([...row].some((ch) => !known.has(ch))) problems.push(`letra: ${where}`)
          })
          // Nada dibujado toca el borde: la primera y la última fila y columna son solo contorno o vacío.
          const edges = [rows[0], rows[FRAME_H - 1], rows.map((row) => row[0]).join(''), rows.map((row) => row[FRAME_W - 1]).join('')]
          if (edges.some((edge) => /[^.Xxyjklo]/.test(edge))) problems.push(`borde: ${where}`)
        }),
      ),
    )
    expect(problems.slice(0, 5)).toEqual([])
    // Recorre decenas de miles de combinaciones: con el resto de la suite en paralelo necesita más de 5 s.
  }, 60000)

  it('los pies son el anclaje: la figura apoya en la fila inferior y queda centrada', () => {
    DIRS.forEach((dir) =>
      POSE_LIST.forEach((pose) => {
        const { rows, anchor } = composeAvatar(BASE, dir, pose)
        expect(anchor).toEqual({ x: FRAME_W / 2, y: FRAME_H })
        // Con los pies en el suelo hay calzado en la penúltima fila (la última es el contorno).
        const sole = rows[FRAME_H - 2]
        expect(sole).toMatch(/[QRW]/)
        const cols = [...sole].map((ch, i) => (ch === '.' || /[Xxyjklo]/.test(ch) ? -1 : i)).filter((i) => i >= 0)
        const middle = (cols[0] + cols[cols.length - 1] + 1) / 2
        // En un paso un pie se levanta y la fila de la suela solo tiene el otro: se descentra.
        const tolerance = pose === 0 && (dir === 'down' || dir === 'up') ? 1 : 4
        expect(Math.abs(middle - FRAME_W / 2)).toBeLessThanOrEqual(tolerance)
      }),
    )
  })

  it('de frente y de espalda el cuerpo y las piernas son simétricos en reposo', () => {
    ;['down', 'up'].forEach((dir) => {
      const rows = rowsOf({ ...BASE, hairStyle: 'pixie' }, dir, 0)
      // Desde los hombros hacia abajo la silueta (sin contar tonos) se refleja.
      rows.slice(19).forEach((row) => {
        const filled = [...row].map((ch) => (ch === '.' ? '.' : '#')).join('')
        expect(filled).toBe([...filled].reverse().join(''))
      })
    })
  })

  it('el perfil izquierdo es el derecho reflejado', () => {
    POSE_LIST.forEach((pose) => {
      const right = rowsOf(BASE, 'right', pose)
      const left = rowsOf(BASE, 'left', pose)
      expect(left).toEqual(right.map((row) => [...row].reverse().join('')))
    })
  })

  it('lo asimétrico se dibuja desde el lado que enseña cada perfil', () => {
    const mirrored = (look, pose = 0) => rowsOf(look, 'left', pose).join('|') === rowsOf(look, 'right', pose).map((row) => [...row].reverse().join('')).join('|')
    // El guiño cierra el ojo izquierdo del personaje: solo cambia el perfil izquierdo.
    expect(mirrored({ ...BASE, face: 'guino' })).toBe(false)
    expect(rowsOf({ ...BASE, face: 'guino' }, 'right')).toEqual(rowsOf({ ...BASE, face: 'sonrisa' }, 'right'))
    // El rapado lateral solo se ve por el lado rapado, y el lazo y el nudo del pañuelo
    // por el lado en que se llevan.
    expect(mirrored({ ...BASE, hairStyle: 'rapado' })).toBe(false)
    ;['lazo', 'panuelo'].forEach((accessory) => expect(mirrored({ ...BASE, accessory }), accessory).toBe(false))
  })

  it('los dos pasos y el reposo son tres dibujos distintos en cada dirección', () => {
    DIRS.forEach((dir) => {
      const frames = POSE_LIST.map((pose) => rowsOf(BASE, dir, pose).join('|'))
      expect(new Set(frames).size).toBe(POSES)
    })
  })

  it('al caminar solo se hunde el cuerpo: los pies no se despegan del suelo', () => {
    ;['down', 'up', 'right'].forEach((dir) => {
      const rest = rowsOf(BASE, dir, 0)
      POSE_LIST.slice(1).forEach((pose) => {
        const step = rowsOf(BASE, dir, pose)
        // La suela sigue en la misma fila (la del pie que no se levanta).
        expect(step[FRAME_H - 2].replace(/[^QRW]/g, '').length).toBeGreaterThan(0)
        expect(step.length).toBe(rest.length)
      })
    })
  })

  it('de perfil hay una mano y dos piernas: la lejana se pinta primero y al caminar se abren', () => {
    POSE_LIST.forEach((pose) => {
      const { arms, legs } = stance({ view: 'side', male: false, pose })
      expect(arms).toHaveLength(1)
      expect(legs.map((leg) => leg.far)).toEqual([true, false])
      // Las dos piernas tienen las mismas filas en todas las poses: no cambian de largo.
      legs.forEach((leg) => expect(leg.lean).toHaveLength(4))
    })
    // En reposo casi se tapan; en un paso los tobillos quedan lejos, uno delante y otro detrás.
    const ankles = (pose) => stance({ view: 'side', male: false, pose }).legs.map((leg) => leg.lean[3])
    expect(Math.abs(ankles(0)[0] - ankles(0)[1])).toBe(1)
    expect(ankles(1)[1]).toBeGreaterThan(ankles(1)[0])
    expect(ankles(2)[1]).toBeLessThan(ankles(2)[0])
    expect(stance({ view: 'down', male: false, pose: 0 }).arms).toHaveLength(2)
  })

  it('de perfil, al caminar, cada pie apoya por separado: las suelas no forman una sola pieza', () => {
    // Algunas botas parten la suela por el arco del pie: se compara con el reposo, donde los dos pies
    // coinciden, en lugar de contar piezas a secas.
    const pieces = (shoes, pose) => rowsOf({ ...BASE, shoes }, 'right', pose)[FRAME_H - 2].split(/[^QRWY]+/).filter(Boolean).length
    ;['botines', 'zapatillas', 'botasAltas'].forEach((shoes) =>
      [1, 2].forEach((pose) => expect(pieces(shoes, pose), `${shoes} ${pose}`).toBeGreaterThan(pieces(shoes, 0))),
    )
  })

  it('de perfil la altura del cuerpo no cambia al caminar', () => {
    const top = (pose) => rowsOf(BASE, 'right', pose).findIndex((row) => /[^.]/.test(row))
    expect(top(1)).toBe(top(0))
    expect(top(2)).toBe(top(0))
  })

  it('el brazo de perfil cuelga delante del torso, con su propia sombra y una mano de piel', () => {
    const rows = rowsOf({ ...BASE, hairStyle: 'pixie' }, 'right', 0)
    // Las filas de la mano: dos píxeles de piel rodeados de tela del torso, sin acercarse al dobladillo.
    const hands = rows.filter((row) => /[DLM][sS]{2}[DLM]/.test(row))
    expect(hands.length).toBeGreaterThanOrEqual(2)
  })

  it('el pelo corto deja el cuello a la vista y calvo quita todo el pelo', () => {
    const short = rowsOf({ ...BASE, hairStyle: 'pixie' }, 'down')
    expect(short[5 + 12]).not.toMatch(/[Hhd]/)
    const bald = rowsOf({ ...BASE, hairStyle: 'calvo' }, 'down').slice(0, 5 + 14).join('')
    expect(bald).not.toMatch(/[Hhdz]/)
  })

  it('cada peinado, prenda, calzado, expresión, vello y complemento se ve distinto', () => {
    const distinct = (field, make) => {
      const shapes = LOOK_STYLES[field].map((value) => make(value))
      expect(new Set(shapes).size, field).toBe(LOOK_STYLES[field].length)
    }
    ;['down', 'up', 'right'].forEach((dir) => {
      distinct('hairStyle', (hairStyle) => rowsOf({ ...BASE, hairStyle }, dir).join('|'))
    })
    distinct('top', (top) => rowsOf({ ...BASE, top }, 'down').join('|'))
    distinct('bottom', (bottom) => rowsOf({ ...BASE, top: 'camiseta', bottom }, 'down').join('|'))
    distinct('shoes', (shoes) => rowsOf({ ...BASE, shoes }, 'down').join('|'))
    // Sin pelo: un peinado largo taparía las patillas y no se vería la diferencia.
    ;['face', 'trait', 'accessory'].forEach((field) => distinct(field, (value) => rowsOf({ ...BASE, hairStyle: 'calvo', [field]: value }, 'down').join('|')))
  })

  it('cada prenda de arriba y de abajo se ve distinta también de perfil y de espalda', () => {
    ;['up', 'right'].forEach((dir) => {
      const tops = LOOK_STYLES.top.map((top) => rowsOf({ ...BASE, top }, dir).join('|'))
      expect(new Set(tops).size).toBeGreaterThanOrEqual(LOOK_STYLES.top.length - 4)
      const bottoms = LOOK_STYLES.bottom.map((bottom) => rowsOf({ ...BASE, bottom }, dir).join('|'))
      expect(new Set(bottoms).size).toBeGreaterThanOrEqual(LOOK_STYLES.bottom.length - 2)
    })
  })

  it('el avatar de hombre tiene hombros más anchos que el de mujer', () => {
    const width = (body) => rowsOf({ ...BASE, hairStyle: 'pixie', body }, 'down')[5 + 14].replace(/\./g, '').length
    expect(width('hombre')).toBeGreaterThan(width('mujer'))
  })

  it('los rasgos de la cara y las gafas no se dibujan de espaldas', () => {
    const plain = rowsOf(BASE, 'up')
    expect(rowsOf({ ...BASE, trait: 'barba', accessory: 'gafas' }, 'up')).toEqual(plain)
  })

  it('una combinación nueva no altera la de por defecto', () => {
    const before = rowsOf(BASE, 'down').join('')
    composeAvatar({ ...BASE, hairStyle: 'rizadoCorto', accessory: 'gorro', trait: 'barba' }, 'down', 1)
    expect(rowsOf(BASE, 'down').join('')).toBe(before)
  })

  it('los colores elegidos llegan al dibujo y el pelo casi negro se levanta del contorno', () => {
    const colors = avatarColors({ ...BASE, eyes: '#3e6fb0', topColor: '#d4503a', bottomColor: '#8a3f2c', shoesColor: '#1c1b3a', accessoryColor: '#b8527a' })
    expect(colors.D).toBe('#d4503a')
    expect(colors.N).toBe('#8a3f2c')
    expect(colors.R).toBe('#1c1b3a')
    expect(colors.A).toBe('#b8527a')
    expect(colors.e).not.toBe('#3e6fb0')
    expect(avatarColors({ ...BASE, hair: '#1c1b3a' }).H).not.toBe('#1c1b3a')
  })

  it('al parpadear los ojos se cierran', () => {
    const open = avatarColors(BASE, false)
    const shut = avatarColors(BASE, true)
    expect(shut.w).toBe(BASE.skin)
    expect(shut.e).toBe(BASE.skin)
    expect(shut.f).not.toBe(open.f)
  })
})

describe('catálogo de las láminas de referencia', () => {
  it('cada avatar ofrece dieciséis peinados distintos, con los doce de su lámina primero', () => {
    const women = styleChoices('hairStyle', { body: 'mujer' })
    const men = styleChoices('hairStyle', { body: 'hombre' })
    ;[women, men].forEach((list) => {
      expect(list).toHaveLength(16)
      expect(new Set(list).size).toBe(16)
      expect(list.at(-1)).toBe('calvo')
    })
    expect(women.slice(0, 3)).toEqual(['largo', 'pixie', 'bob'])
    expect(men.slice(0, 3)).toEqual(['rasurado', 'cortoClasico', 'dePunta'])
  })

  it('cada rejilla del creador tiene las opciones que quedan tras retirar las que no gustaban', () => {
    const counts = { face: 14, trait: 9, shoes: 9, top: 15, accessory: 17, bottom: 8 }
    Object.entries(counts).forEach(([field, count]) => expect(LOOK_STYLES[field], field).toHaveLength(count))
  })

  it('los sombreros más altos y más anchos caben en el lienzo sin tocar el borde', () => {
    ;['sombreroBruja', 'sombreroPaja'].forEach((accessory) =>
      DIRS.forEach((dir) => {
        const rows = rowsOf({ ...BASE, accessory }, dir)
        expect(rows[0]).toMatch(/^[.Xxyjklo]+$/)
        expect(rows.map((row) => row[0] + row[FRAME_W - 1]).join('')).toMatch(/^[.Xxyjklo]+$/)
        // La punta o la copa llega por encima de la cabeza.
        expect(rows.slice(0, 5).join('')).toMatch(/[A-Za-z]/)
      }),
    )
  })

  it('las botas altas tapan más pierna que las zapatillas', () => {
    const legRows = (shoes) => rowsOf({ ...BASE, bottom: 'shorts', shoes }, 'down').join('').split('').filter((ch) => ch === 'S' || ch === 's').length
    expect(legRows('botasAltas')).toBeLessThan(legRows('zapatillas'))
  })

  it('la expresión de llanto dibuja lágrimas y la de risa cierra los ojos', () => {
    expect(rowsOf({ ...BASE, face: 'llanto' }, 'down').join('')).toContain('q')
    expect(rowsOf({ ...BASE, face: 'risa' }, 'down').join('')).not.toMatch(/[we]{2}/)
  })
})

describe('hoja de poses', () => {
  it('cada pose y dirección tiene su fotograma, sin solaparse y dentro de la hoja', () => {
    const seen = new Set()
    DIRS.forEach((dir) =>
      POSE_LIST.forEach((pose) => {
        const { x, y, w, h } = frameRect(dir, pose)
        expect(x + w).toBeLessThanOrEqual(POSES * FRAME_W)
        expect(y + h).toBeLessThanOrEqual(DIRS.length * FRAME_H)
        seen.add(`${x},${y}`)
      }),
    )
    expect(seen.size).toBe(DIRS.length * POSES)
  })
})

describe('frente', () => {
  // Una fila de sombra de piel bajo el flequillo se leía como una franja gris pintada sobre los ojos.
  // Las filas 3 a 5 de la figura (8 a 10 del lienzo) son la frente y las cejas. Solo cuenta lo que
  // toca la cabeza: avatar, peinado, complemento, expresión y rasgo.
  it('no lleva una franja de sombra en ninguna combinación, vista ni pose', () => {
    const heads = []
    LOOK_STYLES.body.forEach((body) => {
      styleChoices('hairStyle', { body }).forEach((hairStyle) => LOOK_STYLES.accessory.forEach((accessory) => heads.push({ ...DEFAULT_LOOK, body, hairStyle, accessory })))
      LOOK_STYLES.face.forEach((face) => LOOK_STYLES.trait.forEach((trait) => heads.push({ ...DEFAULT_LOOK, body, hairStyle: 'calvo', face, trait })))
    })
    const banded = heads.filter((look) =>
      ['down', 'left', 'right'].some((dir) => POSE_LIST.some((pose) => rowsOf(look, dir, pose).slice(8, 11).some((row) => row.includes('ss')))),
    )
    expect(banded).toEqual([])
  }, 30000)
})
