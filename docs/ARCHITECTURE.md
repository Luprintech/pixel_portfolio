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

### CMS (`/bitacora`)

Protegido por login. Subrutas: `inicio`, `posts`, `proyectos`, `imagenes`, `cv`, `chat`, `usuarios`, `mi-perfil`, con editores de posts y proyectos (Tiptap).

## El juego

- Phaser se importa de forma diferida desde `pages/Valle.jsx`, así el resto del sitio no paga su peso.
- La escena comunica con React mediante el `registry` de Phaser (`locked`, `joy`) y callbacks de cercanía a puertas.
- El mapa es datos puros en `world.js`: edificios, lago, caminos y árboles. Para mover o añadir una zona se edita ahí.
- Los sprites se dibujan por código en `sprites.js`; no hay hojas de imágenes externas.

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
