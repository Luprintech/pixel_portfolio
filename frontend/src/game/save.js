// Partida guardada en el navegador. Es una sola clave versionada: si el formato cambia,
// se sube `version` y se migra aquí, sin que el resto del código se entere.
import { upgradeLook } from './look.js'
import { DEFAULT_PET, upgradePet } from './pet.js'
import { clearScores } from './arcade/scores.js'
import { clearWallet } from './arcade/wallet.js'
import { clearAchievements } from './achievements.js'
import { clearSeen } from './dialogue/seen.js'
import { migrateWorld, sanitizeWorld } from './worldSave.js'
import { initialStory, recoverStory, sanitizeStory } from './story/story.js'

const SAVE_KEY = 'valle-del-bucle:save'
// Clave de antes del creador de personaje: solo guardaba el aspecto, sin nombre.
const LEGACY_LOOK_KEY = 'valle-del-bucle:look'
// Versión 2: añade la mascota. Versión 3: añade el nombre de la mascota. Versión 4: añade el estado del valle
// (hora y posición). Versión 5: añade la historia (bienvenida, visita guiada y conversaciones escuchadas). Las partidas
// anteriores se leen igual: sin mascota, sin nombre de mascota, empezando en la entrada y con la bienvenida de Lupe pendiente.
// Versión 6: el valle gana una franja al norte (el Ayuntamiento); la posición guardada antes se baja con ella.
// Versión 7: el valle gana ocho columnas por el oeste; la posición guardada antes se desplaza a la derecha con ellas.
export const SAVE_VERSION = 7
export const NAME_MAX = 16

// Deja solo letras, números, espacios, guion y apóstrofo, sin espacios repetidos ni sobrantes.
// El nombre se pinta en pantalla y nunca se envía a ningún servidor.
export function sanitizeName(value) {
  return String(value ?? '')
    .replace(/[^\p{L}\p{N} '-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim()
}

// El nombre de la mascota solo existe si hay mascota; se limpia igual que el de la viajera.
function petNameFor(pet, value) {
  return pet.kind === 'ninguna' ? '' : sanitizeName(value)
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Devuelve { version, name, look, pet, petName, story, world? } o null si no hay partida o está dañada. `world` (hora del
// valle y posición, ver worldSave.js) solo está si se guardó y es válido.
export function loadSave() {
  const saved = readJson(SAVE_KEY)
  if (saved && [1, 2, 3, 4, 5, 6, SAVE_VERSION].includes(saved.version)) {
    const look = upgradeLook(saved.look)
    if (look) {
      const pet = upgradePet(saved.pet)
      const world = sanitizeWorld(migrateWorld(saved.world, saved.version))
      // Una visita guiada "en curso" no se reanuda: se recupera como pendiente (ver `recoverStory`).
      const story = recoverStory(sanitizeStory(saved.story) ?? initialStory())
      return { version: SAVE_VERSION, name: sanitizeName(saved.name), look, pet, petName: petNameFor(pet, saved.petName), story, ...(world && { world }) }
    }
  }
  const legacy = upgradeLook(readJson(LEGACY_LOOK_KEY))
  return legacy ? { version: SAVE_VERSION, name: '', look: legacy, pet: DEFAULT_PET, petName: '', story: initialStory() } : null
}

// Devuelve si se pudo guardar: sin almacenamiento (modo privado, cuota llena) la partida dura solo esta visita.
export function writeSave({ name, look, pet = DEFAULT_PET, petName = '', world, story }) {
  try {
    const save = { version: SAVE_VERSION, name: sanitizeName(name), look, pet, petName: petNameFor(pet, petName), world: sanitizeWorld(world) ?? undefined, story: sanitizeStory(story) ?? initialStory() }
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    localStorage.removeItem(LEGACY_LOOK_KEY)
    return true
  } catch {
    return false
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY)
    localStorage.removeItem(LEGACY_LOOK_KEY)
  } catch {
    // Nada que borrar si el navegador no deja acceder al almacenamiento.
  }
  // Las conversaciones ya vistas son parte de la partida: borrarla vuelve a presentar a cada personaje.
  clearSeen()
  clearAchievements()
  // Las mejores puntuaciones de la recreativa también son de la partida.
  clearScores()
  // Y también las monedas: borrar la partida devuelve a la viajera sus seis monedas iniciales.
  clearWallet()
}
