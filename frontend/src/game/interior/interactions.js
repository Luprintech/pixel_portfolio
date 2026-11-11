// Qué se puede usar desde unos pies en (x, y): común a todas las salas con plano propio. Cada interacción tiene zonas (suelo desde
// el que se alcanza) y un ancla que desempata cuando hay dos a la vez; con `facing` se descartan las que exigen mirar a otro lado.
export function pickInteraction(interactions, x, y, facing = null) {
  const inside = interactions.filter(
    ({ zones, faces }) => (!faces || !facing || faces === facing) && zones.some((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h),
  )
  const distance = ({ anchor }) => Math.hypot(anchor.x - x, anchor.y - y)
  return inside.sort((a, b) => distance(a) - distance(b))[0]?.id ?? null
}
