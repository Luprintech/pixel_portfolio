// Color de una familia del tema "valle" (variables --t-* de index.css) con el de siempre como
// alternativa: en el modo noche esas variables no existen y se pinta lo de antes, sin tocar nada más.
export const tone = (name, fallback) => `var(--t-${name}, ${fallback})`
