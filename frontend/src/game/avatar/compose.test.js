import { describe, expect, it } from 'vitest'
import { DEFAULT_LOOK, LOOK_STYLES } from '../look'
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
  LOOK_STYLES.face.forEach((face) => LOOK_STYLES.beard.forEach((beard) => list.push({ ...DEFAULT_LOOK, face, beard })))
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
          const where = `${look.body} ${look.hairStyle} ${look.top} ${look.bottom} ${look.shoes} ${look.face} ${look.beard} ${look.accessory} ${dir} ${pose}`
          if (width !== FRAME_W || height !== FRAME_H || rows.length !== FRAME_H) problems.push(`tamaño: ${where}`)
          rows.forEach((row) => {
            if (row.length !== FRAME_W) problems.push(`ancho ${row.length}: ${where}`)
            if ([...row].some((ch) => !known.has(ch))) problems.push(`letra: ${where}`)
          })
          // Nada dibujado toca el borde: la primera y la última fila y columna son solo contorno o vacío.
          const edges = [rows[0], rows[FRAME_H - 1], rows.map((row) => row[0]).join(''), rows.map((row) => row[FRAME_W - 1]).join('')]
          if (edges.some((edge) => /[^.X]/.test(edge))) problems.push(`borde: ${where}`)
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
        const cols = [...sole].map((ch, i) => (ch === '.' || ch === 'X' ? -1 : i)).filter((i) => i >= 0)
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
    // El rapado lateral solo se ve por el lado rapado, y el lazo y la flor por el lado en que se llevan.
    expect(mirrored({ ...BASE, hairStyle: 'rapado' })).toBe(false)
    expect(mirrored({ ...BASE, accessory: 'lazo' })).toBe(false)
    expect(mirrored({ ...BASE, accessory: 'flor' })).toBe(false)
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

  it('de perfil se ve una sola mano y una sola pierna en reposo, y las dos piernas al caminar', () => {
    const rest = stance({ view: 'side', male: false, pose: 0 })
    expect(rest.arms).toHaveLength(1)
    expect(rest.legs).toHaveLength(1)
    ;[1, 2].forEach((pose) => {
      const step = stance({ view: 'side', male: false, pose })
      expect(step.arms).toHaveLength(1)
      expect(step.legs).toHaveLength(2)
      expect(step.legs.filter((leg) => leg.far)).toHaveLength(1)
    })
    expect(stance({ view: 'down', male: false, pose: 0 }).arms).toHaveLength(2)
  })

  it('el brazo de perfil cuelga delante del torso, con su propio contorno y una mano de piel', () => {
    const rows = rowsOf({ ...BASE, hairStyle: 'pixie' }, 'right', 0)
    // Las filas de la mano: piel entre dos líneas de contorno dentro del torso.
    const hands = rows.filter((row) => /X[sS]{2}X/.test(row))
    expect(hands.length).toBeGreaterThanOrEqual(3)
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
    ;['face', 'beard', 'accessory'].forEach((field) => distinct(field, (value) => rowsOf({ ...BASE, hairStyle: 'calvo', [field]: value }, 'down').join('|')))
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

  it('el vello facial y las gafas no se dibujan de espaldas', () => {
    const plain = rowsOf(BASE, 'up')
    expect(rowsOf({ ...BASE, beard: 'barba', accessory: 'gafas' }, 'up')).toEqual(plain)
  })

  it('una combinación nueva no altera la de por defecto', () => {
    const before = rowsOf(BASE, 'down').join('')
    composeAvatar({ ...BASE, hairStyle: 'rizadoCorto', accessory: 'gorro', beard: 'barba' }, 'down', 1)
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
