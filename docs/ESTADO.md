# Estado del proyecto

Registro vivo de lo hecho, lo pendiente y las decisiones tomadas. Se actualiza al cerrar cada bloque de trabajo: lo terminado pasa a "Hecho", lo que surge se anota en "Pendiente" y cada decisión con su motivo va en "Decisiones".

Última actualización: 2026-11-08.

## Hecho

### Rediseño visual: Valle del Bucle
- Nueva capa visual: overworld pixel art estilo Zelda con Phaser 3 en `/valle`, portada en `/` y modo clásico en HTML en `/clasico`.
- Casas para Sobre mí, Proyectos y Contacto, herrería para el Stack y mazmorra para el Blog. Se entra pisando la puerta.
- Protagonista con aspecto editable o aleatorio, joystick táctil en móvil y la gata Khalessi como compañera.
- Tokens de color y tipografía en `frontend/src/index.css` y piezas de interfaz en `pixel.css`; claro = Hueso, oscuro = Tinta.
- Páginas públicas, blog y chat pasados a tokens. El CMS conserva sus propios colores.

### Limpieza del diseño anterior
- Borrados los componentes de la web antigua (Expertise, TechSkills, TerminalWidget, ToolsGrid, InteractiveAvatar, FeaturedProjects, ReadingProgressBar), `design/tokens.js`, `data/` y los mockups de `frontend/docs`.
- Quitados los gradientes, halos y brillos fucsia/cian/violeta de las páginas públicas.
- Eliminado el CSS sin uso de `index.css` (de unos 25 KB a unos 18 KB).

### Código y comentarios
- Comentarios en inglés traducidos al español, banderines decorativos quitados y rayas largas sustituidas.

### Repositorio y flujo
- Repo nuevo con historial limpio: https://github.com/Luprintech/pixel_portfolio. El repo anterior (`mi-portfolio`) sigue en GitHub como archivo; en local es el remoto `legacy` y la rama `legacy-main`.
- Documentación de contexto: `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y este archivo.
- Tests al cierre de esta fecha: frontend 81 y backend 60, todos en verde; build y lint sin errores.

## Pendiente

### Estructura y calidad de código
- Modularizar los archivos más grandes: `components/cms/RichEditor.jsx` (más de 2.300 líneas), `components/cms/editor/extensions.jsx` y `pages/cms/BitacoraPostEditor.jsx`.
- Revisar con el mismo criterio el resto de comentarios en español: tono natural, explican el porqué.
- Revisar `console.warn` y `console.log` que queden con mensajes en inglés.
- Los saltos de línea del repo mezclan LF y CRLF (Git avisa en cada commit): añadir un `.gitattributes`.

### Funcionalidad
- Añadir `/clasico` al sitemap del backend (`backend/lib/sitemap.js`).
- Los sprites laterales y de espalda de la princesa son versiones simplificadas.
- Claves de i18n `expertise_*` en `frontend/src/locales/*/common.json`, probablemente sin uso tras borrar la página Expertise.
- Bloques del CMS `AudioPlayer.jsx` y `ChartsBlock.jsx`: no se importan en ningún sitio. Decidir si se conectan o se borran.
- El chunk del juego (`boot`) pesa unos 1,4 MB por Phaser; está cargado de forma diferida, pero conviene medirlo.

### Infraestructura
- No hay pipeline de despliegue ni CI. Valorar un workflow de GitHub Actions que ejecute build, lint y tests en cada PR.

## Decisiones

| Decisión | Motivo |
| --- | --- |
| Rediseño total con overworld Phaser más modo clásico | Quería un portfolio original y con personalidad propia, sin la estética genérica anterior. El modo clásico garantiza accesibilidad y SEO. |
| La arquitectura (CMS, blog, API, BD) no se toca | El cambio es solo de capa visual; el backend y el contenido funcionaban. |
| Contenido pintado una sola vez para ambos modos (`components/valle/Content.jsx`) | Evita duplicar datos y mantiene juego y modo clásico sincronizados. |
| Phaser 3.80.1 cargado de forma diferida solo en `/valle` | El resto del sitio no paga su peso. |
| Paleta: Tinta, Musgo, Prado, Laguna, Azafrán, Teja y Hueso; fuentes Jersey 10, Pixelify Sans y Literata | Paleta y tipografía aprobadas en el diseño; el detalle está en `frontend/docs/DESIGN.md`. |
| El CMS conserva sus colores fijos | Es una zona privada; solo recibe tokens para no romper el editor. |
| Se conservan los colores y gradientes de los bloques del blog (`lib/gradients.js`, botones y avisos del editor) | Son opciones que elige quien escribe cada post, no el tema de la web. |
| Repositorio nuevo con un único commit inicial | Partir de un historial limpio y dejar el repo anterior intacto como archivo. |
| Nunca se commitea directo a `main`; cada funcionalidad va en rama y PR, con squash | Historial ordenado y `main` siempre estable. Detalle en `CLAUDE.md`. |
| "mergea" solo si pasan todos los tests | Evita que `main` tenga fallos. |
| La autoría de commits y PRs es solo de Guadalupe | Todo el trabajo es suyo; sin líneas `Co-Authored-By` ni menciones a herramientas. |
| Comentarios del código en español y con tono natural | Que el código se lea como escrito por una persona. |
| `CLAUDE.md` y `AGENTS.md` viven dentro del repo | Para tener el contexto completo al trabajar desde otro ordenador. |
