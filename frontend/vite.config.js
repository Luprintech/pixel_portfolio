import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Paquetes agrupados en chunks de vendor. Se usa una función y no un objeto a propósito: con el
// objeto, Rollup aloja en estos chunks los helpers internos de Vite (la precarga de rutas y el
// interop de React) y la entrada acaba descargando el editor y mermaid en la web pública.
// Mermaid y pdf.js no se agrupan a mano: Rollup ya los separa porque se cargan de forma diferida.
const VENDOR_CHUNKS = {
  'react-vendor': ['react', 'react-dom', 'react-router-dom', 'use-sync-external-store'],
  'animation-vendor': ['framer-motion'],
  'icons-vendor': ['react-icons'],
  'editor-vendor': [
    '@tiptap/react',
    '@tiptap/starter-kit',
    '@tiptap/core',
    '@tiptap/extension-character-count',
    '@tiptap/extension-code-block-lowlight',
    '@tiptap/extension-color',
    '@tiptap/extension-highlight',
    '@tiptap/extension-image',
    '@tiptap/extension-link',
    '@tiptap/extension-placeholder',
    '@tiptap/extension-subscript',
    '@tiptap/extension-superscript',
    '@tiptap/extension-table',
    '@tiptap/extension-table-cell',
    '@tiptap/extension-table-header',
    '@tiptap/extension-table-row',
    '@tiptap/extension-text-align',
    '@tiptap/extension-text-style',
    '@tiptap/extension-underline',
    '@tiptap/extension-youtube',
    'lowlight',
    'highlight.js',
  ],
}

const ENTRY_HELPERS = ['vite/preload-helper.js', 'vite/modulepreload-polyfill.js', 'commonjsHelpers.js']

function manualChunks(id) {
  // Helpers virtuales de Vite y Rollup: la entrada los necesita siempre, así que van con React
  if (ENTRY_HELPERS.some(helper => id.endsWith(helper))) return 'react-vendor'

  const marker = 'node_modules/'
  const normalized = id.replaceAll('\\', '/')
  const index = normalized.lastIndexOf(marker)
  if (index === -1) return undefined

  const parts = normalized.slice(index + marker.length).split('/')
  const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
  return Object.keys(VENDOR_CHUNKS).find(chunk => VENDOR_CHUNKS[chunk].includes(pkg))
}

// Codespaces define CODESPACES=true en el entorno del contenedor
const inCodespace = process.env.CODESPACES === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  build: {
    // Mejoras de performance
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
    // Optimizaciones adicionales
    chunkSizeWarningLimit: 1000, // Aumentar límite para chunks grandes
    minify: 'esbuild', // Usar esbuild (incluido en Vite)
    target: 'es2015', // Compatibilidad con navegadores modernos
  },

  // Optimización de servidor de desarrollo
  server: {
    port: 5173,
    // Túneles HTTPS para probar la instalación de la app en el móvil y la URL de los puertos
    // de Codespaces: Vite rechaza por defecto cualquier nombre de host que no conozca
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.loca.lt', '.app.github.dev'],
    // En el Codespace no hay navegador que abrir. Y la página llega por HTTPS en el puerto 443:
    // sin clientPort, el cliente de recarga en caliente buscaría el 5173 en esa URL y fallaría.
    open: !inCodespace,
    hmr: inCodespace ? { clientPort: 443 } : undefined,
    // Proxy solo en desarrollo: redirige /api/ al backend local
    // En producción esto no existe; nginx.docker.conf hace el proxy
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
