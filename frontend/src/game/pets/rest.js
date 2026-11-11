// Postura de sentado de cualquier raza, sacada de su propia ficha: el cuerpo baja y las patas se acortan por arriba, así
// el animal se asienta sobre las ancas sin dibujar una ficha nueva por raza (la cabeza, la cola y los pies se quedan donde
// estaban). Pura: devuelve otra ficha para `drawPet`.
const shifted = (list, dy) => list?.map(([x, y, ...rest]) => [x, y + dy, ...rest])

export function sitSpec(spec) {
  // Cuánto se hunde el cuerpo: dos píxeles, o uno si las patas ya son muy cortas (teckel).
  const sink = Math.min(2, spec.legs.h - 1)
  return {
    ...spec,
    body: { ...spec.body, cy: spec.body.cy + sink },
    legs: { ...spec.legs, y: spec.legs.y + sink, h: spec.legs.h - sink },
    stripes: shifted(spec.stripes, sink),
    spots: shifted(spec.spots, sink),
    // Los detalles (pecho, parches) van sobre el cuerpo: se dibujan desplazados con él.
    details: spec.details && ((g, c, base) => {
      g.save()
      g.translate(0, sink)
      spec.details(g, c, base)
      g.restore()
    }),
  }
}
