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

// Peinados de cada avatar: los doce de su lámina de referencia, tres prestados del otro avatar para
// que la rejilla quede en 16 y `calvo` como último. Los que comparten las dos láminas (largo
// ondulado, rizado corto y moño) se dibujan igual en los dos.
const HAIR_STYLES_BY_BODY = {
  mujer: ['largo', 'pixie', 'bob', 'ondulado', 'rizadoCorto', 'voluminoso', 'colaAlta', 'colaBaja', 'coletas', 'trenzas', 'rodete', 'rapado', 'cortoClasico', 'mediaMelena', 'dePunta', 'calvo'],
  hombre: ['rasurado', 'cortoClasico', 'dePunta', 'flequilloLargo', 'rizadoCorto', 'afro', 'degradado', 'tupe', 'mediaMelena', 'ondulado', 'rodete', 'cresta', 'bob', 'pixie', 'colaBaja', 'calvo'],
}

export const LOOK_STYLES = {
  body: ['mujer', 'hombre'],
  face: [
    'serena', 'sonrisa', 'risa', 'guino', 'sorpresa', 'enfado', 'tristeza', 'llanto',
    'duda', 'sueno', 'verguenza', 'miedo', 'aburrimiento', 'ternura',
  ],
  hairStyle: [...new Set([...HAIR_STYLES_BY_BODY.mujer, ...HAIR_STYLES_BY_BODY.hombre])],
  trait: [
    'ninguno', 'incipiente', 'barbaCorta', 'barba', 'bigoteFino', 'bigote', 'perilla', 'patillas', 'cejas',
  ],
  accessory: [
    'ninguno', 'gafas', 'gafasRect', 'gafasSol', 'pendientes', 'aros', 'auriculares',
    'diadema', 'lazo', 'panuelo', 'gorra', 'gorro', 'sombreroPaja', 'sombreroBruja',
    'bufanda', 'corona', 'orejasGato',
  ],
  top: [
    'camiseta', 'oversize', 'tirantes', 'sudadera', 'cremallera', 'jersey', 'vaquera',
    'polo', 'chaleco', 'cardigan', 'vestido', 'vestidoTirantes', 'vestidoLargo', 'vestidoCamisero', 'peto',
  ],
  bottom: ['pantalon', 'cargo', 'ancho', 'pirata', 'shorts', 'falda', 'plisada', 'faldaLarga'],
  shoes: [
    'zapatillas', 'altas', 'botines', 'montana', 'botasAltas', 'lluvia',
    'bailarinas', 'sandalias', 'tacon',
  ],
}

// Lo que se enseña en cada campo de estilos: casi siempre toda la lista, pero el peinado depende del avatar.
export function styleChoices(field, look) {
  return field === 'hairStyle' ? HAIR_STYLES_BY_BODY[look.body] : LOOK_STYLES[field]
}

export const LOOK_OPTIONS = { ...LOOK_COLORS, ...LOOK_STYLES }

// Los vestidos y el peto son de una pieza: no se elige prenda de abajo, y en los vestidos tampoco su color.
const DRESSES = ['vestido', 'vestidoTirantes', 'vestidoLargo', 'vestidoCamisero']
const ONE_PIECE = [...DRESSES, 'peto']
// Los rasgos que se tiñen con el color del vello.
const HAIRY_TRAITS = ['incipiente', 'barbaCorta', 'barba', 'bigoteFino', 'bigote', 'perilla', 'patillas', 'cejas']
// Las gafas y los auriculares son de un solo color; el resto se tiñe.
const TINTED_ACCESSORIES = ['pendientes', 'aros', 'diadema', 'lazo', 'panuelo', 'gorra', 'gorro', 'sombreroPaja', 'sombreroBruja', 'bufanda', 'corona', 'orejasGato']
const hasBeard = (look) => HAIRY_TRAITS.includes(look.trait)
const hasHair = (look) => look.hairStyle !== 'calvo'
const hasAccessoryColor = (look) => TINTED_ACCESSORIES.includes(look.accessory)
const showsBottom = (look) => !ONE_PIECE.includes(look.top)
// El color de abajo también tiñe el peto, que lleva su propia tela sobre la camiseta.
const showsBottomColor = (look) => !DRESSES.includes(look.top)

// El creador se reparte en pestañas (cuerpo, ropa y mascota) y cada una en apartados, todos del mismo
// ancho. Dentro de un apartado todo sigue el mismo orden: primero las opciones dibujadas (`view` dice
// qué parte del cuerpo se recorta) y justo debajo sus colores (`colors`, con su condición `when`).
// Un campo sin `view` es solo de color (piel, ojos, ribetes). El avatar (mujer u hombre) no es un
// apartado: se elige bajo el nombre, porque cambia todo lo demás.
export const LOOK_TABS = ['body', 'clothes', 'pet']

export const LOOK_SECTIONS = [
  {
    id: 'face',
    tab: 'body',
    fields: [{ key: 'face', view: 'head' }, { key: 'skin' }, { key: 'eyes' }],
  },
  {
    id: 'hair',
    tab: 'body',
    fields: [{ key: 'hairStyle', view: 'hair', colors: [{ key: 'hair', when: hasHair }] }],
  },
  {
    id: 'traits',
    tab: 'body',
    fields: [{ key: 'trait', view: 'head', colors: [{ key: 'beardColor', when: hasBeard }] }],
  },
  {
    id: 'clothes',
    tab: 'clothes',
    fields: [
      { key: 'top', view: 'torso', colors: [{ key: 'topColor' }] },
      { key: 'bottom', view: 'legs', when: showsBottom, colors: [{ key: 'bottomColor', when: showsBottomColor }] },
      // Con peto no hay prenda de abajo que elegir, pero su tela sigue teniendo color.
      { key: 'bottomColor', when: (look) => !showsBottom(look) && showsBottomColor(look) },
      { key: 'shoes', view: 'feet', colors: [{ key: 'shoesColor' }] },
      { key: 'trim' },
    ],
  },
  {
    id: 'extras',
    tab: 'clothes',
    fields: [{ key: 'accessory', view: 'head', colors: [{ key: 'accessoryColor', when: hasAccessoryColor }] }],
  },
]

// Los campos de un apartado que se ven con este aspecto, ya con sus colores resueltos:
// `{ key, view, colors: [claves] }`. Lo usa el creador para pintar y las pruebas para comprobarlo.
export function visibleBlocks(section, look) {
  return section.fields
    .filter((field) => !field.when || field.when(look))
    .map((field) => ({
      key: field.key,
      view: field.view,
      colors: (field.colors ?? []).filter((color) => !color.when || color.when(look)).map((color) => color.key),
    }))
}

export const TAB_NAMES = {
  es: { body: 'Cuerpo', clothes: 'Ropa', pet: 'Mascota' },
  en: { body: 'Body', clothes: 'Clothes', pet: 'Pet' },
}

export const SECTION_NAMES = {
  es: { face: 'Rostro', hair: 'Pelo', traits: 'Rasgos faciales', extras: 'Complementos', clothes: 'Ropa' },
  en: { face: 'Face', hair: 'Hair', traits: 'Facial features', extras: 'Accessories', clothes: 'Clothes' },
}

export const LOOK_LABELS = {
  es: {
    body: 'Avatar',
    skin: 'Piel',
    eyes: 'Ojos',
    face: 'Expresión',
    hairStyle: 'Peinado',
    hair: 'Color de pelo',
    trait: 'Rasgo',
    beardColor: 'Color del vello y de las cejas',
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
    trait: 'Feature',
    beardColor: 'Hair and brow colour',
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
const CLOTHES_ES = {
  camiseta: 'Camiseta básica',
  oversize: 'Camiseta oversize',
  tirantes: 'Top sin mangas',
  sudadera: 'Sudadera con capucha',
  cremallera: 'Sudadera con zip',
  jersey: 'Jersey',
  vaquera: 'Chaqueta vaquera',
  polo: 'Polo',
  chaleco: 'Chaleco',
  cardigan: 'Cárdigan',
  vestido: 'Vestido casual',
  vestidoTirantes: 'Vestido de tirantes',
  vestidoLargo: 'Vestido largo',
  vestidoCamisero: 'Vestido camisero',
  peto: 'Peto vaquero',
  pantalon: 'Vaqueros rectos',
  cargo: 'Pantalón cargo',
  ancho: 'Pantalón ancho',
  pirata: 'Pantalón pirata',
  shorts: 'Pantalón corto',
  falda: 'Falda corta',
  plisada: 'Falda plisada',
  faldaLarga: 'Falda larga',
}
const CLOTHES_EN = {
  camiseta: 'Basic T-shirt',
  oversize: 'Oversized T-shirt',
  tirantes: 'Sleeveless top',
  sudadera: 'Hoodie',
  cremallera: 'Zip hoodie',
  jersey: 'Sweater',
  vaquera: 'Denim jacket',
  polo: 'Polo shirt',
  chaleco: 'Waistcoat',
  cardigan: 'Cardigan',
  vestido: 'Casual dress',
  vestidoTirantes: 'Pinafore dress',
  vestidoLargo: 'Long dress',
  vestidoCamisero: 'Shirt dress',
  peto: 'Denim overalls',
  pantalon: 'Straight jeans',
  cargo: 'Cargo trousers',
  ancho: 'Wide trousers',
  pirata: 'Capri trousers',
  shorts: 'Shorts',
  falda: 'Short skirt',
  plisada: 'Pleated skirt',
  faldaLarga: 'Long skirt',
}

export const STYLE_NAMES = {
  es: {
    mujer: 'Mujer',
    hombre: 'Hombre',
    serena: 'Neutral',
    sonrisa: 'Sonrisa',
    risa: 'Risa',
    guino: 'Guiño',
    sorpresa: 'Sorpresa',
    enfado: 'Enfado',
    tristeza: 'Tristeza',
    llanto: 'Llanto',
    duda: 'Duda',
    sueno: 'Sueño',
    verguenza: 'Vergüenza',
    miedo: 'Miedo',
    aburrimiento: 'Aburrimiento',
    ternura: 'Ternura',
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
    rasurado: 'Rapado',
    cortoClasico: 'Corto clásico',
    dePunta: 'De punta',
    flequilloLargo: 'Flequillo largo',
    afro: 'Afro',
    degradado: 'Degradado',
    tupe: 'Tupé',
    mediaMelena: 'Media melena',
    cresta: 'Cresta',
    calvo: 'Sin pelo',
    ninguno: 'Ninguno',
    incipiente: 'Barba incipiente',
    barbaCorta: 'Barba corta',
    barba: 'Barba completa',
    bigoteFino: 'Bigote fino',
    bigote: 'Bigote ancho',
    perilla: 'Perilla',
    patillas: 'Patillas',
    cejas: 'Cejas pobladas',
    gafas: 'Gafas redondas',
    gafasRect: 'Gafas cuadradas',
    gafasSol: 'Gafas de sol',
    pendientes: 'Pendientes pequeños',
    aros: 'Pendientes de aro',
    auriculares: 'Auriculares',
    diadema: 'Diadema',
    lazo: 'Lazo',
    panuelo: 'Pañuelo',
    gorra: 'Gorra',
    gorro: 'Gorro de lana',
    sombreroPaja: 'Sombrero de paja',
    sombreroBruja: 'Sombrero de bruja',
    bufanda: 'Bufanda',
    corona: 'Corona de princesa',
    orejasGato: 'Orejas de gato',
    ...CLOTHES_ES,
    zapatillas: 'Zapatillas básicas',
    altas: 'Zapatillas altas',
    botines: 'Botines',
    montana: 'Botas de montaña',
    botasAltas: 'Botas altas',
    lluvia: 'Botas de lluvia',
    bailarinas: 'Bailarinas',
    sandalias: 'Sandalias',
    tacon: 'Zapatos de tacón',
  },
  en: {
    mujer: 'Woman',
    hombre: 'Man',
    serena: 'Neutral',
    sonrisa: 'Smile',
    risa: 'Laughing',
    guino: 'Wink',
    sorpresa: 'Surprised',
    enfado: 'Angry',
    tristeza: 'Sad',
    llanto: 'Crying',
    duda: 'Doubtful',
    sueno: 'Sleepy',
    verguenza: 'Embarrassed',
    miedo: 'Fear',
    aburrimiento: 'Boredom',
    ternura: 'Tenderness',
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
    rasurado: 'Buzz cut',
    cortoClasico: 'Classic short',
    dePunta: 'Spiky',
    flequilloLargo: 'Long fringe',
    afro: 'Afro',
    degradado: 'Fade',
    tupe: 'Quiff',
    mediaMelena: 'Shoulder length',
    cresta: 'Mohawk',
    calvo: 'No hair',
    ninguno: 'None',
    incipiente: 'Stubble',
    barbaCorta: 'Short beard',
    barba: 'Full beard',
    bigoteFino: 'Thin moustache',
    bigote: 'Thick moustache',
    perilla: 'Goatee',
    patillas: 'Sideburns',
    cejas: 'Thick eyebrows',
    gafas: 'Round glasses',
    gafasRect: 'Rectangular glasses',
    gafasSol: 'Sunglasses',
    pendientes: 'Stud earrings',
    aros: 'Hoop earrings',
    auriculares: 'Headphones',
    diadema: 'Headband',
    lazo: 'Bow',
    panuelo: 'Bandana',
    gorra: 'Cap',
    gorro: 'Wool beanie',
    sombreroPaja: 'Straw hat',
    sombreroBruja: 'Witch hat',
    bufanda: 'Scarf',
    corona: 'Princess crown',
    orejasGato: 'Cat ears',
    ...CLOTHES_EN,
    zapatillas: 'Basic sneakers',
    altas: 'High-top sneakers',
    botines: 'Ankle boots',
    montana: 'Hiking boots',
    botasAltas: 'Tall boots',
    lluvia: 'Rain boots',
    bailarinas: 'Ballet flats',
    sandalias: 'Sandals',
    tacon: 'Heels',
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

// Nombre del color elegido: el de su paleta o, si lo eligió con el selector personalizado, "Personalizado".
// Un color propio se nombra con su código, para que se pueda saber cuál es sin verlo.
export function colorName(lang, field, value) {
  return COLOR_NAMES[lang][field]?.[value] ?? `${CUSTOM_COLOR_NAME[lang]} ${value.toUpperCase()}`
}

const CUSTOM_COLOR_NAME = { es: 'Personalizado', en: 'Custom' }

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
  hombre: { hairStyle: 'cortoClasico', top: 'camiseta' },
}

export const DEFAULT_LOOK = {
  body: 'mujer',
  skin: '#f0c09a',
  eyes: '#2a1a2e',
  face: 'serena',
  hairStyle: 'largo',
  hair: '#8a3f2c',
  trait: 'ninguno',
  beardColor: '#5a3a28',
  accessory: 'ninguno',
  accessoryColor: '#f2b134',
  top: 'vestido',
  topColor: '#2f8f8b',
  bottom: 'pantalon',
  bottomColor: '#3a4a7a',
  shoes: 'botines',
  shoesColor: '#7a4f35',
  trim: '#f2b134',
}

export function defaultLook(body) {
  return { ...DEFAULT_LOOK, ...BODY_DEFAULTS[body], body }
}

// Cada avatar guarda su propio aspecto: lo que se cambia en uno no toca al otro. Al elegir un
// avatar se recupera lo que ya se le había hecho, o su aspecto de partida si aún no se ha tocado.
export function selectBody(bodyLooks, body) {
  return bodyLooks[body] ?? defaultLook(body)
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Al azar sin rasgos faciales ni complemento: se eligen a propósito, no por sorteo. El peinado sale
// de los del avatar, para que un hombre no estrene uno de la lámina de mujer.
export function randomLook() {
  const look = {}
  Object.keys(LOOK_OPTIONS).forEach((key) => {
    look[key] = pick(LOOK_OPTIONS[key])
  })
  look.hairStyle = pick(styleChoices('hairStyle', look))
  look.trait = 'ninguno'
  look.accessory = 'ninguno'
  return look
}

// Cualquier color #rrggbb es válido en un campo de color (el selector personalizado del creador);
// los campos de estilo solo admiten los de su lista. El formato estricto evita que un valor
// manipulado en el almacenamiento llegue al dibujo con otra forma.
export const isHexColor = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)

export function isValidLook(look) {
  return (
    !!look &&
    Object.keys(LOOK_OPTIONS).every((key) => LOOK_OPTIONS[key].includes(look[key]) || (key in LOOK_COLORS && isHexColor(look[key])))
  )
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

// Estilos de antes de las láminas de referencia y el que los sustituye: `beard` pasó a `trait`,
// la tímida es la vergüenza. Las opciones retiradas (rasgos, calzado, camisa, complementos) pasan a la más parecida.
const FACE_LEGACY = { timida: 'verguenza', concentracion: 'serena', picardia: 'sonrisa' }
const TRAIT_LEGACY = { ninguna: 'ninguno' }
const TRAIT_REMOVED = ['pecas', 'pecasMuchas', 'lunarMejilla', 'lunarLabio', 'cejaPartida', 'cicatrizCeja', 'cicatrizMejilla']
const ACCESSORY_LEGACY = { flor: 'ninguno', piercing: 'ninguno', horquillas: 'ninguno', boina: 'gorro' }
const SHOES_LEGACY = {
  botas: 'botines',
  deportivas: 'zapatillas',
  lona: 'zapatillas',
  clasicos: 'tacon',
  mocasines: 'bailarinas',
  merceditas: 'bailarinas',
  chanclas: 'sandalias',
  aventura: 'botasAltas',
}
const TOP_LEGACY = { camisa: 'polo' }

// Traduce lo guardado antes de que la ropa se separara en prenda de arriba, de abajo y calzado, de
// los doce peinados actuales y de las láminas de rostro, complementos y calzado.
function fromLegacy(look) {
  const next = { ...look }
  if ('beard' in look) next.trait = TRAIT_LEGACY[look.beard] ?? look.beard
  if (TRAIT_REMOVED.includes(next.trait)) next.trait = 'ninguno'
  if (TOP_LEGACY[next.top]) next.top = TOP_LEGACY[next.top]
  if (FACE_LEGACY[look.face]) next.face = FACE_LEGACY[look.face]
  if (ACCESSORY_LEGACY[look.accessory]) next.accessory = ACCESSORY_LEGACY[look.accessory]
  if (SHOES_LEGACY[look.shoes]) next.shoes = SHOES_LEGACY[look.shoes]
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
