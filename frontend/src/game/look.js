// Aspecto de la viajera: qué opciones hay y cómo se valida. Lo comparten juego, portada y creador.
// Dónde se guarda vive en `save.js`.

const HAIR_COLORS = ['#8a3f2c', '#1c1b3a', '#e0b04a', '#c9c9d8', '#b8527a', '#3a6a3a', '#5a3a28', '#3e6fb0']

// Colores (una lista de tonos por categoría) y estilos (una lista de ids por categoría).
export const LOOK_COLORS = {
  skin: ['#f6d9c0', '#f0c09a', '#d9a07a', '#a8714f', '#6b4430', '#4a2f22'],
  eyes: ['#2a1a2e', '#6b4430', '#b8864a', '#4f7f3f', '#3e6fb0', '#8a8a9a', '#7a3f8f'],
  hair: HAIR_COLORS,
  beardColor: HAIR_COLORS,
  accessoryColor: ['#f2b134', '#d4503a', '#b8527a', '#3e6fb0', '#4f7f3f', '#7a3f8f', '#f1e6cf', '#1c1b3a'],
  topColor: ['#2f8f8b', '#7a3f8f', '#d4503a', '#3e6fb0', '#4f7f3f', '#f1e6cf', '#f2b134', '#b8527a', '#1c1b3a', '#5c5a7a'],
  bottomColor: ['#3a4a7a', '#5a3a28', '#1c1b3a', '#4f7f3f', '#5c5a7a', '#8a3f2c', '#f1e6cf', '#d4503a'],
  shoesColor: ['#7a4f35', '#1c1b3a', '#f1e6cf', '#d4503a', '#3e6fb0', '#f2b134'],
  trim: ['#f2b134', '#cfd6e6', '#d4503a', '#4cb3c9'],
}

export const LOOK_STYLES = {
  body: ['mujer', 'hombre'],
  face: ['serena', 'sonrisa', 'sorpresa', 'guino', 'timida'],
  hairStyle: ['largo', 'pixie', 'bob', 'ondulado', 'rizadoCorto', 'voluminoso', 'colaAlta', 'colaBaja', 'coletas', 'trenzas', 'rodete', 'rapado', 'calvo'],
  beard: ['ninguna', 'barba', 'bigote', 'perilla', 'patillas'],
  accessory: ['ninguno', 'gafas', 'gafasSol', 'lazo', 'flor', 'diadema', 'gorro', 'gorra', 'pendientes'],
  top: ['camiseta', 'oversize', 'tirantes', 'camisa', 'sudadera', 'cremallera', 'jersey', 'vaquera', 'vestido', 'vestidoTirantes', 'vestidoLargo', 'vestidoCamisero', 'peto'],
  bottom: ['pantalon', 'cargo', 'ancho', 'shorts', 'falda', 'plisada', 'faldaLarga'],
  shoes: ['zapatillas', 'botas', 'sandalias'],
}

export const LOOK_OPTIONS = { ...LOOK_COLORS, ...LOOK_STYLES }

// Los vestidos y el peto son de una pieza: no se elige prenda de abajo, y en los vestidos tampoco su color.
const DRESSES = ['vestido', 'vestidoTirantes', 'vestidoLargo', 'vestidoCamisero']
const ONE_PIECE = [...DRESSES, 'peto']
const hasBeard = (look) => look.beard !== 'ninguna'
const hasHair = (look) => look.hairStyle !== 'calvo'
const hasAccessoryColor = (look) => ['lazo', 'diadema', 'gorro', 'gorra', 'pendientes'].includes(look.accessory)
const showsBottom = (look) => !ONE_PIECE.includes(look.top)
// El color de abajo también tiñe el peto, que lleva su propia tela sobre la camiseta.
const showsBottomColor = (look) => !DRESSES.includes(look.top)

// Los apartados con muchas tarjetas (`wide`) ocupan las dos columnas.
// Cada campo se enseña con una vista en píxeles: `view` dice qué parte del cuerpo se recorta.
// Los campos de color (`kind: 'color'`) se enseñan como muestras.
export const LOOK_SECTIONS = [
  { id: 'avatar', fields: [{ key: 'body', view: 'full' }] },
  {
    id: 'face',
    fields: [{ key: 'skin' }, { key: 'eyes' }, { key: 'face', view: 'head' }],
  },
  {
    id: 'hair',
    wide: true,
    fields: [{ key: 'hairStyle', view: 'hair' }, { key: 'hair', when: hasHair }],
  },
  {
    id: 'beard',
    fields: [{ key: 'beard', view: 'head' }, { key: 'beardColor', when: hasBeard }],
  },
  {
    id: 'extras',
    fields: [{ key: 'accessory', view: 'head' }, { key: 'accessoryColor', when: hasAccessoryColor }],
  },
  {
    id: 'clothes',
    wide: true,
    fields: [
      { key: 'top', view: 'torso' },
      { key: 'topColor' },
      { key: 'bottom', view: 'legs', when: showsBottom },
      { key: 'bottomColor', when: showsBottomColor },
      { key: 'shoes', view: 'feet' },
      { key: 'shoesColor' },
      { key: 'trim' },
    ],
  },
]

export const SECTION_NAMES = {
  es: { avatar: 'Avatar', face: 'Rostro', hair: 'Pelo', beard: 'Vello facial', extras: 'Complementos', clothes: 'Ropa' },
  en: { avatar: 'Avatar', face: 'Face', hair: 'Hair', beard: 'Facial hair', extras: 'Accessories', clothes: 'Clothes' },
}

export const LOOK_LABELS = {
  es: {
    body: 'Avatar',
    skin: 'Piel',
    eyes: 'Ojos',
    face: 'Expresión',
    hairStyle: 'Peinado',
    hair: 'Color de pelo',
    beard: 'Estilo',
    beardColor: 'Color del vello',
    accessory: 'Complemento',
    accessoryColor: 'Color del complemento',
    top: 'Prenda de arriba',
    topColor: 'Color de la prenda de arriba',
    bottom: 'Prenda de abajo',
    bottomColor: 'Color de la prenda de abajo',
    shoes: 'Calzado',
    shoesColor: 'Color del calzado',
    trim: 'Detalles y ribetes',
  },
  en: {
    body: 'Avatar',
    skin: 'Skin',
    eyes: 'Eyes',
    face: 'Expression',
    hairStyle: 'Hairstyle',
    hair: 'Hair colour',
    beard: 'Style',
    beardColor: 'Hair colour',
    accessory: 'Accessory',
    accessoryColor: 'Accessory colour',
    top: 'Top',
    topColor: 'Top colour',
    bottom: 'Bottoms',
    bottomColor: 'Bottoms colour',
    shoes: 'Shoes',
    shoesColor: 'Shoes colour',
    trim: 'Details and trim',
  },
}

// Nombre de cada estilo. No se ve en pantalla (cada opción se enseña dibujada), pero es el
// nombre accesible del botón y lo que sale al pasar el ratón.
export const STYLE_NAMES = {
  es: {
    mujer: 'Mujer',
    hombre: 'Hombre',
    serena: 'Serena',
    sonrisa: 'Sonrisa',
    sorpresa: 'Sorpresa',
    guino: 'Guiño',
    timida: 'Tímida',
    largo: 'Largo liso',
    pixie: 'Corto pixie',
    bob: 'Bob',
    ondulado: 'Largo ondulado',
    rizadoCorto: 'Corto rizado',
    voluminoso: 'Rizado voluminoso',
    colaAlta: 'Coleta alta',
    colaBaja: 'Coleta baja',
    coletas: 'Dos coletas',
    trenzas: 'Dos trenzas',
    rodete: 'Moño alto',
    rapado: 'Rapado lateral',
    calvo: 'Sin pelo',
    ninguna: 'Sin vello',
    barba: 'Barba',
    bigote: 'Bigote',
    perilla: 'Perilla',
    patillas: 'Patillas',
    ninguno: 'Ninguno',
    gafas: 'Gafas',
    gafasSol: 'Gafas de sol',
    lazo: 'Lazo',
    flor: 'Flor',
    diadema: 'Diadema',
    gorro: 'Gorro',
    gorra: 'Gorra',
    pendientes: 'Pendientes',
    camiseta: 'Camiseta básica',
    oversize: 'Camiseta oversize',
    tirantes: 'Top sin mangas',
    camisa: 'Camisa',
    sudadera: 'Sudadera con capucha',
    cremallera: 'Sudadera con cremallera',
    jersey: 'Jersey',
    vaquera: 'Chaqueta vaquera',
    vestido: 'Vestido casual',
    vestidoTirantes: 'Vestido de tirantes',
    vestidoLargo: 'Vestido largo',
    vestidoCamisero: 'Vestido camisero',
    peto: 'Peto vaquero',
    pantalon: 'Vaqueros rectos',
    cargo: 'Pantalón cargo',
    ancho: 'Pantalón ancho',
    shorts: 'Pantalón corto',
    falda: 'Falda corta',
    plisada: 'Falda plisada',
    faldaLarga: 'Falda larga',
    zapatillas: 'Zapatillas',
    botas: 'Botas',
    sandalias: 'Sandalias',
  },
  en: {
    mujer: 'Woman',
    hombre: 'Man',
    serena: 'Calm',
    sonrisa: 'Smile',
    sorpresa: 'Surprised',
    guino: 'Wink',
    timida: 'Shy',
    largo: 'Long straight',
    pixie: 'Short pixie',
    bob: 'Bob',
    ondulado: 'Long wavy',
    rizadoCorto: 'Short curly',
    voluminoso: 'Big curls',
    colaAlta: 'High ponytail',
    colaBaja: 'Low ponytail',
    coletas: 'Pigtails',
    trenzas: 'Two braids',
    rodete: 'High bun',
    rapado: 'Side undercut',
    calvo: 'No hair',
    ninguna: 'No facial hair',
    barba: 'Beard',
    bigote: 'Moustache',
    perilla: 'Goatee',
    patillas: 'Sideburns',
    ninguno: 'None',
    gafas: 'Glasses',
    gafasSol: 'Sunglasses',
    lazo: 'Bow',
    flor: 'Flower',
    diadema: 'Headband',
    gorro: 'Beanie',
    gorra: 'Cap',
    pendientes: 'Earrings',
    camiseta: 'Basic T-shirt',
    oversize: 'Oversized T-shirt',
    tirantes: 'Sleeveless top',
    camisa: 'Shirt',
    sudadera: 'Hoodie',
    cremallera: 'Zip hoodie',
    jersey: 'Sweater',
    vaquera: 'Denim jacket',
    vestido: 'Casual dress',
    vestidoTirantes: 'Pinafore dress',
    vestidoLargo: 'Long dress',
    vestidoCamisero: 'Shirt dress',
    peto: 'Denim overalls',
    pantalon: 'Straight jeans',
    cargo: 'Cargo trousers',
    ancho: 'Wide trousers',
    shorts: 'Shorts',
    falda: 'Short skirt',
    plisada: 'Pleated skirt',
    faldaLarga: 'Long skirt',
    zapatillas: 'Sneakers',
    botas: 'Boots',
    sandalias: 'Sandals',
  },
}

// Nombre de cada color según la categoría: el mismo tono puede llamarse distinto en la piel,
// en los ojos o en la ropa. Así el color no depende solo de verlo (lectores de pantalla, daltonismo).
const HAIR_ES = {
  '#8a3f2c': 'Cobre',
  '#1c1b3a': 'Negro',
  '#e0b04a': 'Rubio',
  '#c9c9d8': 'Plata',
  '#b8527a': 'Rosa',
  '#3a6a3a': 'Verde',
  '#5a3a28': 'Castaño',
  '#3e6fb0': 'Azul',
}
const HAIR_EN = {
  '#8a3f2c': 'Copper',
  '#1c1b3a': 'Black',
  '#e0b04a': 'Blonde',
  '#c9c9d8': 'Silver',
  '#b8527a': 'Pink',
  '#3a6a3a': 'Green',
  '#5a3a28': 'Brown',
  '#3e6fb0': 'Blue',
}
const ACCESSORY_ES = { '#f2b134': 'Azafrán', '#d4503a': 'Teja', '#b8527a': 'Rosa', '#3e6fb0': 'Azul', '#4f7f3f': 'Musgo', '#7a3f8f': 'Morado', '#f1e6cf': 'Hueso', '#1c1b3a': 'Negro' }
const ACCESSORY_EN = { '#f2b134': 'Saffron', '#d4503a': 'Tile red', '#b8527a': 'Pink', '#3e6fb0': 'Blue', '#4f7f3f': 'Moss', '#7a3f8f': 'Purple', '#f1e6cf': 'Bone', '#1c1b3a': 'Black' }
const TOP_ES = { '#2f8f8b': 'Turquesa', '#7a3f8f': 'Morado', '#d4503a': 'Teja', '#3e6fb0': 'Azul', '#4f7f3f': 'Musgo', '#f1e6cf': 'Hueso', '#f2b134': 'Azafrán', '#b8527a': 'Rosa', '#1c1b3a': 'Negro', '#5c5a7a': 'Gris' }
const TOP_EN = { '#2f8f8b': 'Teal', '#7a3f8f': 'Purple', '#d4503a': 'Tile red', '#3e6fb0': 'Blue', '#4f7f3f': 'Moss', '#f1e6cf': 'Bone', '#f2b134': 'Saffron', '#b8527a': 'Pink', '#1c1b3a': 'Black', '#5c5a7a': 'Grey' }

export const COLOR_NAMES = {
  es: {
    skin: { '#f6d9c0': 'Clara', '#f0c09a': 'Melocotón', '#d9a07a': 'Dorada', '#a8714f': 'Morena', '#6b4430': 'Oscura', '#4a2f22': 'Muy oscura' },
    eyes: { '#2a1a2e': 'Negros', '#6b4430': 'Marrones', '#b8864a': 'Avellana', '#4f7f3f': 'Verdes', '#3e6fb0': 'Azules', '#8a8a9a': 'Grises', '#7a3f8f': 'Violetas' },
    hair: HAIR_ES,
    beardColor: HAIR_ES,
    accessoryColor: ACCESSORY_ES,
    topColor: TOP_ES,
    bottomColor: { '#3a4a7a': 'Vaquero', '#5a3a28': 'Marrón', '#1c1b3a': 'Negro', '#4f7f3f': 'Verde', '#5c5a7a': 'Gris', '#8a3f2c': 'Óxido', '#f1e6cf': 'Hueso', '#d4503a': 'Teja' },
    shoesColor: { '#7a4f35': 'Marrón', '#1c1b3a': 'Negro', '#f1e6cf': 'Hueso', '#d4503a': 'Teja', '#3e6fb0': 'Azul', '#f2b134': 'Azafrán' },
    trim: { '#f2b134': 'Azafrán', '#cfd6e6': 'Plateado', '#d4503a': 'Teja', '#4cb3c9': 'Laguna' },
  },
  en: {
    skin: { '#f6d9c0': 'Fair', '#f0c09a': 'Peach', '#d9a07a': 'Golden', '#a8714f': 'Tan', '#6b4430': 'Deep', '#4a2f22': 'Very deep' },
    eyes: { '#2a1a2e': 'Black', '#6b4430': 'Brown', '#b8864a': 'Hazel', '#4f7f3f': 'Green', '#3e6fb0': 'Blue', '#8a8a9a': 'Grey', '#7a3f8f': 'Violet' },
    hair: HAIR_EN,
    beardColor: HAIR_EN,
    accessoryColor: ACCESSORY_EN,
    topColor: TOP_EN,
    bottomColor: { '#3a4a7a': 'Denim', '#5a3a28': 'Brown', '#1c1b3a': 'Black', '#4f7f3f': 'Green', '#5c5a7a': 'Grey', '#8a3f2c': 'Rust', '#f1e6cf': 'Bone', '#d4503a': 'Tile red' },
    shoesColor: { '#7a4f35': 'Brown', '#1c1b3a': 'Black', '#f1e6cf': 'Bone', '#d4503a': 'Tile red', '#3e6fb0': 'Blue', '#f2b134': 'Saffron' },
    trim: { '#f2b134': 'Saffron', '#cfd6e6': 'Silvery', '#d4503a': 'Tile red', '#4cb3c9': 'Lagoon' },
  },
}

// Peinado y prenda con los que cada avatar empieza.
const BODY_DEFAULTS = {
  mujer: { hairStyle: 'largo', top: 'vestido' },
  hombre: { hairStyle: 'pixie', top: 'camiseta' },
}

export const DEFAULT_LOOK = {
  body: 'mujer',
  skin: '#f0c09a',
  eyes: '#2a1a2e',
  face: 'serena',
  hairStyle: 'largo',
  hair: '#8a3f2c',
  beard: 'ninguna',
  beardColor: '#5a3a28',
  accessory: 'ninguno',
  accessoryColor: '#f2b134',
  top: 'vestido',
  topColor: '#2f8f8b',
  bottom: 'pantalon',
  bottomColor: '#3a4a7a',
  shoes: 'botas',
  shoesColor: '#7a4f35',
  trim: '#f2b134',
}

// Cambiar de avatar no debe deshacer lo que la persona ya eligió: solo se cambian el peinado y la
// prenda si seguían siendo los de partida del avatar anterior.
export function switchBody(look, body) {
  if (look.body === body) return look
  const from = BODY_DEFAULTS[look.body]
  const to = BODY_DEFAULTS[body]
  return {
    ...look,
    body,
    hairStyle: look.hairStyle === from.hairStyle ? to.hairStyle : look.hairStyle,
    top: look.top === from.top ? to.top : look.top,
  }
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Al azar sin vello facial ni complemento: se eligen a propósito, no por sorteo.
export function randomLook() {
  const look = {}
  Object.keys(LOOK_OPTIONS).forEach((key) => {
    look[key] = pick(LOOK_OPTIONS[key])
  })
  look.beard = 'ninguna'
  look.accessory = 'ninguno'
  return look
}

export function isValidLook(look) {
  return !!look && Object.keys(LOOK_OPTIONS).every((key) => LOOK_OPTIONS[key].includes(look[key]))
}

// Peinados que ya no existen y el que los sustituye.
const HAIR_LEGACY = {
  recogido: 'rodete',
  corto: 'pixie',
  erizado: 'pixie',
  flequillo: 'bob',
  cola: 'colaAlta',
  trenza: 'trenzas',
  rizado: 'rizadoCorto',
}

// Traduce lo guardado antes de que la ropa se separara en prenda de arriba, de abajo y calzado, y
// antes de los doce peinados actuales.
function fromLegacy(look) {
  const next = { ...look }
  if (look.outfit) {
    next.top = look.outfit === 'falda' ? 'camiseta' : look.outfit === 'mono' ? 'peto' : look.outfit
    next.bottom = look.outfit === 'falda' ? 'falda' : 'pantalon'
  }
  if (look.dress) next.topColor = look.dress
  if (look.pants) next.bottomColor = look.pants
  if (look.top === 'chaqueta') next.top = 'vaquera'
  if (HAIR_LEGACY[look.hairStyle]) next.hairStyle = HAIR_LEGACY[look.hairStyle]
  return next
}

// Las viajeras guardadas antes de cada ampliación del creador tienen menos campos: se completan
// con los valores por defecto y conservan su aspecto. Devuelve null si lo que había no vale.
export function upgradeLook(look) {
  if (!look || typeof look !== 'object') return null
  const next = { ...DEFAULT_LOOK, ...fromLegacy(look) }
  const known = {}
  Object.keys(LOOK_OPTIONS).forEach((key) => {
    known[key] = next[key]
  })
  return isValidLook(known) ? known : null
}
