// Vello facial: se pinta sobre la cara y la mandíbula, y no existe de espalda. Los estilos son
// bigote, patillas, perilla y barba; de perfil se dibujan sobre las columnas de la cara (de la 10
// a la 13).
export function paintFacialHair(p, { look, view }) {
  const style = look.beard
  if (style === 'ninguna' || view === 'up') return
  const paint = (y, cols) => cols.forEach((x) => p.put(x, y, 'K'))

  if (view === 'down') {
    if (style === 'bigote') return paint(9, [6, 7, 8, 9])
    if (style === 'patillas') return [7, 8, 9, 10].forEach((y) => paint(y, [3, 12]))
    if (style === 'perilla') {
      paint(11, [7, 8])
      return paint(12, [6, 7, 8, 9])
    }
    paint(8, [3, 12])
    paint(9, [3, 12])
    paint(10, [3, 4, 5, 6, 9, 10, 11, 12])
    paint(11, [4, 5, 6, 7, 8, 9, 10, 11])
    return paint(12, [6, 7, 8, 9])
  }

  if (style === 'bigote') return paint(9, [12, 13])
  if (style === 'patillas') return [7, 8, 9].forEach((y) => paint(y, [10]))
  if (style === 'perilla') {
    paint(11, [12, 13])
    return paint(12, [11, 12])
  }
  paint(8, [10])
  paint(9, [10, 12, 13])
  paint(10, [10, 11, 13])
  paint(11, [10, 11, 12, 13])
  paint(12, [10, 11, 12])
}
