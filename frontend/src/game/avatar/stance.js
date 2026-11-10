// Dónde va cada miembro según la vista, el cuerpo y la pose. Es lo único que cambia al girar o al
// caminar: las partes (`parts/`) pintan lo que esta geometría les dice y no saben de poses.
//
// Poses: 0 reposo y 1 y 2 los dos pasos. En un paso un pie se levanta (o se adelanta, de perfil) y
// el brazo contrario se balancea; de frente y de espalda el cuerpo, además, se hunde un píxel (`bob`).
//
// Filas del cuerpo, contadas desde la fila 13 de la figura (`BODY_TOP`): r0 hombros, r1 a r5 torso,
// r6 dobladillo, r7 a r9 cadera, r10 y r11 piernas, r12 caña de la bota, r13 pie y r14 suela.
export const POSES = 3
export const BODY_TOP = 13
const BOB = 1

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
    bob: pose ? BOB : 0,
    sway: 0,
    headDx: 0,
  }
}

// Perfil derecho: el torso es casi tan hondo como la cabeza y solo se ve un brazo. Hay siempre dos
// piernas: la cercana y, detrás, la lejana en sombra. Cada pierna es una lista de desplazamientos,
// uno por fila desde el muslo (r9) hasta el tobillo (r12): en reposo las dos bajan rectas y la
// lejana asoma una columna por detrás; al caminar la que avanza se inclina hacia delante y la que
// retrocede hacia atrás, las dos con el pie en el suelo y una columna libre entre las botas. La
// pierna tiene las mismas filas en todas las poses, así que no cambia de largo.
const SIDE_REST = [0, 0, 0, 0]
const SIDE_AHEAD = [0, 1, 2, 3]
const SIDE_BEHIND = [-1, -2, -3, -4]

// De perfil la cabeza se dibuja una columna más atrás: centrada en las columnas 3 a 13 quedaba una por
// delante del torso y la barbilla sobresalía del pecho. Con este desplazamiento ocupa las 2 a 12.
const SIDE_HEAD_DX = -1

// Columnas que se desplaza el brazo de perfil al caminar. El brazo tiene tres columnas y un borde de
// sombra a cada lado (`gap` y `gapFar`): con dos columnas y un solo borde era una tira que se fundía
// con la camiseta. Más de una columna de balanceo sacaría el borde fuera del torso.
const SIDE_SWING = 1

function sideLegs(pose) {
  if (pose === 0) return [{ far: true, lean: SIDE_REST.map((dx) => dx - 1) }, { far: false, lean: SIDE_REST }]
  const ahead = { lean: SIDE_AHEAD }
  const behind = { lean: SIDE_BEHIND }
  // En el paso 1 avanza la pierna cercana; en el 2, la lejana.
  return pose === 1
    ? [{ ...behind, far: true }, { ...ahead, far: false }]
    : [{ ...ahead, far: true }, { ...behind, far: false }]
}

function sideStance(male, pose) {
  const torso = male ? { l: 3, r: 11 } : { l: 4, r: 11 }
  // El brazo va al revés que la pierna cercana: atrás cuando ella avanza y adelante cuando retrocede.
  const swing = pose === 1 ? -SIDE_SWING : pose === 2 ? SIDE_SWING : 0
  return {
    torso,
    shoulders: torso,
    hip: { l: torso.l, r: 11 },
    centre: [7, 8, 9],
    arms: [{ cols: [6 + swing, 7 + swing, 8 + swing], gap: 5 + swing, gapFar: 9 + swing, outer: 0, end: REST_ARM_END }],
    legs: sideLegs(pose),
    // De perfil el cuerpo no se hunde: con las piernas inclinadas el paso ya se lee y la figura
    // mantiene la misma altura en las tres poses.
    bob: 0,
    // Al dar un paso la pierna que avanza empuja el dobladillo de faldas y vestidos hacia delante.
    sway: pose ? 1 : 0,
    headDx: SIDE_HEAD_DX,
  }
}

export function stance({ view, male, pose }) {
  return view === 'side' ? sideStance(male, pose) : frontStance(male, pose)
}
