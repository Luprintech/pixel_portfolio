// Genera los iconos de la PWA (public/icons/*.png) sin dependencias: dibuja una casita de 16×16
// escalada a píxel entero sobre el fondo Tinta y escribe los PNG con zlib. Se ejecuta a mano
// (`node scripts/make-pwa-icons.mjs`) cuando cambie el dibujo; los PNG resultantes se commitean.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT_DIR = fileURLToPath(new URL('../public/icons/', import.meta.url))

const PALETTE = {
  '.': null,
  I: [0x1c, 0x1b, 0x3a], // fondo (--bg-primary)
  O: [0x0f, 0x0e, 0x22], // contorno (--px-ink del tema claro)
  A: [0xf2, 0xb1, 0x34], // tejado (--accent-primary)
  S: [0xb9, 0x7d, 0x1e], // sombra del tejado
  W: [0xf1, 0xe6, 0xcf], // pared (--text-primary)
  T: [0x4c, 0xb3, 0xc9], // ventana (--accent-secondary)
  D: [0xe2, 0x65, 0x4f], // puerta (--accent-orange)
  G: [0xa3, 0xc1, 0x4f], // hierba (--accent-green)
}

const HOUSE = [
  '................',
  '.......OO.......',
  '......OAAO......',
  '.....OAAAAO.....',
  '....OAAAAAAO....',
  '...OAAAAAAAAO...',
  '..OAAAAAAAAAAO..',
  '..OSSSSSSSSSSO..',
  '...OWWWWWWWWO...',
  '...OWTTWWTTWO...',
  '...OWTTWWTTWO...',
  '...OWWWDDWWWO...',
  '...OWWWDDWWWO...',
  '.GGGGGGGGGGGGGG.',
  '................',
  '................',
]

// `fill` es la fracción del lienzo que ocupa el dibujo. La versión maskable lo deja en el 60 %
// central para que ninguna máscara circular o de esquinas redondeadas lo recorte.
const ICONS = [
  { file: 'icon-192.png', size: 192, fill: 0.8 },
  { file: 'icon-512.png', size: 512, fill: 0.8 },
  { file: 'icon-maskable-512.png', size: 512, fill: 0.6 },
  { file: 'apple-touch-icon.png', size: 180, fill: 0.75 },
]

function render({ size, fill }) {
  const scale = Math.floor((size * fill) / 16)
  const offset = Math.floor((size - scale * 16) / 2)
  const rgb = Buffer.alloc(size * size * 3)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cx = Math.floor((x - offset) / scale)
      const cy = Math.floor((y - offset) / scale)
      const inside = cx >= 0 && cx < 16 && cy >= 0 && cy < 16
      const color = (inside && PALETTE[HOUSE[cy][cx]]) || PALETTE.I
      rgb.set(color, (y * size + x) * 3)
    }
  }
  return rgb
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}

function encodePng(size, rgb) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.set([8, 2, 0, 0, 0], 8) // 8 bits, RGB, sin entrelazado
  // Cada fila lleva delante el byte de filtro 0 (sin filtro)
  const stride = size * 3
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y += 1) rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT_DIR, { recursive: true })
for (const icon of ICONS) {
  writeFileSync(OUT_DIR + icon.file, encodePng(icon.size, render(icon)))
  console.log(`public/icons/${icon.file}`)
}
