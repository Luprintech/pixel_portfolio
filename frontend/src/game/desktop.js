// Escritorio retro del ordenador de Lupe, que imita Windows XP (decisión de Lupe del 2026-11-11: el borrador de
// `docs/DIALOGOS.md` proponía un sistema inventado, pero quiere la maqueta exacta, con su fondo y su sonido de arranque).
// Aquí está lo que no depende de React: qué accesos hay, a dónde llevan y el dibujo de los iconos. Sin Phaser ni React.
import { PAL } from './palette.js'

// Accesos del escritorio. Un acceso con `url: null` está preparado pero aún sin enlace verificado: no se muestra, para no
// ofrecer un botón que no lleva a ningún sitio. Se activa poniendo aquí su enlace exacto, sin tocar nada más.
export const DESKTOP_ENTRIES = [
  { id: 'projects', kind: 'window' },
  { id: 'ie', kind: 'window' },
  { id: 'winamp', kind: 'window' },
  { id: 'paint', kind: 'window' },
  { id: 'calculator', kind: 'window' },
  { id: 'notepad', kind: 'window' },
  { id: 'vscode', kind: 'window' },
  { id: 'youtube', kind: 'link', url: 'https://www.youtube.com/@Luprintech' },
  { id: 'linkedin', kind: 'link', url: 'https://www.linkedin.com/in/guadalupe-cano-moyano/' },
  { id: 'instagram', kind: 'link', url: null },
  { id: 'tiktok', kind: 'link', url: null },
  { id: 'makerworld', kind: 'link', url: null },
]

export const visibleEntries = (entries = DESKTOP_ENTRIES) => entries.filter((entry) => entry.kind === 'window' || entry.url)

// Iconos de 12×12: una cadena por fila; cada letra es un color de `ICON_COLORS` y '.' deja transparente.
const ICON_COLORS = { o: PAL.ink, y: PAL.saffron, l: PAL.saffronLight, w: PAL.bone, r: PAL.tile, b: PAL.lagoon, c: PAL.lagoonLight, g: PAL.moss, p: PAL.rose }

export const ICONS = {
  projects: [
    '............',
    '.oooo.......',
    'olllloooooo.',
    'olllllllllo.',
    'oylyyyyyyyo.',
    'oyyyyyyyyyo.',
    'oyyyyyyyyyo.',
    'oyyyyyyyyyo.',
    'oyyyyyyyyyo.',
    'oyyyyyyyyyo.',
    '.ooooooooo..',
    '............',
  ],
  youtube: [
    '............',
    '............',
    '.oooooooooo.',
    'orrrrrrrrrro',
    'orrrwwrrrrro',
    'orrrwwwrrrro',
    'orrrwwwwrrro',
    'orrrwwwrrrro',
    'orrrwwrrrrro',
    'orrrrrrrrrro',
    '.oooooooooo.',
    '............',
  ],
  linkedin: [
    '............',
    '.oooooooooo.',
    'obbbbbbbbbbo',
    'obwbbbbbbbbo',
    'obbbbbbbbbbo',
    'obwbwwbwwbbo',
    'obwbwbwbwbbo',
    'obwbwbwbwbbo',
    'obwbwbwbwbbo',
    'obbbbbbbbbbo',
    '.oooooooooo.',
    '............',
  ],
  instagram: [
    '............',
    '.oooooooooo.',
    'oppppppppppo',
    'opwwwwwwwwpo',
    'opwppwwppwpo',
    'opwpwwwwpwpo',
    'opwpwwwwpwpo',
    'opwppwwppwpo',
    'opwwwwwwwwpo',
    'oppppppppppo',
    '.oooooooooo.',
    '............',
  ],
  tiktok: [
    '............',
    '.oooooooooo.',
    'occccccccco.',
    'ocwwwwwwwcco',
    'ocwwwcwwwcco',
    'ocwwwcccwcco',
    'ocwwwcwwwcco',
    'ocwcccwwwcco',
    'ocwcccwwwcco',
    'occcccccccco',
    '.oooooooooo.',
    '............',
  ],
  makerworld: [
    '............',
    '.....oo.....',
    '....oggo....',
    '...oggggo...',
    '..oggwwggo..',
    '.oggwggwggo.',
    '.ogggggggo..',
    '..ogggggo...',
    '...oggggo...',
    '....oooo....',
    '............',
    '............',
  ],
}

// Iconos de los programas, de 16×16 y dibujados con formas (círculos, rectángulos y líneas) en lugar de a mano fila a fila: la
// silueta y los colores de cada programa de la época (Internet Explorer, Calculadora, Paint, Bloc de notas, Winamp y Visual
// Studio Code), adaptados a píxeles. Cada dibujo recibe `put(x, y, color)`; al final se les añade el contorno oscuro.
const SIDE = 16
const disc = (put, cx, cy, r, color) => {
  for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) if (Math.hypot(x - cx, y - cy) <= r) put(x, y, color)
}
const box = (put, x, y, w, h, color) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, color)
}

const DRAWN = {
  // Una «e» blanca sobre un disco azul, rodeada por una órbita dorada que pasa por delante.
  ie: (put) => {
    disc(put, 7.5, 8, 6.4, '#1e6fd9')
    disc(put, 6, 6, 3.4, '#5aa7f5')
    for (let y = 0; y < SIDE; y++) {
      for (let x = 0; x < SIDE; x++) {
        const dx = x - 7.5
        const dy = y - 8
        const r = Math.hypot(dx, dy)
        if (r >= 2.3 && r <= 4.3 && !(dx > 0 && dy > 1 && dy < 3.2)) put(x, y, '#ffffff')
      }
    }
    box(put, 4, 7, 8, 2, '#ffffff')
    for (let t = 0; t < Math.PI * 2; t += 0.12) {
      if (Math.sin(t) <= 0) continue
      const ex = 7.5 + 7.6 * Math.cos(t)
      const ey = 8 + 2.6 * Math.sin(t)
      const rx = 7.5 + (ex - 7.5) * Math.cos(-0.6) - (ey - 8) * Math.sin(-0.6)
      const ry = 8 + (ex - 7.5) * Math.sin(-0.6) + (ey - 8) * Math.cos(-0.6)
      put(Math.round(rx), Math.round(ry), '#f2b134')
    }
  },
  // Calculadora gris con la pantalla verde y la rejilla de teclas, una roja.
  calculator: (put) => {
    box(put, 2, 1, 12, 14, '#d6d3c4')
    box(put, 2, 1, 12, 1, '#ffffff')
    box(put, 4, 3, 8, 3, '#8fc16a')
    box(put, 4, 3, 8, 1, '#6fa04a')
    ;[8, 10, 12].forEach((y, row) => [4, 7, 10].forEach((x, col) => box(put, x, y, 2, 2, row === 2 && col === 2 ? '#d4503a' : col === 2 ? '#7a9fd6' : '#ffffff')))
  },
  // Paleta de pintor con cuatro manchas de color y un pincel.
  paint: (put) => {
    for (let y = 0; y < SIDE; y++) for (let x = 0; x < SIDE; x++) if (((x - 7.5) / 6.6) ** 2 + ((y - 9) / 5.6) ** 2 <= 1) put(x, y, '#e8d3a8')
    box(put, 3, 10, 2, 2, '#1c1b3a')
    ;[[5, 7, '#d4503a'], [8, 6, '#f8d77a'], [11, 8, '#3e9bb0'], [7, 11, '#4f7f3f']].forEach(([x, y, color]) => box(put, x, y, 2, 2, color))
    for (let k = 0; k < 7; k++) box(put, 13 - k, 1 + k, 2, 1, k < 2 ? '#3e9bb0' : '#9a6a45')
  },
  // Cuaderno de espiral: tapa azul con anillas, hoja blanca con renglones.
  notepad: (put) => {
    box(put, 3, 2, 10, 13, '#ffffff')
    box(put, 3, 2, 10, 3, '#2f6fdc')
    ;[4, 6, 8, 10, 12].forEach((x) => box(put, x, 1, 1, 3, '#3b3957'))
    ;[7, 9, 11, 13].forEach((y) => box(put, 5, y, 6, 1, '#aaa7c4'))
  },
  // Cuadrado oscuro con el rayo naranja de Winamp.
  winamp: (put) => {
    box(put, 2, 2, 12, 12, '#2b2b3a')
    box(put, 2, 2, 12, 1, '#5a5a70')
    ;[[8, 3, 3], [7, 4, 3], [6, 5, 3], [6, 6, 5], [8, 7, 2], [7, 8, 2], [6, 9, 2], [5, 10, 2], [5, 11, 1]].forEach(([x, y, w]) => box(put, x, y, w, 1, '#ff9d00'))
  },
  // Cinta azul de Visual Studio Code: una barra a la derecha y un «<» que sale de ella.
  vscode: (put) => {
    box(put, 10, 2, 4, 12, '#1f9cf0')
    box(put, 10, 2, 1, 12, '#6fc3ff')
    for (let k = 0; k < 8; k++) {
      box(put, 10 - k, 3 + Math.round((k * 5) / 7), 3, 1, '#007acc')
      box(put, 10 - k, 12 - Math.round((k * 5) / 7), 3, 1, '#007acc')
    }
    box(put, 2, 7, 3, 2, '#007acc')
  },
}

const outlined = (draw) => {
  const cells = new Map()
  draw((x, y, color) => cells.set(`${Math.round(x)},${Math.round(y)}`, color))
  const result = [...cells].map(([key, color]) => ({ key, color }))
  const edge = new Set()
  cells.forEach((_, key) => {
    const [x, y] = key.split(',').map(Number)
    ;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const k = `${x + dx},${y + dy}`
      if (!cells.has(k) && x + dx >= 0 && y + dy >= 0 && x + dx < SIDE && y + dy < SIDE) edge.add(k)
    })
  })
  return [...result, ...[...edge].map((key) => ({ key, color: PAL.ink }))].map(({ key, color }) => {
    const [x, y] = key.split(',').map(Number)
    return { x, y, color }
  })
}

export const iconSize = (id) => (ICONS[id] ? ICONS[id].length : SIDE)

// Casillas de un icono (`{ x, y, color }`) para pintarlo como SVG sin suavizar.
export function iconCells(id) {
  if (DRAWN[id]) return outlined(DRAWN[id])
  const rows = ICONS[id] ?? ICONS.projects
  return rows.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === '.' ? [] : [{ x, y, color: ICON_COLORS[ch] }])))
}

// Fondo del escritorio: la imagen que aportó Lupe, en `public/images`.
export const WALLPAPER = '/images/paisaje-colinas-floridas.png'
