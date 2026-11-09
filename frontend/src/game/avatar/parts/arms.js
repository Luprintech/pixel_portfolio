// Brazos. De frente y de espalda hay uno a cada lado del torso: la manga de la prenda se junta con
// él y, bajo el puño, una columna vacía (que el contorno cierra) lo separa. De perfil solo se ve
// uno, por delante del torso y entre dos líneas de contorno: no es un hueco en la camiseta sino un
// brazo colgando junto al costado, con su mano.
// `end` es la última fila del brazo: al caminar el que avanza se alarga y el que retrocede se acorta.
import { BODY_TOP } from '../stance.js'

export function paintArms(p, { view, g }, sleeve) {
  const side = view === 'side'
  g.arms.forEach((arm) => {
    const end = Math.max(arm.end, sleeve.len + 1)
    const at = (r) => BODY_TOP + r
    for (let r = 1; r <= end; r++) {
      arm.cols.forEach((x, i) => {
        let ch
        if (r < sleeve.len || (r === sleeve.len && !sleeve.cuff)) ch = side && i === 0 && sleeve.color === 'D' ? 'L' : sleeve.color
        else if (r === sleeve.len) ch = sleeve.cuff
        else ch = r === sleeve.len + 1 && i === arm.outer ? 's' : 'S'
        p.put(x, at(r), ch)
      })
      if (side) {
        p.put(arm.gap, at(r), 'X')
        p.put(arm.gapFar, at(r), 'X')
      } else if (r <= sleeve.len) {
        // Junto a la manga, el hueco entre brazo y torso se rellena con la sombra de la prenda.
        p.put(arm.gap, at(r), sleeve.color === 'D' ? 'M' : sleeve.color)
      }
    }
    if (side) arm.cols.forEach((x) => p.put(x, at(end + 1), 'X'))
  })
}
