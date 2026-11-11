// El proyecto ficticio `luprintech-portfolio` que se abre en el Visual Studio Code del escritorio: sus archivos (con código
// coherente con este portfolio), el resaltado de sintaxis, la vista previa de la tarjeta de prueba y los comandos de la
// terminal. Todo es puro y no ejecuta nada: la vista previa solo lee dos constantes del código y la terminal solo entiende
// unas pocas órdenes. Sin React.
export const PROJECT = 'luprintech-portfolio'

export const FILES = {
  'src/App.jsx': `import { useState } from 'react'
import './index.css'

// Tarjeta de bienvenida del Valle del Bucle. Cambia el nombre o el color
// y mira la vista previa de abajo.
const name = 'Lupe'
const color = '#f2b134'

export default function App() {
  const [likes, setLikes] = useState(0)

  return (
    <main className="card" style={{ borderColor: color }}>
      <h1>Hola, {name}</h1>
      <p>Bienvenida al Valle del Bucle.</p>
      <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>
    </main>
  )
}
`,
  'src/index.css': `/* Tokens del Valle del Bucle: paleta propia y sombras duras. */
:root {
  --px-ink: #1c1b3a;
  --px-bone: #f1e6cf;
  --px-saffron: #f2b134;
}

body {
  margin: 0;
  background: var(--px-bone);
  color: var(--px-ink);
  font-family: monospace;
}

.card {
  border: 4px solid;
  padding: 1rem;
  box-shadow: 4px 4px 0 var(--px-ink);
}

button {
  background: var(--px-saffron);
  border: 0;
  box-shadow: 0 4px 0 var(--px-ink);
}
`,
  'package.json': `{
  "name": "luprintech-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "test": "vitest run",
    "hello": "echo Hello, Developer!"
  },
  "dependencies": {
    "phaser": "^3.80.1",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.5",
    "swr": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "eslint": "^9.36.0",
    "vite": "^7.1.7",
    "vitest": "^4.1.1"
  }
}
`,
  'README.md': `# luprintech-portfolio

Portfolio de Guadalupe Cano (Luprintech): una SPA en React y Vite con un
overworld en pixel art hecho con Phaser, una API en Express y un CMS privado.

## Scripts

- \`npm run dev\`: arranca el servidor de desarrollo.
- \`npm run build\`: genera la versión de producción.
- \`npm run test\`: pasa las pruebas.
- \`npm run hello\`: dice hola a quien lee el código.

## Estructura

- \`src/App.jsx\`: la tarjeta de bienvenida.
- \`src/index.css\`: los tokens y la paleta.
`,
}

export const ORDER = ['src/App.jsx', 'src/index.css', 'package.json', 'README.md']
export const languageOf = (path) => ({ jsx: 'js', js: 'js', css: 'css', json: 'json', md: 'md' })[path.split('.').pop()] ?? 'text'

// --- Resaltado ---------------------------------------------------------------------------------------------------------
const GRAMMAR = {
  js: [
    ['comment', /\/\/.*$/],
    ['string', /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/],
    ['keyword', /\b(?:import|from|export|default|const|let|return|function|if|else|new)\b/],
    ['tag', /<\/?[A-Za-z][\w.]*|\/?>/],
    ['number', /\b\d+(?:\.\d+)?\b/],
  ],
  css: [
    ['comment', /\/\*.*?\*\/|\/\*.*$/],
    ['string', /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/],
    ['number', /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%)?/],
    ['prop', /--?[\w-]+(?=\s*:)|[a-z-]+(?=\s*:)/],
    ['tag', /[.#]?[a-zA-Z][\w-]*(?=\s*\{)|:root/],
  ],
  json: [
    ['prop', /"(?:[^"\\]|\\.)*"(?=\s*:)/],
    ['string', /"(?:[^"\\]|\\.)*"/],
    ['number', /-?\b\d+(?:\.\d+)?\b/],
    ['keyword', /\b(?:true|false|null)\b/],
  ],
  md: [
    ['keyword', /^#+ .*$/],
    ['string', /`[^`]*`/],
    ['tag', /^- /],
  ],
  text: [],
}

// Trocea una línea en `{ cls, text }`: lo que no reconoce la gramática queda como `plain`. Gana la coincidencia que empieza antes.
export function highlightLine(lang, line) {
  const rules = GRAMMAR[lang] ?? []
  const parts = []
  let rest = line
  while (rest.length) {
    let best = null
    rules.forEach(([cls, regex]) => {
      const match = rest.match(regex)
      if (match && match[0] && (!best || match.index < best.index)) best = { cls, index: match.index, text: match[0] }
    })
    if (!best) {
      parts.push({ cls: 'plain', text: rest })
      break
    }
    if (best.index) parts.push({ cls: 'plain', text: rest.slice(0, best.index) })
    parts.push({ cls: best.cls, text: best.text })
    rest = rest.slice(best.index + best.text.length)
  }
  return parts
}

export const highlight = (lang, text) => text.split('\n').map((line) => highlightLine(lang, line))

// --- Vista previa ----------------------------------------------------------------------------------------------------
// Lee del código de `App.jsx` solo el nombre y el color de la tarjeta, con valores seguros; el resto del código no se ejecuta.
export function parsePreview(source) {
  const name = source.match(/const name = ['"]([^'"\n]{0,24})['"]/)?.[1]
  const color = source.match(/const color = ['"](#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20})['"]/)?.[1]
  return { name: name ?? '', color: color ?? '#1c1b3a' }
}

// --- Terminal --------------------------------------------------------------------------------------------------------
export const HELLO = 'Hello, Developer!'
export const PROMPT = `${PROJECT} $`

const VITE = ['> vite', '', '  VITE v7.1.7  ready in 410 ms', '', '  ➜  Local:   http://localhost:5173/']
const BUILD = ['> vite build', 'transformando módulos…', '✓ construido en 5,8 s']

// Ejecuta una orden de la terminal sobre los archivos actuales y devuelve `{ lines, clear?, unlock?, preview? }`. Solo entiende
// `help`, `ls`, `cat`, `clear` y `npm run <script>`; de los scripts, solo los `echo` y los de arranque y construcción simulados.
export function runCommand(input, files) {
  const text = input.trim()
  if (!text) return { lines: [] }
  const [command, ...args] = text.split(/\s+/)
  if (command === 'help') return { lines: ['help  ls  cat <archivo>  clear', 'npm run <script>'] }
  if (command === 'clear') return { lines: [], clear: true }
  if (command === 'ls') {
    if (args[0] === 'src') return { lines: ['App.jsx  index.css'] }
    return args[0] ? { lines: [`ls: no se puede acceder a '${args[0]}'`] } : { lines: ['src  package.json  README.md'] }
  }
  if (command === 'cat') {
    const path = args[0]
    return path in files ? { lines: files[path].split('\n') } : { lines: [`cat: ${path ?? ''}: No existe el archivo`] }
  }
  if (command === 'npm' && args[0] === 'run' && args[1]) {
    let scripts
    try {
      scripts = JSON.parse(files['package.json']).scripts ?? {}
    } catch {
      return { lines: ['npm ERR! package.json no es un JSON válido'] }
    }
    const script = scripts[args[1]]
    if (script === undefined) return { lines: [`npm ERR! Missing script: "${args[1]}"`] }
    const echo = script.match(/^echo\s+(.*)$/)
    if (echo) {
      const out = echo[1].replace(/^(['"])(.*)\1$/, '$2')
      return { lines: [`> ${PROJECT}@1.0.0 ${args[1]}`, '', out], unlock: out.trim() === HELLO ? 'developer' : undefined }
    }
    if (args[1] === 'dev') return { lines: VITE, preview: true }
    if (args[1] === 'build') return { lines: BUILD }
    return { lines: [`> ${PROJECT}@1.0.0 ${args[1]}`, '(simulado)'] }
  }
  return { lines: [`bash: ${command}: orden no encontrada`] }
}
