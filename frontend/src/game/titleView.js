import { TITLE_H, TITLE_W } from './titleArt.js'

// La portada se pinta en 320×180 y la pantalla la recorta con `object-fit: cover` y una posición de
// objeto. Con esto se sabe dónde cae en pantalla un punto de la escena, para colocar encima los
// bocadillos de diálogo.
export const OBJECT_POSITION = [0.72, 1]

export function sceneToScreen({ width, height }, { x, y }, [px, py] = OBJECT_POSITION) {
  const scale = Math.max(width / TITLE_W, height / TITLE_H)
  return {
    x: (width - TITLE_W * scale) * px + x * scale,
    y: (height - TITLE_H * scale) * py + y * scale,
    scale,
  }
}
