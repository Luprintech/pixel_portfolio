// Dibujo de la mascota de la viajera. La elección y su validación están en `../pet.js`.
import { catCanvas, khalessiCanvas, khalessiScaredCanvas, khalessiSitCanvas } from './cats.js'
import { dogCanvas } from './dogs.js'

export { khalessiCanvas, khalessiScaredCanvas, khalessiSitCanvas }

// Sin mascota no hay dibujo: quien llama decide qué hacer con `null`. Cada raza tiene su propio
// tamaño de lienzo.
export function petCanvas(pet, frame = 0, tail = 0) {
  if (pet?.kind === 'gato') return catCanvas(pet.breed, pet.coat, pet.marks, frame, tail)
  if (pet?.kind === 'perro') return dogCanvas(pet.breed, pet.coat, pet.marks, frame, tail)
  return null
}
