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
| `clasico/` | La web original servida en `/clasico`, aislada: `ClasicoHome.jsx`, `components/`, `data/`, `hooks/` y `clasico.css` (todo bajo `.clasico-root`) |
| `game/` | El juego: `world.js` (mapa, sin Phaser), `ValleScene.js`, `boot.js`, `sprites.js`, `palette.js`, `look.js`, `titleArt.js` |
| `components/valle/` | UI del juego: `Content`, `Editor`, `Joystick`, `ZonePanel` |
| `lib/` | API (`publicApi.js`, `cmsApi.js`), textos (`valleCopy.js`), utilidades de posts y media |
| `hooks/` | `useProjects`, `usePost`, `useTheme`, etc. |
| `index.css`, `pixel.css` | Tokens y piezas de interfaz |
| `locales/`, `i18n.js` | Traducciones |

### Rutas públicas

`/` título · `/valle` juego · `/clasico` web original (portada aislada) · `/proyectos` · `/portfolio` · `/blog` · `/blog/:slug` · `/contacto` · `/politica-cookies` · `/politica-privacidad`

`/sobre-mi` y `/portfolio/desarrollo-web` redirigen a `/clasico#about` y `/proyectos`.

`/clasico` es la excepción a la capa visual del valle: carga de forma diferida su propio CSS y fuentes (`@fontsource`), y `App.jsx` oculta ahí la barra y el pie del sitio (la página trae los suyos) pero conserva el chatbot y el banner de cookies. Los proyectos salen igualmente de `useProjects`.

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
- **Khalessi:** `khalessiCanvas` y `khalessiSitCanvas` en `game/pets/cats.js` (lienzo de 26×16, de pie, sentada y aseándose). Solo sale en la portada, donde `game/titleCat.js` calcula sus rutas y juegos. No acompaña a la viajera ni sale en el creador: es la gata de Lupe.
- **Lupe:** solo existe en la portada. `game/lupe.js` es su aspecto (una combinación del generador de la viajera), `game/lupePoses.js` sus poses y `game/titleLife.js` el guion de lo que hace y dice. Dentro de la casa de Lupe hay NPC y diálogos (ver «Interiores y diálogos»); el resto del valle no tiene todavía.
- **Mascota del visitante:** `game/pet.js` valida la elección (gato o perro, raza y colores) y `game/pets/` la dibuja; se elige en el creador y se guarda en la partida.

### Portada (`/`)

Todo el movimiento y el guion son funciones puras del tiempo (y de una semilla por visita), sin canvas, para poder probarlos; el dibujo y el sonido solo los consumen.

- **Cielo y tiempo:** `game/titleSky.js` (hora del día, tiempo, bioma, rayos, lluvia) y `game/titleSkyPaint.js` (dibujo). `game/titleAutumn.js` genera una vez la versión de otoño del paisaje; `game/titleArt.js` compone cada fotograma a 320×180.
- **Vida:** `game/titleMotion.js` (nubes, pájaros, mariposas...), `game/titleCat.js` (rutas y juegos de Khalessi) y `game/titleLife.js` (guion de Lupe y Khalessi). El texto de cada frase sale de `lib/valleCopy.js`.
- **Bocadillos:** `components/valle/LupeBubble.jsx` es HTML sobre el canvas; `game/titleView.js` proyecta un punto de la escena a la pantalla.
- **Sonido:** `lib/soundMixer.js` guarda los volúmenes y el silencio y avisa a quien los usa; `lib/audioEngine.js` es el único `AudioContext`: un bus de música y otro de efectos desembocan en un nodo general (`master`) que es lo único que llega a la salida. Ahí viven el volumen general y el silencio, así que ningún sonido los esquiva; cada bus solo lleva su propio volumen (necesario en iPhone, donde `element.volume` no hace nada y el audio solo arranca dentro de un gesto). Por esos buses pasan `lib/backgroundMusic.js` (la pista única de la visita), `lib/ambience.js` (el ambiente, con Web Audio) y `lib/petSounds.js` (maullidos y ladridos como buffers). Los hooks `useBackgroundMusic` y `useSoundPrefs` los exponen a la interfaz.

### Personajes: propuesta futura (no implementada)

Resumen de lo que implicaría la mascota del visitante; las reglas de producto están en `docs/VISION.md` (sección 6.4) y no se repiten aquí.

- El bloque `pet` viviría dentro de la misma partida local y exigiría subir `SAVE_VERSION` a 2 con migración desde la versión 1.
- La mascota sería un módulo propio, separado de `catCanvas` (Khalessi) para que ambas no compartan código ni nombre.
- Seguimiento, interiores, diálogos y viaje rápido son comportamientos de `ValleScene.js` que dependen de que existan interiores y diálogos (fases 3 y 5 de la visión).
- CMS, API y base de datos no cambian: todo es del navegador.

## Interiores y diálogos

- **Salas:** `game/interiors.js` (puro) da el plano de cada sala; la mayoría es una sala vacía del tamaño del edificio y la casa de Lupe (`about`) tiene el suyo en `game/interior/homeLayout.js`. `game/InteriorScene.js` la dibuja (`interiorPaint.js` + `interior/roomDecor.js`), mueve a la viajera y calcula qué hay cerca. Una sala sin plano propio no monta nada más.
- **Muebles:** `game/interior/furniture/` es un catálogo `{ w, h, body, paint, frames?, ms? }` por tipo; `homeBuilder.js` los coloca (profundidad = fila de la base, colisiones por `body`, animación por fotogramas) y monta a Atreus y a Khalessi. Las piezas de dibujo no dependen de Phaser ni de React.
- **Interacciones:** `INTERACTIONS` en `homeLayout.js` (zonas de suelo y ancla). La escena publica `near` y, al usarlas, `talk` con el id de un guion; la azotea despierta el valle con `to: 'deck'`.
- **Diálogos:** `game/dialogue/engine.js` (máquina de estados pura), `scripts.js` (estructura, `TALKS` y `FEATURES`), `seen.js` (qué se ha visto, en `localStorage`), `lib/dialogueCopy.js` (textos es/en) y `components/valle/DialogueBox.jsx` (caja con retrato, texto progresivo, voz de `lib/dialogueSound.js` y opciones). `pages/Valle.jsx` guarda el guion abierto y bloquea el juego con `locked`.
- **Paneles:** el ordenador de Lupe abre `components/valle/RetroDesktop.jsx` (escritorio de Windows XP) al acabar `pc.abrir`; `game/desktop.js` lista sus accesos y oculta los que no tienen enlace verificado. «Jugar a la consola retro» (opción del diálogo de la estantería) abre `components/valle/ConsoleGame.jsx`.
- **Cámara de las salas:** `roomCover` (`viewport.js`) llena la pantalla y la cámara sigue a la viajera dentro de la sala.
- **Sentarse y acompañar:** `game/sitting.js` (sentarse en sillas, sofá y bancos, común a casa y valle) y `game/follower.js` (Lupe sigue a la viajera por el rastro de sus pasos). `game/sheetTexture.js` registra hojas de personaje.
- **Consola retro:** `game/retro/` es un juego aparte: `world.js` (salas), `logic.js` (paso puro, probado sin navegador), `sprites.js` y `render.js` (lienzo de 160×160); `ConsoleGame.jsx` lee teclas y pantalla táctil y lo hace avanzar. Sonidos en `lib/retroSound.js`, textos en `lib/retroCopy.js`.
- **Pose sentada:** `SIT_POSE` en `avatar/stance.js` (columna extra de la hoja, `SHEET_POSES`); `sitting.js` la usa sin recortes.
- **Modos de muebles y casa viva:** `modes` en el catálogo (`furniture/index.js`) y `modeFor` (`homeBuilder.js`) para la tele, la minicadena y la impresora pequeña; `interior/catBrain.js` mueve a Khalessi; `lib/jukebox.js` es el reproductor de música de la casa (minicadena y Winamp); `game/achievements.js` guarda los logros.
- **Programas de XP:** `components/valle/xp/` (Internet Explorer, Calculadora, Paint, Bloc de notas, Winamp) y `RetroDesktop.jsx` como gestor de ventanas.
- **De noche:** `interior/ledLights.js` dibuja las tiras led; la escena las enciende si el valle estaba a oscuras al entrar (`ValleScene.isNight`).

## Flujo de contenido

1. El CMS escribe en PostgreSQL y en `CONTENT_PATH`.
2. La web consume `GET /api/projects` y `GET /api/posts`.
3. `components/valle/Content.jsx` pinta ese contenido en el panel de zona del juego; la portada de `/clasico` lo pide con el mismo hook `useProjects`.

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
