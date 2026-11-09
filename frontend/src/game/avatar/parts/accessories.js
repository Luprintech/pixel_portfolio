// Complementos. Se pintan por encima del pelo y, salvo el gorro y la gorra, se suman sin quitar
// nada. Gorro y gorra sustituyen la parte de arriba del peinado (también lo que sobresale, como un
// moño). Lo que está en un solo lado de la cabeza (lazo, flor) solo se ve en el perfil que enseña
// ese lado, el izquierdo; el derecho lo deja en la otra cara, tapado.

// Devuelve el pelo con el complemento aplicado: `{ back, front }` de celdas `{ x, y, ch }`.
export function dressHair(look, { view, left }, hair) {
  const side = view === 'side'
  const front = hair.front.slice()
  let back = hair.back
  const add = (x, y, ch) => front.push({ x, y, ch })
  const rect = (x0, y0, x1, y1, ch) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) add(x, y, ch)
  }
  // Casquete del gorro o la gorra; la última columna de cada fila va en sombra.
  const dome = () => {
    const rows = side ? [[5, 10], [4, 12], [3, 13], [3, 13]] : [[5, 10], [4, 11], [3, 12], [3, 12]]
    rows.forEach(([a, b], y) => {
      rect(a, y, b - 1, y, 'A')
      add(b, y, 'a')
    })
  }
  const dropHairAbove = () => {
    front.splice(0, front.length, ...front.filter((c) => c.y > 3))
    back = back.filter((c) => c.y > 3)
  }

  switch (look.accessory) {
    case 'gafas':
      if (view === 'up') break
      if (view === 'down') {
        // Una montura de 4×5 por ojo: el blanco y la pupila quedan dentro, y un puente las une.
        ;[[3, 6], [9, 12]].forEach(([a, b]) => {
          rect(a, 5, b, 5, 'G')
          rect(a, 9, b, 9, 'G')
          ;[6, 7, 8].forEach((y) => {
            add(a, y, 'G')
            add(b, y, 'G')
          })
        })
        rect(7, 6, 8, 6, 'G')
      } else {
        rect(10, 4, 13, 4, 'G')
        rect(10, 8, 13, 8, 'G')
        ;[5, 6, 7].forEach((y) => {
          add(10, y, 'G')
          add(13, y, 'G')
        })
        rect(6, 5, 9, 5, 'G')
      }
      break
    case 'gafasSol':
      if (view === 'up') break
      if (view === 'down') {
        rect(3, 5, 6, 8, 'G')
        rect(9, 5, 12, 8, 'G')
        rect(7, 6, 8, 6, 'G')
        add(4, 5, 'W')
        add(10, 5, 'W')
      } else {
        rect(10, 4, 13, 7, 'G')
        rect(6, 5, 9, 5, 'G')
        add(11, 4, 'W')
      }
      break
    case 'lazo': {
      if (side && !left) break
      const x = side ? 4 : 10
      ;[[0, 1, 'A'], [1, 1, 'a'], [2, 1, 'A'], [0, 2, 'A'], [1, 2, 'a'], [2, 2, 'A']].forEach(([dx, y, ch]) => add(x + dx, y, ch))
      break
    }
    case 'flor': {
      if (side && !left) break
      const x = side ? 5 : 11
      add(x, 1, 'P')
      add(x - 1, 2, 'P')
      add(x + 1, 2, 'P')
      add(x, 3, 'P')
      add(x, 2, 'Y')
      break
    }
    case 'diadema':
      rect(3, 3, side ? 13 : 12, 3, 'A')
      break
    case 'gorro':
      dropHairAbove()
      dome()
      rect(3, 4, side ? 13 : 12, 4, 'T')
      rect(side ? 6 : 7, -2, side ? 7 : 8, -1, 'T')
      break
    case 'gorra':
      dropHairAbove()
      dome()
      rect(side ? 3 : view === 'up' ? 4 : 3, 4, side ? 15 : view === 'up' ? 11 : 12, 4, 'a')
      add(7, -1, 'a')
      break
    case 'pendientes':
      if (view === 'down') [[3, 9], [12, 9], [3, 10], [12, 10]].forEach(([x, y]) => add(x, y, 'A'))
      else if (side) [[9, 9], [9, 10]].forEach(([x, y]) => add(x, y, 'A'))
      break
    default:
  }
  return { back, front }
}
