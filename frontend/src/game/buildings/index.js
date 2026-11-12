// Un generador por tipo de edificio. Cada uno devuelve `{ canvas, doorCol, windows }`; los dibujos son
// funciones puras de su tipo y variante, así que se pueden pintar una vez por visita y reutilizar.
import { gallerySprite, instituteSprite, librarySprite, universitySprite } from './civic.js'
import { mosqueSprite } from './mosque.js'
import { cottageSprite, friendsSprite, homeSprite, kioskSprite } from './homes.js'
import { barSprite, garageSprite, shopSprite } from './work.js'

const BUILDERS = {
  gallery: gallerySprite,
  university: universitySprite,
  mosque: mosqueSprite,
  library: librarySprite,
  institute: instituteSprite,
  garage: garageSprite,
  shop: shopSprite,
  bar: barSprite,
  home: homeSprite,
  friends: friendsSprite,
  cottage: cottageSprite,
  kiosk: kioskSprite,
}

export const buildingKinds = Object.keys(BUILDERS)

export function buildingSprite({ kind, variant = 0 }) {
  return BUILDERS[kind]({ variant })
}
