// Mascota de la viajera: qué opciones hay, cómo se valida y cómo se llaman. Sin dibujo ni
// dependencias de React o Phaser; el dibujo está en `pets/`. Dónde se guarda vive en `save.js`.
// Khalessi no es una de ellas: es la gata de Lupe y no acompaña a la viajera.

export const PET_KINDS = ['ninguna', 'perro', 'gato']

export const PET_BREEDS = {
  perro: ['collie', 'pastor', 'beagle', 'husky', 'teckel'],
  gato: ['comun', 'persa', 'maine', 'sphynx', 'bengala'],
}

// Paletas de pelaje: el color principal y el de los detalles (manchas, hocico, patas, pecho).
// Son las mismas para todas las razas; cada raza decide dónde pone cada color.
export const PET_COLORS = {
  coat: ['#46414f', '#6e4428', '#8a5a3a', '#c8944c', '#e49a52', '#8c93a6', '#c9cbd6', '#f4efe3', '#e8b8a8'],
  marks: ['#f4efe3', '#eadbc0', '#c8944c', '#8a5a3a', '#2c2833', '#8c93a6'],
}

// Colores con los que cada raza aparece al elegirla.
const BREED_COLORS = {
  collie: { coat: '#46414f', marks: '#f4efe3' },
  pastor: { coat: '#c8944c', marks: '#2c2833' },
  beagle: { coat: '#c8944c', marks: '#f4efe3' },
  husky: { coat: '#8c93a6', marks: '#f4efe3' },
  teckel: { coat: '#8a5a3a', marks: '#c8944c' },
  comun: { coat: '#e49a52', marks: '#f4efe3' },
  persa: { coat: '#c9cbd6', marks: '#f4efe3' },
  maine: { coat: '#8a5a3a', marks: '#f4efe3' },
  sphynx: { coat: '#e8b8a8', marks: '#c8944c' },
  bengala: { coat: '#c8944c', marks: '#8a5a3a' },
}

export const DEFAULT_PET = { kind: 'ninguna', breed: null, coat: null, marks: null }

export const PET_NAMES = {
  es: {
    kinds: { ninguna: 'Sin mascota', perro: 'Perro', gato: 'Gato' },
    perro: { collie: 'Border collie', pastor: 'Pastor alemán', beagle: 'Beagle', husky: 'Husky', teckel: 'Teckel' },
    gato: { comun: 'Europeo común', persa: 'Persa', maine: 'Maine Coon', sphynx: 'Sphynx', bengala: 'Bengalí' },
    coat: {
      '#46414f': 'Negro', '#6e4428': 'Chocolate', '#8a5a3a': 'Marrón', '#c8944c': 'Canela', '#e49a52': 'Naranja',
      '#8c93a6': 'Gris', '#c9cbd6': 'Plata', '#f4efe3': 'Blanco', '#e8b8a8': 'Rosado',
    },
    marks: { '#f4efe3': 'Blanco', '#eadbc0': 'Crema', '#c8944c': 'Canela', '#8a5a3a': 'Marrón', '#2c2833': 'Negro', '#8c93a6': 'Gris' },
  },
  en: {
    kinds: { ninguna: 'No pet', perro: 'Dog', gato: 'Cat' },
    perro: { collie: 'Border collie', pastor: 'German Shepherd', beagle: 'Beagle', husky: 'Husky', teckel: 'Dachshund' },
    gato: { comun: 'Domestic shorthair', persa: 'Persian', maine: 'Maine Coon', sphynx: 'Sphynx', bengala: 'Bengal' },
    coat: {
      '#46414f': 'Black', '#6e4428': 'Chocolate', '#8a5a3a': 'Brown', '#c8944c': 'Tan', '#e49a52': 'Orange',
      '#8c93a6': 'Grey', '#c9cbd6': 'Silver', '#f4efe3': 'White', '#e8b8a8': 'Pink',
    },
    marks: { '#f4efe3': 'White', '#eadbc0': 'Cream', '#c8944c': 'Tan', '#8a5a3a': 'Brown', '#2c2833': 'Black', '#8c93a6': 'Grey' },
  },
}

// Al elegir una raza se parte de sus colores de siempre.
export function petOfBreed(kind, breed) {
  return { kind, breed, ...BREED_COLORS[breed] }
}

// Al cambiar de especie se parte de su primera raza; sin mascota no hay raza ni colores.
export function petOfKind(kind) {
  return kind === 'ninguna' ? DEFAULT_PET : petOfBreed(kind, PET_BREEDS[kind][0])
}

export function isValidPet(pet) {
  if (!pet || !PET_KINDS.includes(pet.kind)) return false
  if (pet.kind === 'ninguna') return pet.breed == null && pet.coat == null && pet.marks == null
  return PET_BREEDS[pet.kind].includes(pet.breed) && PET_COLORS.coat.includes(pet.coat) && PET_COLORS.marks.includes(pet.marks)
}

// Una partida sin mascota (o con una dañada) se queda sin ella, sin tirar el resto de la partida.
export function upgradePet(pet) {
  return isValidPet(pet) ? { kind: pet.kind, breed: pet.breed ?? null, coat: pet.coat ?? null, marks: pet.marks ?? null } : DEFAULT_PET
}
