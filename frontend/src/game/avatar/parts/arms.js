// Brazos. De frente y de espalda hay uno a cada lado del torso: la manga de la prenda se junta con
// él y, bajo el puño, una columna vacía (que el contorno cierra) lo separa. De perfil solo se ve
// uno, por delante del torso y entre dos franjas de sombra: no es un hueco en la camiseta sino un
// brazo colgando junto al costado, con su mano.
// `end` es la última fila del brazo: al caminar el que avanza se alarga y el que retrocede se acorta.
import { BODY_TOP } from '../stance.js'

export function paintArms(p, { view, g }, sleeve) {
  const side = view === 'side'
  g.arms.forEach((arm) => {
    // De perfil el brazo mide lo mismo que de frente: la mano cuelga junto a la cadera, por delante
    // del dobladillo, como una mano pegada al costado.
    const end = Math.max(arm.end, sleeve.len + 1)
    const at = (r) => BODY_TOP + r
    for (let r = 1; r <= end; r++) {
      // La última fila de una mano de dos filas o más pierde la columna interior: la esquina
      // redondeada separa la mano del puño y evita el taco de piel de antes.
      const roundedTip = r === end && r > sleeve.len + 1
      arm.cols.forEach((x, i) => {
        if (roundedTip && i !== arm.outer) return
        // La manga es más ancha que la mano: de perfil la tercera columna no baja de la manga.
        if (i >= 2 && r > sleeve.len) return
        let ch
        if (r < sleeve.len || (r === sleeve.len && !sleeve.cuff)) ch = side && i === 0 && sleeve.color === 'D' ? 'L' : sleeve.color
        else if (r === sleeve.len) ch = sleeve.cuff
        // Brazo y mano en dos tonos: la cara que da al cuerpo en sombra, y la muñeca bajo la manga también.
        else ch = r === sleeve.len + 1 || i !== arm.outer ? 's' : 'S'
        p.put(x, at(r), ch)
      })
      if (side) {
        // Solo la manga proyecta sombra sobre el torso, a los dos lados; la mano se recorta sola.
        if (r < sleeve.len) {
          p.put(arm.gap, at(r), 'M')
          p.put(arm.gapFar, at(r), 'M')
        }
      } else if (r <= sleeve.len) {
        // Junto a la manga, el hueco entre brazo y torso se rellena con la sombra de la prenda.
        p.put(arm.gap, at(r), sleeve.color === 'D' ? 'M' : sleeve.color)
      }
    }
  })
}
