# Estado del proyecto

Registro vivo de lo hecho, lo pendiente y las decisiones tomadas. Se actualiza al cerrar cada bloque de trabajo: lo terminado pasa a "Hecho", lo que surge se anota en "Pendiente" y cada decisión con su motivo va en "Decisiones".

Última actualización: 2026-11-09 (generador del avatar por partes con hoja de poses).

## Hecho

### Rediseño visual: Valle del Bucle
- Nueva capa visual: overworld pixel art estilo Zelda con Phaser 3 en `/valle`, portada en `/` y modo clásico en HTML en `/clasico`.
- Casas para Sobre mí, Proyectos y Contacto, herrería para el Stack y mazmorra para el Blog. Se entra pisando la puerta.
- La viajera con aspecto editable o aleatorio, joystick táctil en móvil y la gata Khalessi, que hoy la sigue por el valle (comportamiento provisional: ver «Personajes y mascotas» en Pendiente).
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

### Bloques del CMS sin uso
- Borrados `blocks/AudioPlayer.jsx` y `blocks/ChartsBlock.jsx`: nada los importaba ni estaban registrados en el editor, así que ningún post podía contenerlos. El audio ya lo cubre la extensión de audio del editor.
- Quitada la dependencia `recharts`, que solo usaba `ChartsBlock`.

### Chunks del CMS fuera de la web pública
- `dist/index.html` precargaba `editor-vendor` (unos 610 KB) y `cms-diagrams-vendor` (unos 535 KB) en todas las páginas. La causa no era una importación del CMS: con `manualChunks` en forma de objeto, Rollup alojaba en esos chunks helpers internos (la precarga de rutas de Vite y el interop de React que usa `swr` a través de `use-sync-external-store`) y la entrada los necesitaba siempre.
- `vite.config.js` usa ahora `manualChunks` como función: fija esos helpers y `use-sync-external-store` en `react-vendor` y deja a Rollup separar mermaid y pdf.js, que ya se cargan de forma diferida. La entrada solo precarga `react-vendor` y `animation-vendor`, y `Title`, `Clasico`, `Valle`, `Blog`, `BlogPost` y `Contact` no importan nada del editor.

### Mensajes de consola en español
- Traducidos los `console.error`, `console.warn` y `console.log` con texto en inglés (renderizadores del blog, selector de GIFs, vista previa de PDF, utilidades del portapapeles, ErrorBoundary, analítica y el script de migraciones del backend) y quitados los emojis de la salida de `migrate.js`.

### Arranque en local
- `arrancar.cmd` (doble clic) deja todo el entorno en marcha: comprueba `backend/.env`, abre Docker Desktop si está cerrado, levanta PostgreSQL en un contenedor de desarrollo y arranca backend y frontend como dos pestañas de una misma ventana de Windows Terminal. El móvil se abre en otra ventana con las direcciones para entrar por la red Wi-Fi. Si algún servidor ya está en marcha, no lo lanza de nuevo. Sin Windows Terminal usa ventanas de cmd.

### Visión, fase 1 (parcial): identidad visual y mapa
- Nuevo `docs/IDENTIDAD-VISUAL.md`: auditoría de la escala (se mantiene la tesela de 16 px), reglas de paleta y contorno, criterios de terreno, vegetación y edificios, y el reparto del valle.
- `game/world.js` reorganiza el mapa alrededor de una plaza empedrada central (`PLAZA`) con un cartel (`SIGNPOST`) y un camino principal de este a oeste. Taller al norte, casa de Lupe y taberna al oeste, biblioteca y correos al este, lago al sur. Los ids de los edificios y sus contenidos no cambian.
- `sprites.js` suma `plazaTile` y `signpostSprite`; `ValleScene.js` los dibuja y el cartel tiene colisión.
- Portada recompuesta: subtítulo «El portfolio interactivo de Guadalupe Cano», firma «Luprintech», menú de tres opciones (Nueva aventura, Personalizar viajera, Modo clásico), aldea lejana en el paisaje para no taparla con el menú y, en móvil, ilustración arriba y menú debajo. Se quita el párrafo de introducción del menú.
- Rosa pastel `--accent-rose` como hover de los botones secundarios; el botón principal sigue en azafrán.
- Nuevo estilo de píxel cute y cálido, tipo Stardew, elegido por Lupe tras ver una muestra: terreno con manchas, caminos y laguna de borde irregular, plaza de adoquines, árboles de copa irregular (con cerezos rosas), casas con tejas, postigos y jardineras, mazmorra de roca con musgo, viajera de 16×28 con cuatro direcciones y paso, y Khalessi rediseñada. Todo sale de `game/pixelKit.js` (ruido, contorno de color), `game/ground.js` (suelo) y `game/sprites.js`.
- Portada redibujada en el estilo nuevo a 320×180 (la escala del juego) con los mismos sprites del mundo: cielo de atardecer con nubes y estrellas, montañas, aldea lejana con ventanas que se encienden, la herrería con humo, la mazmorra, un cerezo en flor, la viajera y Khalessi. `game/titleArt.js` guarda en caché lo estático y `game/ground.js` exporta `grassColor`, `drawTuft`, `drawFlower` y `paintRoute` para reutilizarlos.
- Portada viva: Khalessi pasea y descansa moviendo la cola, caen estrellas fugaces y pétalos del cerezo, las nubes derivan, cruza una bandada de pájaros, el humo sube de la chimenea, hay luciérnagas, las flores se mecen y la viajera parpadea. Todo el movimiento son funciones puras del tiempo en `game/titleMotion.js` (con tests) y `game/titleArt.js` solo dibuja. Con movimiento reducido se pinta una imagen fija. Dibuja a 20 fotogramas por segundo con `requestAnimationFrame`.
- Música de la portada: «Flowerbed Fields» de Zane Little Music (CC0, dominio público, [OpenGameArt](https://opengameart.org/content/flowerbed-fields-loop)), en `frontend/public/audio/flowerbed-fields.ogg` (1,7 MB). Botón de altavoz dibujado en píxeles y barra de volumen arriba a la izquierda (`components/valle/MusicControl.jsx`, hook `useBackgroundMusic`). Empieza apagada, no descarga la pista hasta que se enciende y recuerda la elección en `localStorage` (`valle-del-bucle:audio`). Si falta el archivo, los controles no aparecen. Atribución no obligatoria; se acredita igualmente aquí. A Lupe le resulta demasiado rápida: es provisional y la sustituirá ella cuando encuentre otra más lenta (basta con reemplazar el archivo o cambiar `MUSIC_SRC` en `MusicControl.jsx`).
- «Continuar aventura»: aparece como botón principal si hay una partida guardada en `localStorage` (`valle-del-bucle:save`, que se escribe al entrar al valle); «Nueva aventura» pasa a secundario.
- Las casas se colocan con la puerta del dibujo alineada con la tesela de la puerta, y el escalón queda libre para llegar al felpudo.
- Sin cambios en el modo clásico.

### Visión, fase 1b: partida versionada, creador de personaje y opciones
- **Partida versionada:** `game/save.js` guarda `{ version, name, look }` en `valle-del-bucle:save`. Si solo existe la clave antigua `valle-del-bucle:look` (cuatro colores), `loadSave` la migra al leerla y `writeSave` la borra al escribir. Una partida dañada, de otra versión o con valores fuera de lista se ignora. El nombre se limpia con `sanitizeName` (letras, números, espacio, guion y apóstrofo; 16 como máximo) y nunca sale del navegador.
- **Creador de personaje:** «Nueva aventura» abre el creador con una viajera al azar y «Personalizar viajera» lo abre con la guardada. Una sola pantalla: nombre, vista previa que se queda fija arriba al desplazar (con botón «Girar» para ver las cuatro direcciones), y nueve categorías: piel, expresión, peinado (largo, corto, recogido, rizado), color de pelo, vello facial (ninguno, barba, bigote), complemento (gafas, lazo, flor, gorro), ropa (vestido, camiseta, mono), color de la ropa y ribetes. Más «Aleatoria», «Restablecer» y «Volver al inicio». Cada color lleva nombre además de verse, y los estilos son botones con texto (`aria-pressed`). Si hay partida, avisa de que entrar la sustituye; la partida solo se escribe al pulsar «Entrar al valle», así que abandonar el creador no pierde la anterior.
- **Sprite por capas** (sustituido por `game/avatar/`, ver más abajo): `game/avatar.js` componía cabeza, cuerpo y pies como mapas de píxeles de texto (con las cuatro direcciones y el paso) y aplica las capas encima; `sprites.js` solo los pinta. Al ser funciones puras, `avatar.test.js` comprueba que **todas** las combinaciones dan 28 filas de 16 columnas con letras conocidas. También sale de aquí el perfil de la viajera, con ojo, mejilla, nariz y boca legibles.
- **Menú «Opciones»** en la portada (diálogo `<dialog>` nativo: foco atrapado, Escape y retorno del foco): casilla «Reducir el movimiento», que pinta la portada quieta aunque el sistema no lo pida (`valle-del-bucle:options`, en `lib/gameOptions.js`), y «Borrar partida» con confirmación. El menú pasa a cinco entradas y el lienzo de la portada en móvil se ajusta a su nueva altura.
- Estilos nuevos en `pixel.css`: `.px-input`, `.px-check` y `.px-dialog`.
- Tests del frontend: 133 (nuevos: avatar, partida y opciones). Lint y build sin errores.

### Visión, fase 1b: creador de personaje terminado
- **Avatar mujer u hombre** (`body`): dos tarjetas con el sprite real, cada una con su peinado y prenda de partida. El hombre tiene hombros más anchos, mandíbula algo más ancha y cejas marcadas. `switchBody` cambia peinado y prenda solo si seguían siendo los de partida del avatar anterior, así que alternar no deshace lo ya elegido.
- **Color de ojos** (siete tonos), **color del vello facial** (aparece solo si hay barba o bigote) y **color del pantalón** (aparece solo si la prenda lo lleva). La boca abierta de «Sorpresa» ya no toma el color de los ojos.
- **Apartado Ropa:** prenda (vestido, falda, camiseta, chaqueta, mono), color de la prenda, pantalón y ribetes. Falda enseña las piernas; chaqueta deja la camisa por el centro. Los campos se agrupan en seis apartados (Avatar, Rostro, Pelo, Vello facial, Complementos, Ropa) definidos en `LOOK_SECTIONS`, con visibilidad condicional por campo.
- **Pantalla rehecha:** en pantalla ancha ocupa todo el ancho en dos columnas (escena, nombre y acciones fijos a la izquierda; apartados a la derecha, en dos columnas). En móvil la escena se queda arriba al desplazar y las acciones en una barra inferior. La escena es un prado a la resolución del juego, ampliado en escala entera y alargado si sobra ancho (sin bordes vacíos); la escala se limita por ancho y por alto de ventana. Los nombres de color son por categoría (`COLOR_NAMES[idioma][campo]`).
- Compatibilidad: las partidas guardadas con menos campos se completan con los valores por defecto (`upgradeLook`), sin perder el aspecto.
- Tests del frontend: 138. Lint y build sin errores.

### Visión, fase 1b: personalización al estilo de un juego de vida rural
- **Cada opción se enseña dibujada**, no con su nombre: expresión, peinado, vello, complemento, prenda de arriba, de abajo y calzado son tarjetas con el sprite real recortado (cara, cabeza y hombros, torso, piernas o pies) y con el aspecto actual de la viajera, así que se ve exactamente cómo quedaría. Las opciones «sin nada» llevan una cruz de píxeles. El nombre queda como etiqueta accesible (`aria-label`) y como texto al pasar el ratón. Pelo y Ropa ocupan las dos columnas para que quepan las tarjetas.
- **Cuerpo completo** (hoy en `game/avatar/`, 16×28): cabeza, torso con brazos y manos, piernas y pies, con paso de caminar (brazos y piernas alternan) y las cuatro vistas. Hombros y torso más anchos en el avatar de hombre. De perfil, un brazo al frente y piernas solapadas.
- **Ropa por piezas, con color propio:** prenda de arriba (camiseta, sudadera con capucha, tirantes, chaqueta, camisa, vestido, peto), prenda de abajo (pantalón largo, pantalón corto, falda, falda larga; no se elige con vestido ni peto), calzado (zapatillas, botas, sandalias) y ribetes. Cada pieza tiene su paleta (arriba 10 colores, abajo 8, calzado 6, complemento 8).
- **11 peinados:** largo, media melena, flequillo, corto, erizado, cola de caballo, coletas, trenza, moño alto, rizado y sin pelo. Los que cuelgan o sobresalen (cola, coletas, trenza, moño, mechas largas) son celdas sueltas que se pintan delante o detrás del cuerpo según la vista.
- **Ojos nuevos:** iris, parte baja más oscura y blanco, dos píxeles de alto; parpadean en la portada. Cinco expresiones (serena, sonrisa, sorpresa, guiño, tímida). Vello: barba, bigote, perilla y patillas. Complementos: gafas, gafas de sol, lazo, flor, diadema, gorro, gorra y pendientes, con color propio los que lo admiten.
- **Khalessi rehecha:** cabeza dibujada a mano con orejas triangulares de interior rosa, máscara siamesa, ojos azules con pupila y nariz rosa; lienzo de 24×16 (la portada y la vista previa se ajustaron).
- **Giro completo:** de perfil el cuerpo tenía 4 columnas bajo una cabeza de 13 y parecía una cabeza girada sobre un cuerpo de frente. El torso de perfil pasa a 6 columnas (7 en el avatar de hombre), la falda y el vestido vuelan igual que de frente y las piernas se separan con los pies apuntando hacia donde mira.
- **Khalessi, segunda pasada:** bigotes finos (tres por lado, claros a la derecha y marrones sobre el lomo a la izquierda), boca, cachetes con pelusa y una franja más clara en el lomo. Lienzo de 26×16.
- **Migración:** las partidas con `outfit`, `dress` y `pants` pasan a `top`/`bottom`/`topColor`/`bottomColor` al leerse, y `recogido` pasa a `rodete`. Tests del frontend: 142.

### Visión, fase 1b: modelo del cuerpo y catálogo de ropa según la referencia
- **Contorno negro:** el contorno de la viajera y de Khalessi pasa a negro azulado (`OUTLINE`, `outlineSolid`). Los brazos van separados del torso por una columna de contorno, y la piel que toca el pelo de delante pasa a línea negra, como en las imágenes de referencia. El resto del mundo (casas, árboles) conserva su contorno de color.
- **Lienzo del sprite:** la figura sigue siendo de 16×28 (cabeza 13, cuerpo 13, pies 2) y el lienzo pasa de 18×31 a 18×34 para dejar 5 filas libres encima de la cabeza (moño, coleta alta, pompón). Se ajustaron el cuerpo físico del juego, la portada y la vista previa.
- **Cabeza solo de piel** con cara grande: ojos de 2×3 píxeles con brillo blanco y la parte baja más oscura (el guiño y el parpadeo los cierran a una raya), mejillas, orejas más bajas, barbilla y cuello cortos. El pelo, el vello y los complementos se pintan encima como capas.
- **Catálogo de ropa (20 prendas):** arriba, camiseta básica, oversize, top sin mangas, camisa, sudadera con capucha, sudadera con cremallera, jersey y chaqueta vaquera; vestidos casual, de tirantes, largo y camisero; peto vaquero. Abajo, vaqueros rectos, cargo, ancho, corto, falda corta, plisada y larga. Cada prenda tiene su silueta y sus detalles (capucha, bolsillos, botones, cuello, puños, dobladillo). Los vestidos y el peto no dejan elegir prenda de abajo, y los vestidos tampoco su color. Las partidas con `chaqueta` pasan a `vaquera`.
- **Pendiente, a propósito:** los doce peinados de la referencia. (Ya resuelto: los peinados viven en `game/avatar/parts/hair.js`.) Había un borrador en `game/hair.js` (12 peinados en frente, espalda y perfil, con capa trasera y delantera) que ya se usa, pero está **sin revisar**: se rehace cuando se apruebe este modelo, ajustando la frente (el flequillo debe quedar en las filas 0 a 3 para que la línea negra caiga sobre la frente y no sobre los ojos).

### Visión, fase 1b: rediseño de la base del avatar (aprobado el 2026-11-09)
- **Motivo:** el cuerpo actual (16×28 en lienzo 18×34) sale alargado, con brazos como barras, y el pelo, los ojos y el contorno forman una franja oscura. La referencia es una lámina de personaje cute de RPG: cabeza protagonista, cuerpo compacto, hombros suaves, brazos cortos, piernas separadas.
- **Prueba previa:** módulo `game/avatarBase/` con una base, un peinado (bob) y un conjunto (camiseta, pantalón corto, botas) en dos tamaños (16×28 y 32×48), más una página de revisión (`avatar-lab.html`). Se aprobó el 16×28 con el perfil redibujado (bob con flequillo, patilla en la sien y nuca recogida; cara con frente, nariz de un píxel y barbilla; una sola mano junto al costado y una sola pierna con la bota hacia donde mira). Ese módulo y la página se borraron al migrar a `game/avatar/` (ver la sección siguiente).
- **Pelo oscuro:** `liftHair` sube el tono base del pelo hasta una luminosidad mínima, conservando matiz, para que no se funda con el contorno ni con las pupilas. «Tinta» queda como un añil.
- **Colisión independiente:** el cuerpo físico del juego (8×4 bajo los pies, `body.setSize(8, 4)` en `ValleScene.js`) no depende del dibujo; el anclaje son los pies, en el centro de la fila inferior.

### Visión, fase 1b: generador del avatar por partes y hoja de poses (2026-11-09)
- **Un solo generador** en `game/avatar/` para el creador, la portada y el juego. El enfoque técnico (funciones separadas por parte, dibujo propio para frente, perfil y espalda, y una hoja generada) se adaptó de un repo de referencia sin copiar sus gráficos, coordenadas ni resolución: se mantiene la nuestra, 16×28 en lienzo 18×34.
- **Partes** (`game/avatar/parts/`): `head`, `face`, `facialHair`, `hair`, `body` (prendas de arriba), `arms`, `legs` (piernas y cadera), `shoes` y `accessories`. Cada una pinta en la rejilla de `grid.js` con las columnas que le da `stance.js`; `compose.js` las apila (pelo trasero, piernas, cadera, prenda, brazos, cabeza, rostro, vello, pelo delantero y complementos), añade el contorno y devuelve la matriz de letras. `palette.js` resuelve las letras a colores y mantiene `liftHair`.
- **Poses:** 0 reposo y 1 y 2 los dos pasos, en cuatro direcciones. En un paso el cuerpo se hunde un píxel (las piernas se quedan en el suelo), de frente y de espalda un pie se levanta y el brazo contrario se alarga, y de perfil aparece la pierna de atrás en sombra y el brazo se balancea. El juego recorre reposo, paso, reposo, paso contrario (`WALK_CYCLE`).
- **Hoja de sprites:** `avatarSheet(look)` pinta 3 poses por 4 direcciones y `ValleScene.js` la registra como una textura con un fotograma por pose y dirección (`frameName`, `frameRect`). Ya no hay `flipX`: el perfil izquierdo viene dibujado.
- **Espejo solo donde no rompe asimetrías:** el perfil izquierdo es el derecho reflejado, salvo el guiño (cierra el ojo izquierdo del personaje, que enseña el perfil izquierdo), el rapado lateral (solo se ve por el lado rapado) y el lazo y la flor (se llevan en un lado). Esos casos se dibujan desde el lado que enseñan; hay pruebas que lo comprueban.
- **Opciones adaptadas a la estructura:** los trece peinados (el bob es el de la base aprobada, dibujado a mano; el resto conserva su forma y reparte reflejos y sombras solo), las cinco expresiones, el vello, los ocho complementos, las trece prendas de arriba, las siete de abajo y los tres calzados, para los dos avatares. Se revisó una galería de todas las opciones en las cuatro direcciones, en reposo y en paso. La camiseta es la de la base aprobada (cuello en pico con ribete y franja de ribete en el dobladillo); en las demás prendas el torso y las faldas se ajustaron a las filas de la base (torso de 7 filas, cadera de 3, piernas de 2, bota de 3).
- **Cambios de dibujo respecto al avatar anterior:** el pelo ya no se separa de la cara con una línea negra (la base aprobada no la lleva), los brazos se juntan con la manga y solo se separan del torso bajo el puño, y las gafas se rehicieron para los ojos de la base (más separados).
- **Borrado:** `game/avatar.js`, `game/hair.js`, `game/avatar.test.js`, `game/avatarBase/`, `src/lab/`, `avatar-lab.html` y `princessCanvas` (el nombre «princesa» ya no existe). El creador y la portada llaman a `avatarCanvas`.
- **Pruebas:** `game/avatar/compose.test.js` comprueba tamaño, letras conocidas y contorno cerrado en decenas de miles de combinaciones por dirección y pose, que los pies siguen apoyados al caminar, la simetría de frente y espalda, que el perfil izquierdo es el derecho reflejado salvo lo asimétrico, que cada pose y opción se ve distinta, que de perfil hay una sola mano y una sola pierna en reposo y dos al caminar, y la hoja.
- **Verificado en el navegador:** el creador (vista previa girando, tarjetas de cada opción recortadas con la nueva geometría) y el valle (en reposo y andando hacia la derecha).

### Repositorio y flujo
- Repo nuevo con historial limpio: https://github.com/Luprintech/pixel_portfolio. El repo anterior (`mi-portfolio`) sigue en GitHub como archivo; en local es el remoto `legacy` y la rama `legacy-main`.
- Documentación de contexto: `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y este archivo.
- Tests al cierre de esta fecha: frontend 101 y backend 60, todos en verde; build y lint sin errores.

## Pendiente

### Visión de producto
- La hoja de ruta de `docs/VISION.md` marca seis fases: identidad visual, `/clasico` como landing profesional, primer edificio completo (Taller del Código), resto del pueblo, mecánicas de aventura y pulido. El rediseño de `/clasico` (fase 2) lo hará la usuaria con las skills de diseño cuando termine el trabajo en curso. Antes de la fase 3 hay que cerrar las decisiones pendientes de su sección 13 (mapa, escala de tiles y sprites, estilo de edificios, diseño del modo clásico, interiores, NPC y mecánicas de la primera versión).

- Fase 1b de la visión (portada viva y creador de personaje): la música también debe sonar dentro del valle (hoy solo suena en la portada). Del creador (sección 6 de `docs/VISION.md`) quedan fuera las constituciones dentro de cada avatar y las formas de cara; hoy hay expresiones y dos avatares. Se pueden ampliar con más prendas (bufanda, delantal), más calzado y más complementos.
- El juego usa la hoja de poses del generador nuevo. Falta revisarla andando durante más rato por el valle (puertas, casas) con las prendas más anchas (falda larga, vestido) y el pelo largo; hasta ahora se ha visto en reposo y andando hacia la derecha.
- Fase 1 de la visión, lo que falta: vallas, flores en macetas y otros detalles de cariño; diseño propio del Taller y renombrar los edificios (Taller, Biblioteca, Taberna, Correos).

### Personajes y mascotas (decisiones del 2026-11-09)

Las reglas de producto están en `docs/VISION.md`, sección 6; aquí solo se registra qué falta. Nada de esto está implementado.

**Cambios en el código por la decisión de papeles** (Khalessi es la gata de Lupe, no la mascota del visitante). Sin implementar:
- `game/ValleScene.js` hace que Khalessi siga a la viajera por el valle. Debe dejar de seguirla y aparecer junto a Lupe en la bienvenida.
- `components/valle/Editor.jsx` pinta a Khalessi junto a la viajera en la vista previa, y `lib/valleCopy.js` dice «Khalessi irá contigo» y «Vista previa de tu viajera y Khalessi» (también en inglés). Ambos deben retirar a Khalessi de ahí.
- Lupe no existe como sprite, retrato ni NPC; la bienvenida de `DIALOGOS.md` aún no tiene implementación.

**Orden de prioridad** (propuesto en el encargo, pendiente de arrancar):
1. ~~Aprobar y consolidar la base visual del avatar.~~ Hecho el 2026-11-09 (16×28, lienzo 18×34). Siguen sin fijarse las dimensiones de las mascotas y los NPC.
2. ~~Adaptar las opciones actuales (peinados, ropa, complementos) a esa base.~~ Hecho el 2026-11-09 (`game/avatar/`). Los peinados que no son el bob conservan su forma de antes y no se han revisado uno a uno con la usuaria.
3. Mejorar el editor: guardar y recuperar la personalización, aleatorizar por categorías con bloqueo, vista previa caminando y restablecer por categoría. Hoy existen «Aleatoria» y «Restablecer» globales, y la vista previa gira en las cuatro direcciones pero solo en reposo (la hoja ya tiene los pasos).
4. Mascota del visitante: elección sin mascota, perro o gato; nombre propio; apariencias cosméticas; vista previa antes de entrar; acompañamiento opcional; cambiarla o desactivarla después; persistencia local con `SAVE_VERSION` 2.

**Propuestas pendientes de concretar** (en `docs/VISION.md`, 6.4): límites del nombre y valor por defecto, selección inicial de apariencias por especie, distancia y recuperación del seguimiento, comportamiento en interiores, diálogos y viaje rápido, y comportamiento con movimiento reducido.

### Estructura y calidad de código
- Revisar con el mismo criterio el resto de comentarios en español: tono natural, explican el porqué.

### Funcionalidad
- Los sprites laterales y de espalda de la viajera son versiones simplificadas.
- Medido el 2026-11-08: el chunk del juego (`boot`) pesa 1,41 MB (unos 329 KB con gzip) y casi todo es Phaser. Solo lo pide `pages/Valle.jsx` con `import()` y no aparece en los `modulepreload` de `index.html`, así que ni `/` ni `/clasico` lo descargan. El peso de `Valle` en sí es de 9 KB. Reducirlo exigiría una compilación a medida de Phaser, y no compensa mientras no moleste a quien entra al juego.

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
| Se borran `AudioPlayer` y `ChartsBlock` en lugar de conectarlos | Nunca llegaron a registrarse en el editor y no hay contenido que los use; si hacen falta más adelante, se recuperan del historial de git. |
| Refactor del editor hecho de forma mecánica y verificado con prueba de humo | Con un archivo de más de 3.000 líneas, mover código a mano es arriesgado; la prueba y el lint garantizan que no cambia lo que ve quien escribe. |
| Nunca se commitea directo a `main`; cada funcionalidad va en rama y PR, con squash | Historial ordenado y `main` siempre estable. Detalle en `CLAUDE.md`. |
| "mergea" solo si pasan todos los tests | Evita que `main` tenga fallos. |
| La autoría de commits y PRs es solo de Guadalupe | Todo el trabajo es suyo; sin líneas `Co-Authored-By` ni menciones a herramientas. |
| Comentarios del código en español y con tono natural | Que el código se lea como escrito por una persona. |
| La viajera o el viajero es el personaje del visitante, independiente de Lupe (2026-11-09) | Separar quién visita de quién anfitriona el portfolio. |
| Lupe es la anfitriona y guía; recibe al visitante sin imponer recorrido (2026-11-09) | Coherente con la exploración libre de la visión. |
| Khalessi es la gata de Lupe y su pareja, no la mascota del visitante (2026-11-09) | Evitar confundir papeles; las mascotas del visitante no toman su nombre, historia ni diálogos. |
| La mascota del visitante será perro o gato opcional, con variaciones solo cosméticas (2026-11-09) | Personalizar sin crear diferencias de personalidad ni habilidades. Documentada, no implementada. |
| Base visual del avatar aprobada: figura de 16×28, lienzo de 18×34 (2026-11-09) | Lupe prefirió la escala pequeña; las dimensiones de mascotas y NPC siguen abiertas. |
| El avatar sale de un único generador por partes, con hoja de 3 poses × 4 direcciones (2026-11-09) | Editor, portada y juego no pueden divergir, y cada parte se retoca sin tocar las demás. |
| El perfil izquierdo se refleja solo donde no rompe asimetrías (2026-11-09) | El guiño, el rapado, el lazo y la flor cambian de lado y se dibujan desde el lado que enseñan. |
| `CLAUDE.md` y `AGENTS.md` viven dentro del repo | Para tener el contexto completo al trabajar desde otro ordenador. |
