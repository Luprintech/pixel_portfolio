// Dibujo de la mascota de la viajera. La elección y su validación están en `../pet.js`.
import { catCanvas, catRestCanvas, khalessiCanvas, khalessiEatCanvas, khalessiScaredCanvas, khalessiSitCanvas, khalessiSleepCanvas } from './cats.js'
import { dogCanvas, dogRestCanvas } from './dogs.js'

export { khalessiCanvas, khalessiEatCanvas, khalessiScaredCanvas, khalessiSitCanvas, khalessiSleepCanvas }

// La mascota parada: 'sit' (sentada) o, solo los gatos, 'wash' (aseándose). `step` (0 o 1) alterna los dos fotogramas.
export function petRestCanvas(pet, pose, step = 0) {
  if (pet?.kind === 'gato') return catRestCanvas(pet.breed, pet.coat, pet.marks, pose, step)
  if (pet?.kind === 'perro') return dogRestCanvas(pet.breed, pet.coat, pet.marks, step)
  return null
}

// Sin mascota no hay dibujo: quien llama decide qué hacer con `null`. Cada raza tiene su propio
// tamaño de lienzo.
export function petCanvas(pet, frame = 0, tail = 0) {
  if (pet?.kind === 'gato') return catCanvas(pet.breed, pet.coat, pet.marks, frame, tail)
  if (pet?.kind === 'perro') return dogCanvas(pet.breed, pet.coat, pet.marks, frame, tail)
  return null
}
