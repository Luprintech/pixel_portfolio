import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

// Vitest se ejecuta desde frontend/ (igual que clasico.css.test.js).
const here = resolve(process.cwd(), 'src/clasico')

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.(jsx?|css)$/.test(name) ? [path] : []
  })

// El tema del juego (Aventura y Cozy) vive en <html data-game-theme> solo mientras se ve la portada o el valle;
// /clasico es la web original y no debe leerlo ni usar sus tokens ni sus clases.
describe('/clasico no depende del tema del juego', () => {
  it('ningún archivo de clasico/ menciona el tema del juego ni sus piezas', () => {
    const forbidden = /data-game-theme|GameTheme|gameTheme|--t-|\bpx-(btn|frame|title|dialog)/
    const offenders = files(here).filter((path) => forbidden.test(readFileSync(path, 'utf8')))
    expect(offenders).toEqual([])
  })
})
