// Objetos altos por los que se puede pasar por detrás (la estatua de la fuente de la plaza): si alguien queda detrás y el
// objeto le tapa buena parte de la figura, el objeto se aclara para que se le vea. Vale para la viajera y para los NPC. La
// imagen, sus versiones de estación y lo que va encima (los surtidores) van juntos en un contenedor, porque el cielo ya maneja
// la opacidad de cada versión (el fundido de otoño e invierno) y el contenedor la multiplica sin pisarla. Sin estado de juego.

// Opacidad del objeto con alguien oculto detrás, y cuánto tarda en llegar a ella (ms).
const FADED = 0.55
const FADE_MS = 220
// Parte de la figura que tiene que quedar tapada para aclarar: pasar rozando un lado no cuenta.
const HIDDEN_SHARE = 0.35

// Acerca `from` a `to` como mucho `step` (los dos entre 0 y 1).
export const approach = (from, to, step) => (from < to ? Math.min(to, from + step) : Math.max(to, from - step))

// Rectángulo que ocupa una figura de Phaser (con su origen y su escala) y la fila de sus pies.
export function figureBox({ x, y, displayWidth, displayHeight, originX = 0.5, originY = 1 }) {
  const l = x - originX * displayWidth
  const t = y - originY * displayHeight
  return { l, r: l + displayWidth, t, b: t + displayHeight }
}

// ¿Queda la figura detrás del objeto (sus pies más arriba que la base, así que se dibuja antes) y tapada en buena parte por la
// zona opaca alta (`area`, medida desde el punto de apoyo como los cuerpos sólidos)?
export function isHidden(box, { px, py, area }) {
  if (box.b >= py) return false
  const w = Math.min(box.r, px + area.r) - Math.max(box.l, px + area.l)
  const h = Math.min(box.b, py + area.b) - Math.max(box.t, py + area.t)
  if (w <= 0 || h <= 0) return false
  return (w * h) / ((box.r - box.l) * (box.b - box.t)) >= HIDDEN_SHARE
}

export default class SeeThrough {
  constructor(scene) {
    this.scene = scene
    this.items = []
  }

  add(image, px, py, area, extras = []) {
    const group = this.scene.add.container(0, 0, [image, ...image.seasonImages, ...extras]).setDepth(py)
    this.items.push({ group, px, py, area })
  }

  // `figures`: la viajera, su mascota y los NPC que andan por el valle (los que no están a la vista no cuentan).
  update(figures, delta) {
    const step = delta / FADE_MS
    const boxes = figures.filter((figure) => figure?.visible && figure.active !== false).map(figureBox)
    this.items.forEach((item) => {
      const target = boxes.some((box) => isHidden(box, item)) ? FADED : 1
      if (item.group.alpha !== target) item.group.setAlpha(approach(item.group.alpha, target, step))
    })
  }
}
