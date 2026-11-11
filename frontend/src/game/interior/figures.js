// Las figuras impresas en 3D de la casa, cada una dibujada en un lienzo de 16×16 para verlas de cerca (el visor de la
// vitrina las amplía) y, la del pokémon, también sobre la cama de la impresora pequeña. Más adelante se podrán sustituir o
// acompañar con fotos de las figuras reales de Lupe. Sin dependencias de Phaser ni de React.
import { INK, canvasOf, rect } from './draw.js'
import { SIGN_H, SIGN_W, drawLuprintechSign } from './signs.js'

// Pokémon amarillo de orejas largas con la punta negra, mejillas rojas y cola en zigzag. `ox, oy` es su esquina.
export function drawPokemon(g, ox = 0, oy = 0) {
  const put = (x, y, w, h, color) => rect(g, ox + x, oy + y, w, h, color)
  put(11, 4, 2, 2, '#c99a1c')
  put(12, 2, 2, 3, '#f8d63a')
  put(13, 1, 2, 2, '#f8d63a')
  put(10, 6, 2, 2, '#c99a1c')
  put(4, 1, 2, 4, '#f8d63a')
  put(3, 0, 2, 2, INK.night)
  put(9, 1, 2, 4, '#f8d63a')
  put(10, 0, 2, 2, INK.night)
  put(3, 4, 9, 6, '#f8d63a')
  put(4, 10, 7, 4, '#f8d63a')
  put(5, 14, 2, 2, '#c99a1c')
  put(8, 14, 2, 2, '#c99a1c')
  put(5, 6, 1, 2, INK.night)
  put(9, 6, 1, 2, INK.night)
  put(3, 8, 2, 2, INK.tile)
  put(10, 8, 2, 2, INK.tile)
  put(7, 8, 1, 1, INK.night)
  put(4, 11, 1, 2, '#c99a1c')
}

// Figuras de personajes dibujadas con mapas de caracteres ('.' es transparente). Colores sin logotipos: lo que las hace
// reconocibles es la silueta y la paleta de cada una.
const MAP_COLORS = {
  k: '#1c1b22', s: '#f6d2b0', r: '#d8353a', g: '#2f9e57', w: '#fdfdfb', o: '#f08a24', p: '#f48fa8', b: '#8a4a2a',
  y: '#f8d63a', t: '#35c7b4', a: '#9a9aa8', d: '#55555f', l: '#3d4fb0', u: '#e8a820', n: '#7a4a22', q: '#d9a37a', e: '#4a3226',
}

// Pinta un mapa con su esquina en (ox, oy).
export function drawMap(g, ox, oy, rows) {
  rows.forEach((row, y) => {
    ;[...row].forEach((cell, x) => {
      if (cell !== '.') rect(g, ox + x, oy + y, 1, 1, MAP_COLORS[cell])
    })
  })
}

export const TANJIRO = [
  '....kk.kkk......',
  '...kkkkkkkkk....',
  '..kkkkkkkkkkk...',
  '..kkrrkkkkkkk...',
  '..kssrssssssk...',
  '..ksnsssnsssk...',
  '..ksnsssnsssk...',
  '..ksssssssssk...',
  '...kssssssssk...',
  '..gkgkkgkkgkg...',
  '..kgkgkkgkgkk...',
  '..gkgwwwwgkg....',
  '..kgkkgkkgkk....',
  '...kgkkkkgk.....',
  '...rkk..kkr.....',
  '..wrrw..wrrw....',
]

export const NEZUKO = [
  '...kkkkkkkkk..pp',
  '..kkkkkkkkkkkpp.',
  '..kkssssssskk...',
  '..ksssssssssk...',
  '..kssrsssrssk...',
  '..kssrsssrssk...',
  '..kgggggggggk...',
  '.ko.kssssssk.ok.',
  '.ko.pppppppp.ok.',
  '.kk.pwpppwpp.kk.',
  '.kkkkpppppkkkk..',
  '.kkkkwwwwwkkkk..',
  '.okkkpppppkkko..',
  '..o.kwwwwwk.o...',
  '.....kk..kk.....',
  '....pww..wwp....',
]

export const EREN = [
  '....kkkkkkkk....',
  '...kkkkkkkkkk...',
  '..kkkkkkkkkkkk..',
  '..kkksskkksskk..',
  '..ksssssssssk...',
  '..kssttsssttsk..',
  '..ksstsssstssk..',
  '...ksssssssssk..',
  '....sssssssss...',
  '..bbbyyyybbb....',
  '.wbbbyyyybbbw...',
  '.wabbddddbbaw...',
  '..aaaddbbddaaa..',
  '...aaa....aaa...',
  '...kkk....kkk...',
  '..kkkk....kkkk..',
]

export const ZELDA = [
  '....uuuuuuuu....',
  '...uuuuppuuuu...',
  '..yyyyyyyyyyyy..',
  '.yyyyyyyyyyyyyy.',
  '.yysssssssssyy..',
  'sysksssssskssys.',
  'sysksssssskssys.',
  '.yssppsssppssy..',
  '.yyysssssssyyy..',
  '..yywwppppwwyy..',
  '..yyppuuuuppyy..',
  '...ppppllpppp...',
  '...ppllullpp....',
  '..ppppllllpppp..',
  '.ppppppllpppppp.',
  '.llllllllllllll.',
]

// Funko Pop personalizado de David: calvo, barba oscura, camiseta negra con el logo y una cámara en la mano.
export const FUNKO = [
  '....qqqqqqqq....',
  '...qqqqqqqqqq...',
  '..qqqqqqqqqqqq..',
  '..qqqqqqqqqqqq..',
  '..qqkkqqqqkkqq..',
  '..qqkkqqqqkkqq..',
  '..qeeqqqqqqeeq..',
  '..qeeeeeeeeeeq..',
  '...eeeeeeeeee...',
  '....eeeeeeee.ddd',
  '...kkkkkkkkkdada',
  '...kkwkwkwkkqdd.',
  '...kkkkkkkkkq...',
  '....kkkkkkkk....',
  '....kkk..kkk....',
  '...aakk..kkaa...',
]

export const FUNKO_MINI = [
  '.qqqqqq.',
  'qqqqqqqq',
  'qkkqqkkq',
  'qeeeeeeq',
  '.eeeeee.',
  'kkkkkkda',
  'kkwkwkdd',
  'kkkkkkq.',
  '.kk..kk.',
  '.aa..aa.',
]

// Versiones de 8×10 para la balda de la vitrina, donde no cabe una figura entera.
export const TANJIRO_MINI = [
  '.kkkkkk.',
  'krkkkkkk',
  'ksnssnsk',
  '.ssssss.',
  'gkgkkgkg',
  'kgkwwkgk',
  'gkgkkgkg',
  '.kgkkgk.',
  '.rk..kr.',
  '.wr..rw.',
]

export const NEZUKO_MINI = [
  '.kkkkpp.',
  'kssssskk',
  'ksrssrsk',
  'kgggggk.',
  'kppppppk',
  'kkpwwpkk',
  'kkppppkk',
  '.kwwwwk.',
  '..k..k..',
  '..pp.pp.',
]

export const EREN_MINI = [
  '.kkkkkk.',
  'kkkkkkkk',
  'ksstsstk',
  '.ssssss.',
  'bbbyybbb',
  'wbbyybbw',
  'wabddbaw',
  '.aaddaa.',
  '.aa..aa.',
  '.kk..kk.',
]

export const ZELDA_MINI = [
  '..uppu..',
  '.yyyyyy.',
  'sykssksy',
  '.yssssy.',
  '..wppw..',
  '..pppp..',
  '.ppllpp.',
  '.ppulpp.',
  'pppllppp',
  'llllllll',
]

export const FUNKO_VIDEO = 'https://youtu.be/Ox06KB95vbM?si=V2w8LRSlr8xZOM2e'

// El catálogo de figuras: una sola lista que alimenta el visor «Mis figuras 3D» y la vitrina de la sala. Para añadir una:
// su `draw` (lienzo de `size`, 16×16 por defecto) y, si debe verse en la vitrina, `shelf` (mapa de 8×10 que la vitrina
// coloca sola en la primera balda libre, creciendo en baldas si hacen falta). Opcionales: `unlock` (logro que la entrega; sin
// él no se ve en el visor), `dark` (el visor la pone sobre fondo oscuro), `bare` (sin tarjeta de fondo) y `href` (enlace que
// se abre al pulsarla). Hay que añadir también su nombre en `lib/valleCopy.js` (`figures.items`).
export const FIGURES = [
  { id: 'luprintech', size: [SIGN_W, SIGN_H], dark: true, draw: (g) => drawLuprintechSign(g, 0, 0, true) },
  { id: 'nezuko', draw: (g) => drawMap(g, 0, 0, NEZUKO), shelf: NEZUKO_MINI },
  { id: 'eren', draw: (g) => drawMap(g, 0, 0, EREN), shelf: EREN_MINI },
  { id: 'zelda', draw: (g) => drawMap(g, 0, 0, ZELDA), shelf: ZELDA_MINI },
  { id: 'tanjiro', draw: (g) => drawMap(g, 0, 0, TANJIRO), shelf: TANJIRO_MINI },
  { id: 'funko', draw: (g) => drawMap(g, 0, 0, FUNKO), shelf: FUNKO_MINI, bare: true, href: FUNKO_VIDEO },
  { id: 'pokemon', draw: (g) => drawPokemon(g, 0, 0), unlock: 'maker' },
]

export function figureCanvas(figure) {
  const [width, height] = figure.size ?? [16, 16]
  const { canvas, g } = canvasOf(width, height)
  figure.draw(g)
  return canvas
}
