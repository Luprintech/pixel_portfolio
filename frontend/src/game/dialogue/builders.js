// Piezas para escribir guiones (`scripts.js`, `tourScripts.js`): una página por cada clave `<id>.<n>` y una opción con su acción.
export const lines = (who, id, count) => Array.from({ length: count }, (_, i) => ({ who, text: `${id}.${i + 1}` }))
export const option = (id, label, extra) => ({ id, label, ...extra })
