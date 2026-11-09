// Un generador por tipo de edificio. Cada uno devuelve `{ canvas, doorCol, windows }`; los dibujos son
// funciones puras de su tipo y variante, así que se pueden pintar una vez por visita y reutilizar.
import { gallerySprite, librarySprite, schoolSprite, universitySprite } from './civic.js'
import { cottageSprite, friendsSprite, homeSprite, kioskSprite, musicSprite } from './homes.js'
import { barSprite, garageSprite, labSprite, shopSprite, workshopSprite } from './work.js'

const BUILDERS = {
  school: schoolSprite,
  gallery: gallerySprite,
  university: universitySprite,
  library: librarySprite,
  lab: labSprite,
  workshop: workshopSprite,
  garage: garageSprite,
  shop: shopSprite,
  bar: barSprite,
  home: homeSprite,
  friends: friendsSprite,
  music: musicSprite,
  cottage: cottageSprite,
  kiosk: kioskSprite,
}

export const buildingKinds = Object.keys(BUILDERS)

export function buildingSprite({ kind, variant = 0 }) {
  return BUILDERS[kind]({ variant })
}
