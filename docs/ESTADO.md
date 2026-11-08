# Estado del proyecto

Registro vivo de lo hecho, lo pendiente y las decisiones tomadas. Se actualiza al cerrar cada bloque de trabajo: lo terminado pasa a "Hecho", lo que surge se anota en "Pendiente" y cada decisión con su motivo va en "Decisiones".

Última actualización: 2026-11-08 (menús de la barra del editor).

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

### Modularización del editor de posts
- `components/cms/RichEditor.jsx` pasó de 3.296 a unas 740 líneas sin cambiar su comportamiento.
- Imagen, vídeo, audio, avisos, diagramas Mermaid y tablas viven ahora en módulos propios bajo `components/cms/editor/`.
- La barra de herramientas y los paneles (código, tabla, Markdown, vista previa, estado) son componentes independientes en `editor/toolbar/groups/` y `editor/panels/`.
- La lista de extensiones, la limpieza del HTML pegado y el cálculo de menús flotantes salieron a `editorExtensions.js`, `pasteUtils.js` y `hooks/useFloatingMenus.js`.
- Nueva prueba `RichEditor.test.jsx` con el documento cargado y una instantánea de la barra de herramientas, para detectar cambios no intencionados al reorganizar.

### Modularización de las extensiones del editor
- `editor/extensions.jsx` (unas 2.350 líneas) se dividió en `editor/extensions/`: un módulo por bloque (`lineHeight`, `accordion`, `contentButton`, `documentAttachment`, `imageGrid`, `videoGallery`, `gif`) y un `index.js` que reexporta todo, así que los imports existentes no cambian.
- `joinClassNames`, que compartían tres bloques, vive en `extensions/classNames.js`.
- Tests (84), lint y build sin cambios respecto a antes.

### Modularización de la página del editor de posts
- `pages/cms/BitacoraPostEditor.jsx` pasó de 1.090 a unas 430 líneas: la página conserva el estado, la carga, el autoguardado y el envío; el resto salió a módulos.
- Interfaz en `components/cms/postEditor/`: cabecera, metadatos, portada, opciones (destacado y TOC), revisiones, SEO, etiquetas, aviso y cargador.
- Lógica en `lib/postEditorForm.js` (formulario inicial, conversión post a formulario, etiquetas, palabras) y `lib/postDrafts.js` (borradores en localStorage); hooks `useToast` y `useCoverUpload`.
- La carga de un post y la restauración de una revisión comparten ahora `postToForm`, antes eran dos copias del mismo bloque.
- Pruebas nuevas: `BitacoraPostEditor.test.jsx` (render, slug automático, post publicado) y `postEditorForm.test.js`. Frontend pasa a 95 tests.

### Limpieza menor
- `editorExtensions.js` configura `link` desde `StarterKit` y ya no registra `Link` y `Underline` por separado: desaparece el aviso de Tiptap por extensiones duplicadas y el HTML generado es el mismo.
- Añadido `.gitattributes` (`* text=auto`, y CRLF para los `.cmd`) y normalizados a LF los 21 archivos que estaban con CRLF o mezclados. Es un cambio solo de saltos de línea, sin tocar contenido.

### Dependencias y textos sin uso
- Quitadas las dependencias directas `@tiptap/extension-link` y `@tiptap/extension-underline`: `StarterKit` ya las incluye. Siguen en la lista de `editor-vendor` de `vite.config.js` para que continúen en el mismo chunk.
- Borradas las 32 claves `about.expertise_*` de los dos idiomas, que quedaron sin uso al eliminar la página Expertise.
- `/clasico` ya estaba en el sitemap del backend.

### Hooks del editor rico
- `RichEditor.jsx` pasó de 743 a unas 480 líneas, la mayoría ya JSX. La lógica se repartió en `editor/hooks/`: `useMediaUploads` (imagen, audio, documento y biblioteca), `useTextColor`, `useSelectionFormat`, `useSlashMenu` y `usePinnedTools`.
- El efecto de la barra fija al hacer scroll pasó a `useFloatingMenus`, que ya tenía su estado; el selector de tipo de bloque a `editor/blockCommands.js`.
- Prueba nueva de `blockCommands`.

### Paneles del botón CTA y del Image Grid
- `contentButton.jsx` pasó de 671 a unas 260 líneas: el panel de personalización vive en `ContentButtonPanel.jsx` y los colores y configuraciones guardadas (localStorage) en `contentButtonPresets.js`, con el hook `useCtaPresets`.
- `imageGrid.jsx` pasó de 592 a unas 375 líneas: opciones del bloque y edición por imagen en `ImageGridPanel.jsx`; `imageGridOrder.js` guarda el reordenado.

### Vista de imagen del editor
- `image/ResizableImageView.jsx` pasó de 645 a unas 210 líneas. La lógica de anotaciones (estado, dibujo, arrastre de textos y del panel) vive en `useImageAnnotations.js`, la posición de la barra en `useImageToolbarPosition.js`, y la interfaz en `ImageToolbar.jsx` y `TextAnnotationPanel.jsx`. La vista conserva el redimensionado, el pie de foto y el render.

### Menús de la barra del editor
- Los 10 booleanos de menús abiertos de `RichEditor.jsx` (enlace, imagen, YouTube, audio, colores, resaltado, avisos, Mermaid, emojis, insertar y colores de tabla) se sustituyeron por el hook `editor/hooks/useToolbarMenus.js`, que guarda solo el nombre del menú abierto. Ya no hace falta que cada botón cierre a mano los demás.
- Cada grupo de la barra recibe un único `menus` en lugar de un par `show` y `setShow` por menú (`MediaGroup` baja de unas 34 a unas 26 props) y `useFloatingMenus` solo recibe el menú abierto. `RichEditor.jsx` queda en unas 440 líneas. Prueba nueva del hook; frontend pasa a 101 tests.

### Mensajes de consola en español
- Traducidos los `console.error`, `console.warn` y `console.log` con texto en inglés (renderizadores del blog, selector de GIFs, vista previa de PDF, utilidades del portapapeles, ErrorBoundary, analítica y el script de migraciones del backend) y quitados los emojis de la salida de `migrate.js`.

### Arranque en local
- `arrancar.cmd` (doble clic) deja todo el entorno en marcha: comprueba `backend/.env`, abre Docker Desktop si está cerrado, levanta PostgreSQL en un contenedor de desarrollo y arranca backend y frontend como dos pestañas de una misma ventana de Windows Terminal. El móvil se abre en otra ventana con las direcciones para entrar por la red Wi-Fi. Si algún servidor ya está en marcha, no lo lanza de nuevo. Sin Windows Terminal usa ventanas de cmd.

### Repositorio y flujo
- Repo nuevo con historial limpio: https://github.com/Luprintech/pixel_portfolio. El repo anterior (`mi-portfolio`) sigue en GitHub como archivo; en local es el remoto `legacy` y la rama `legacy-main`.
- Documentación de contexto: `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y este archivo.
- Tests al cierre de esta fecha: frontend 101 y backend 60, todos en verde; build y lint sin errores.

## Pendiente

### Estructura y calidad de código
- Revisar con el mismo criterio el resto de comentarios en español: tono natural, explican el porqué.

### Funcionalidad
- Los sprites laterales y de espalda de la princesa son versiones simplificadas.
- Bloques del CMS `AudioPlayer.jsx` y `ChartsBlock.jsx`: no se importan en ningún sitio. Decidir si se conectan o se borran.
- El chunk del juego (`boot`) pesa unos 1,4 MB por Phaser; está cargado de forma diferida, pero conviene medirlo.

### Infraestructura
- El CI (`.github/workflows/ci.yml`) ya ejecuta lint, tests y build del frontend y tests y comprobación de sintaxis del backend en cada PR. Falta el despliegue automatizado.

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
| Refactor del editor hecho de forma mecánica y verificado con prueba de humo | Con un archivo de más de 3.000 líneas, mover código a mano es arriesgado; la prueba y el lint garantizan que no cambia lo que ve quien escribe. |
| Nunca se commitea directo a `main`; cada funcionalidad va en rama y PR, con squash | Historial ordenado y `main` siempre estable. Detalle en `CLAUDE.md`. |
| "mergea" solo si pasan todos los tests | Evita que `main` tenga fallos. |
| La autoría de commits y PRs es solo de Guadalupe | Todo el trabajo es suyo; sin líneas `Co-Authored-By` ni menciones a herramientas. |
| Comentarios del código en español y con tono natural | Que el código se lea como escrito por una persona. |
| `CLAUDE.md` y `AGENTS.md` viven dentro del repo | Para tener el contexto completo al trabajar desde otro ordenador. |
