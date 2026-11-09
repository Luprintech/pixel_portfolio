// Herramientas de dibujo en píxeles compartidas por sprites, terreno y portada.
// Sin dependencias de Phaser.

export const makeCanvas = (w, h) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

export const rect = (g, x, y, w, h, color) => {
  g.fillStyle = color
  g.fillRect(x, y, w, h)
}

export const dot = (g, x, y, color) => rect(g, Math.round(x), Math.round(y), 1, 1, color)

// Hash entero determinista: el mismo (x, y, semilla) da siempre el mismo valor en [0, 1).
export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1103515245)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// Ruido de valor suavizado: da las manchas de hierba y de tierra sin cuadrícula visible.
export function noise(x, y, scale, seed = 0) {
  const fx = x / scale
  const fy = y / scale
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const tx = fx - x0
  const ty = fy - y0
  const sx = tx * tx * (3 - 2 * tx)
  const sy = ty * ty * (3 - 2 * ty)
  const a = hash2(x0, y0, seed)
  const b = hash2(x0 + 1, y0, seed)
  const c = hash2(x0, y0 + 1, seed)
  const d = hash2(x0 + 1, y0 + 1, seed)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

// Contorno de color: cada borde sale del tono más oscuro de su vecino, así el sprite
// se separa del fondo sin el negro duro de antes.
export function outline(canvas, strength = 0.5) {
  const w = canvas.width
  const h = canvas.height
  const g = canvas.getContext('2d')
  const src = g.getImageData(0, 0, w, h)
  const out = g.createImageData(w, h)
  out.data.set(src.data)
  const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src.data[(y * w + x) * 4 + 3])
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha(x, y)) continue
      let best = -1
      let bestLight = Infinity
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (alpha(x + dx, y + dy) < 200) continue
        const i = ((y + dy) * w + (x + dx)) * 4
        const light = src.data[i] + src.data[i + 1] + src.data[i + 2]
        if (light < bestLight) {
          bestLight = light
          best = i
        }
      }
      if (best < 0) continue
      const i = (y * w + x) * 4
      out.data[i] = src.data[best] * strength
      out.data[i + 1] = src.data[best + 1] * strength * 0.98
      out.data[i + 2] = src.data[best + 2] * strength * 1.06
      out.data[i + 3] = 255
    }
  }
  g.putImageData(out, 0, 0)
  return canvas
}

// Contorno de un solo color (negro azulado) alrededor de lo que hay dibujado: es el de los
// personajes, para que se separen del fondo y de la ropa de cualquier color.
export function outlineSolid(canvas, color) {
  const w = canvas.width
  const h = canvas.height
  const g = canvas.getContext('2d')
  const src = g.getImageData(0, 0, w, h)
  const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src.data[(y * w + x) * 4 + 3] >= 200
  g.fillStyle = color
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (filled(x, y)) continue
      if (filled(x + 1, y) || filled(x - 1, y) || filled(x, y + 1) || filled(x, y - 1)) g.fillRect(x, y, 1, 1)
    }
  }
  return canvas
}

// Elipse rellena con píxeles enteros.
export function ellipse(g, cx, cy, rx, ry, color) {
  g.fillStyle = color
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx
      const dy = (y + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) g.fillRect(x, y, 1, 1)
    }
  }
}
