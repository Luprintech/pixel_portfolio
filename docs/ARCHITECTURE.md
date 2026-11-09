# Arquitectura

Visión general. Las reglas de trabajo y los comandos están en `AGENTS.md`; el diseño visual en `frontend/docs/DESIGN.md`; el estado y las decisiones en `docs/ESTADO.md`.

## Capas

```
Navegador ── SPA React + Vite (frontend/) ── /api ──> Express (backend/) ──> PostgreSQL
                                                            └──> CONTENT_PATH (imágenes, documentos, audio)
```

Modelo MVC general, no estricto: el frontend es la vista, el backend lleva la lógica y el acceso a datos, y el CMS es una capa que gestiona contenido por encima de ambos.

## Frontend (`frontend/src`)

| Carpeta | Contenido |
| --- | --- |
| `routes/AppRoutes.jsx` | Todas las rutas |
| `pages/` | Páginas públicas; `pages/cms/` para `/bitacora` |
| `game/` | El juego: `world.js` (mapa, sin Phaser), `ValleScene.js`, `boot.js`, `sprites.js`, `palette.js`, `look.js`, `titleArt.js` |
| `components/valle/` | UI del juego: `Content`, `Editor`, `Joystick`, `ZonePanel` |
| `lib/` | API (`publicApi.js`, `cmsApi.js`), textos (`valleCopy.js`), utilidades de posts y media |
| `hooks/` | `useProjects`, `usePost`, `useTheme`, etc. |
| `index.css`, `pixel.css` | Tokens y piezas de interfaz |
| `locales/`, `i18n.js` | Traducciones |

### Rutas públicas

`/` título · `/valle` juego · `/clasico` modo clásico · `/proyectos` · `/portfolio` · `/blog` · `/blog/:slug` · `/contacto` · `/politica-cookies` · `/politica-privacidad`

`/sobre-mi` y `/portfolio/desarrollo-web` redirigen a `/clasico#sobre-mi` y `/proyectos`.

### Editor de posts

`components/cms/RichEditor.jsx` monta el editor Tiptap y reparte el trabajo en `components/cms/editor/`:

- `toolbar/groups/` y `panels/`: la barra de herramientas y los paneles (código, tabla, Markdown, vista previa, estado).
- `image/`, `video/`, `audio/`, `callout/`, `mermaid/` y `tables/`: un módulo por tipo de nodo, con su vista y su extensión.
- `blocks/` y `extensions.jsx`: bloques especiales del blog (encuestas, líneas de tiempo, citas...).
- `editorExtensions.js`, `pasteUtils.js` y `hooks/`: configuración y lógica compartida.

### CMS (`/bitacora`)

Protegido por login. Subrutas: `inicio`, `posts`, `proyectos`, `imagenes`, `cv`, `chat`, `usuarios`, `mi-perfil`, con editores de posts y proyectos (Tiptap).

## El juego

- Phaser se importa de forma diferida desde `pages/Valle.jsx`, así el resto del sitio no paga su peso.
- La escena comunica con React mediante el `registry` de Phaser (`locked`, `joy`) y callbacks de cercanía a puertas.
- El mapa es datos puros en `world.js`: edificios, lago, caminos y árboles. Para mover o añadir una zona se edita ahí.
- Los sprites se dibujan por código en `sprites.js`; no hay hojas de imágenes externas.

### Personajes: arquitectura actual (comprobada el 2026-11-09)

- **Viajera:** `game/look.js` define las opciones y valida el aspecto (`upgradeLook` completa partidas antiguas). El dibujo sale de un único generador, `game/avatar/`, que usan el creador, la portada y el juego:
  - `stance.js` da la geometría según vista, cuerpo y pose (0 reposo, 1 y 2 los dos pasos); es lo único que cambia al girar o caminar.
  - `parts/` tiene una función por parte: `head`, `face`, `facialHair`, `hair` (peinados), `body` (prendas de arriba), `arms`, `legs` (piernas y cadera), `shoes` y `accessories`. Cada una pinta en su sitio de la rejilla de 16×28 (`grid.js`, con cuatro filas libres encima de la cabeza).
  - `compose.js` apila las partes, hunde el cuerpo un píxel en los pasos, añade el contorno y devuelve una matriz de letras, sin canvas ni Phaser. Frente, perfil derecho y espalda tienen dibujo propio; el perfil izquierdo es el derecho reflejado salvo en lo asimétrico (guiño, rapado lateral, lazo y flor), que se dibuja desde el lado que enseña.
  - `palette.js` resuelve cada letra a un color del aspecto; `paint.js` y `sheet.js` son lo único que usa canvas: `avatarCanvas` pinta un fotograma y `avatarSheet` una hoja de 3 poses × 4 direcciones (lienzo de cada fotograma 18×34). `ValleScene.js` registra esa hoja como una textura con un fotograma por pose y dirección y recorre `WALK_CYCLE` al andar.
  El creador es `components/valle/Editor.jsx`; `game/sprites.js` ya no dibuja a la viajera.
- **Partida:** `game/save.js` guarda `{ version, name, look }` en `localStorage` (`valle-del-bucle:save`, versión 1) y migra la clave anterior `valle-del-bucle:look`.
- **Khalessi:** `catCanvas` en `game/sprites.js` (lienzo de 26×16). Se usa en la portada (`titleMotion.js` y `titleArt.js`), en la vista previa del creador y en el valle, donde `ValleScene.js` la hace seguir a la viajera con un rastro de posiciones. Ese seguimiento en el valle y su aparición en el creador chocan con la decisión de que Khalessi es la gata de Lupe, no la mascota del visitante; el cambio está pendiente en `docs/ESTADO.md`.
- **Lupe:** no existe en el código; no hay NPC ni sistema de diálogo todavía.
- **Mascota del visitante:** no existe.

### Personajes: propuesta futura (no implementada)

Resumen de lo que implicaría la mascota del visitante; las reglas de producto están en `docs/VISION.md` (sección 6.4) y no se repiten aquí.

- El bloque `pet` viviría dentro de la misma partida local y exigiría subir `SAVE_VERSION` a 2 con migración desde la versión 1.
- La mascota sería un módulo propio, separado de `catCanvas` (Khalessi) para que ambas no compartan código ni nombre.
- Seguimiento, interiores, diálogos y viaje rápido son comportamientos de `ValleScene.js` que dependen de que existan interiores y diálogos (fases 3 y 5 de la visión).
- CMS, API y base de datos no cambian: todo es del navegador.

## Flujo de contenido

1. El CMS escribe en PostgreSQL y en `CONTENT_PATH`.
2. La web consume `GET /api/projects` y `GET /api/posts`.
3. `components/valle/Content.jsx` pinta ese contenido una sola vez para el juego y el modo clásico.

`frontend/public/projects.json` y `posts/index.json` son solo el seed inicial, importado si la BD está vacía.

## Backend (`backend`)

- `server.js` arranca; `app.js` monta rutas y estáticos.
- `routes/`: `auth`, `posts`, `projects`, `images`, `contact`, `chat`, `chatStats`, `ogMeta`, `publicContent`, `users`.
- `config/paths.js` (rutas reales de contenido, respeta `CONTENT_PATH`) y `config/cors.js`.
- `lib/sitemap.js` regenera `sitemap.xml` al crear, editar o borrar posts.
- Tests con Vitest + Supertest.

## Despliegue

`docker-compose.yml` levanta frontend (Nginx, `nginx.conf`) y backend con volumen compartido. No hay pipeline de despliegue automatizado.

## Zonas delicadas

Ver la sección homónima de `AGENTS.md`: sitemap, `CONTENT_PATH`, SMTP del contacto y Gemini del chat.
