// Dónde cae un punto del mapa en la pantalla, en píxeles CSS del lienzo: lo que necesita un bocadillo (`WorldBubble.jsx`) para seguir a quien habla.
// Lo usan Lupe (`ValleNpcs.js`) y los vecinos del IES (`GranNeighbours.js`). Sin lógica de juego: solo la cuenta de la cámara.
export function screenAnchor(scene, x, y) {
  const camera = scene.cameras.main
  const { canvas } = scene.game
  const ratio = canvas.clientWidth / scene.scale.width
  return { x: (x - camera.worldView.x) * camera.zoom * ratio, y: (y - camera.worldView.y) * camera.zoom * ratio }
}
