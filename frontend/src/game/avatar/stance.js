// Dónde va cada miembro según la vista, el cuerpo y la pose. Es lo único que cambia al girar o al
// caminar: las partes (`parts/`) pintan lo que esta geometría les dice y no saben de poses.
//
// Poses: 0 reposo y 1 y 2 los dos pasos. En un paso un pie se levanta (o se adelanta, de perfil) y
// el brazo contrario se balancea; el cuerpo, además, se hunde un píxel (`BOB`).
//
// Filas del cuerpo, contadas desde la fila 13 de la figura (`BODY_TOP`): r0 hombros, r1 a r5 torso,
// r6 dobladillo, r7 a r9 cadera, r10 y r11 piernas, r12 caña de la bota, r13 pie y r14 suela.
export const POSES = 3
export const BODY_TOP = 13
export const BOB = 1

export const FOOT_ROW = 13
export const SOLE_ROW = 14
export const LEG_TOP = 10

const REST_ARM_END = 6

// Frente y espalda: dos brazos a los lados del torso, cada uno separado de él por una columna.
function frontStance(male, pose) {
  const torso = male ? { l: 4, r: 11 } : { l: 5, r: 10 }
  const shoulders = male ? { l: 2, r: 13 } : { l: 3, r: 12 }
  const arms = male
    ? [{ cols: [1, 2], gap: 3, outer: 0 }, { cols: [13, 14], gap: 12, outer: 1 }]
    : [{ cols: [2, 3], gap: 4, outer: 0 }, { cols: [12, 13], gap: 11, outer: 1 }]
  // El brazo que avanza se alarga una fila y el otro se acorta.
  const reach = [pose === 1 ? -1 : pose === 2 ? 1 : 0, pose === 1 ? 1 : pose === 2 ? -1 : 0]
  arms.forEach((arm, i) => (arm.end = REST_ARM_END + reach[i]))
  return {
    torso,
    shoulders,
    hip: { l: 4, r: 11 },
    centre: [7, 8],
    arms,
    legs: [
      { cols: [5, 6], out: -1, lift: pose === 1 ? 1 : 0 },
      { cols: [9, 10], out: 1, lift: pose === 2 ? 1 : 0 },
    ],
  }
}

// Perfil derecho: el torso es casi tan hondo como la cabeza y solo se ve un brazo y una pierna. Al
// caminar aparece la otra pierna, atrasada, y la que estaba delante pasa a hacer de la de atrás.
function sideStance(male, pose) {
  const torso = male ? { l: 3, r: 11 } : { l: 4, r: 11 }
  const swing = pose === 1 ? -1 : pose === 2 ? 1 : 0
  let legs = [{ dx: 0, far: false }]
  if (pose === 1) legs = [{ dx: -2, far: true }, { dx: 1, far: false }]
  if (pose === 2) legs = [{ dx: 1, far: true }, { dx: -2, far: false }]
  return {
    torso,
    shoulders: torso,
    hip: { l: torso.l, r: 11 },
    centre: [7, 8, 9],
    arms: [{ cols: [7 + swing, 8 + swing], gap: 6 + swing, gapFar: 9 + swing, outer: 0, end: REST_ARM_END }],
    legs,
  }
}

export function stance({ view, male, pose }) {
  return view === 'side' ? sideStance(male, pose) : frontStance(male, pose)
}
