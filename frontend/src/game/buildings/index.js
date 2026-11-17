// Un generador por tipo de edificio. Cada uno devuelve `{ canvas, doorCol, windows }`; los dibujos son
// funciones puras de su tipo y variante, así que se pueden pintar una vez por visita y reutilizar.
import { gallerySprite } from './artes.js'
import { librarySprite } from './civic.js'
import { cpifpSprite } from './turing.js'
import { iesSprite } from './ies.js'
import { universitySprite } from './university.js'
import { mosqueSprite } from './mosque.js'
import { ayuntamientoSprite } from './ayuntamiento.js'
import { homeSprite, kioskSprite } from './homes.js'
import { patioSprite } from './patio.js'
import { barSprite } from './barMihrab.js'
import { shopSprite } from './copos.js'
import { garageSprite } from './race.js'

const BUILDERS = {
  gallery: gallerySprite,
  university: universitySprite,
  mosque: mosqueSprite,
  city: ayuntamientoSprite,
  library: librarySprite,
  cpifp: cpifpSprite,
  ies: iesSprite,
  garage: garageSprite,
  shop: shopSprite,
  bar: barSprite,
  home: homeSprite,
  patio: patioSprite,
  kiosk: kioskSprite,
}

export const buildingKinds = Object.keys(BUILDERS)

export function buildingSprite({ kind, variant = 0 }) {
  return BUILDERS[kind]({ variant })
}
