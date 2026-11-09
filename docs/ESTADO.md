# Estado del proyecto

Registro vivo de lo hecho, lo pendiente y las decisiones tomadas. Se actualiza al cerrar cada bloque de trabajo: lo terminado pasa a "Hecho", lo que surge se anota en "Pendiente" y cada decisión con su motivo va en "Decisiones".

Última actualización: 2026-11-09 (página del CV con visor y botón de volver).

## Hecho

### Rediseño visual: Valle del Bucle
- Nueva capa visual: overworld pixel art estilo Zelda con Phaser 3 en `/valle`, portada en `/` y modo clásico en HTML en `/clasico`.
- Casas para Sobre mí, Proyectos y Contacto, herrería para el Stack y mazmorra para el Blog. Se entra pisando la puerta.
- La viajera con aspecto editable o aleatorio, joystick táctil en móvil y la gata Khalessi, que hoy la sigue por el valle (comportamiento provisional: ver "Personajes y mascotas" en Pendiente).
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
- Portada recompuesta: subtítulo "El portfolio interactivo de Guadalupe Cano", firma "Luprintech", menú de opciones (su contenido depende de si hay partida: ver "Portada viva" más abajo), aldea lejana en el paisaje para no taparla con el menú y, en móvil, ilustración arriba y menú debajo. Se quita el párrafo de introducción del menú.
- Rosa pastel `--accent-rose` como hover de los botones secundarios; el botón principal sigue en azafrán.
- Nuevo estilo de píxel cute y cálido, tipo Stardew, elegido por Lupe tras ver una muestra: terreno con manchas, caminos y laguna de borde irregular, plaza de adoquines, árboles de copa irregular (con cerezos rosas), casas con tejas, postigos y jardineras, mazmorra de roca con musgo, viajera de 16×28 con cuatro direcciones y paso, y Khalessi rediseñada. Todo sale de `game/pixelKit.js` (ruido, contorno de color), `game/ground.js` (suelo) y `game/sprites.js`.
- Portada redibujada en el estilo nuevo a 320×180 (la escala del juego) con los mismos sprites del mundo: cielo de atardecer con nubes y estrellas, montañas, aldea lejana con ventanas que se encienden, la herrería con humo, la mazmorra, un cerezo en flor, la viajera y Khalessi. `game/titleArt.js` guarda en caché lo estático y `game/ground.js` exporta `grassColor`, `drawTuft`, `drawFlower` y `paintRoute` para reutilizarlos.
- Portada viva (primera versión, ampliada en "Portada viva: Lupe, tiempo, sonido y Khalessi"): caen estrellas fugaces y pétalos del cerezo, las nubes derivan, cruza una bandada de pájaros, el humo sube de la chimenea, hay luciérnagas y las flores se mecen. Todo el movimiento son funciones puras del tiempo en `game/titleMotion.js` (con tests) y `game/titleArt.js` solo dibuja. Con movimiento reducido se pinta una imagen fija. Dibuja a 20 fotogramas por segundo con `requestAnimationFrame`.
- "Continuar aventura": aparece como botón principal si hay una partida guardada en `localStorage` (`valle-del-bucle:save`, que se escribe al entrar al valle); "Nueva aventura" pasa a secundario.
- Las casas se colocan con la puerta del dibujo alineada con la tesela de la puerta, y el escalón queda libre para llegar al felpudo.
- Sin cambios en el modo clásico.

### Portada viva: Lupe, tiempo, sonido y Khalessi (2026-11-09)

**Lupe y su diálogo**
- **Lupe en la portada** (`game/lupe.js`, `game/lupePoses.js`): sustituye a la viajera. Se dibuja con el generador de la viajera a partir de su lámina `img/Items personalizacion/lupe.png` (melena rubia ondulada, vestido rosa, pendientes dorados). Es una aproximación: el generador no tiene las mangas abullonadas ni el collar de la lámina. Se queda quieta junto a la casa y parpadea; las poses de saludo (mano en alto, dos fotogramas) y de caricia (brazo hacia la gata, ojos cerrados) retocan la matriz del fotograma de frente con `avatarCanvas(..., edit)`.
- **Diálogos** (`game/titleLife.js`, textos en `lib/valleCopy.js`, bocadillo en `components/valle/LupeBubble.jsx`): un guion en escenas. La bienvenida se cuenta una vez (saludo con la mano, quién es Lupe, cómo empezar y el modo clásico) y luego hay un bucle de más de un minuto: comentario del tiempo (amanecer, día, noche, lluvia, tormenta o arcoíris), juego de Khalessi, su visita a Lupe, aseo y un consejo que rota. Con partida guardada Lupe invita a "Continuar aventura"; sin ella, a "Nueva aventura". En español e inglés, tono cercano.
- **Bocadillos en HTML, no en el lienzo:** texto nítido, con saltos de línea y traducible. Se colocan sobre la cabeza de quien habla proyectando su posición de la escena a la pantalla (`game/titleView.js`, que reproduce `object-fit: cover`) y se desplazan para no tapar el menú. Son decorativos (`aria-hidden`); los lectores de pantalla reciben un único texto de bienvenida. Con movimiento reducido queda un bocadillo fijo con cómo empezar.

**Khalessi** (`game/titleCat.js`, `game/pets/cats.js`)
- Se mueve por toda la profundidad del prado (x e y) y se pinta delante o detrás de Lupe según dónde apoya los pies. Camina siempre a 16 px/s, así que nunca se teletransporta (hay una prueba).
- Una vez por vuelta se acerca a Lupe, que la acaricia con los ojos cerrados; maúlla (`public/sounds/Maullido gato.mp3`, con el volumen de efectos) y se va. Se sienta y se asea (cierra los ojos y sube y baja una pata) antes de acercarse y después de irse.
- A mitad de vuelta juega a lo que haya, decidido con el cielo del momento en que empieza la escena: en primavera con mariposas persigue a una y salta sobre ella; en otoño empuja una avellana con dos zarpazos, la rodea y la devuelve con otros dos (la avellana bota dos veces al rodar, con su sombra, y acaba donde empezó, sin estado); sin nada con qué jugar, se lava. Descansa en (236, 140), dentro de lo que se ve en móvil.

**Cielo, tiempo y biomas** (`game/titleSky.js`, `titleSkyPaint.js`, `titleAutumn.js`)
- Cada visita parte de una hora y de un tiempo al azar (despejado, nublado, lluvia o tormenta con rayos). El día dura dos minutos: sale el sol, cruza el cielo y se pone; sale la luna con estrellas, y las ventanas del pueblo se encienden al oscurecer o con tormenta. Pájaros solo de día y sin lluvia; luciérnagas y estrellas fugaces de noche. Con movimiento reducido se pinta una sola imagen de esa hora, sin lluvia ni rayos.
- **Primavera:** tras la lluvia, cuando el cielo se despeja, sale un arcoíris de siete franjas. Con buen tiempo revolotean cinco mariposas sobre las flores.
- **Otoño con la lluvia:** el valle se funde con una segunda versión de sí mismo, generada una vez repintando solo los verdes a ocres y el cerezo a naranjas. Encima van veintiséis setas de cuatro tipos, tres calabazas, hojas caídas, charcos y tres avellanas; del árbol caen hojas en vez de pétalos y las flores y mariposas desaparecen. El cambio dura lo que el fundido del tiempo (8 s).
- El cielo y el tiempo son funciones puras de (tiempo, semilla): el dibujo y el sonido solo los consumen.

**Sonido** (`lib/soundMixer.js`, `lib/backgroundMusic.js`, `lib/ambience.js`, `hooks/useSoundPrefs.js`)
- **Música:** "Welcome Valle del Bucle" (`frontend/public/audio/`), en bucle, una sola pista para toda la visita: suena en la portada y sigue en el creador, y se apaga con un fundido al salir. Empieza con el primer gesto (los navegadores no dejan antes). Si falta el archivo, los controles no aparecen.
- **Ambiente:** viento, lluvia, grillos, pájaros y truenos con retraso tras cada rayo, generados con Web Audio (sin archivos) y que siguen al cielo.
- **Volúmenes:** general, música y efectos (FX), en Opciones. El real de cada sonido es el suyo por el general. La barra de la pantalla (portada y creador) es la del volumen general, la misma que la de Opciones. La música a cero se apaga. Las preferencias antiguas (`volume`) se leen como volumen de música.
- **Silencio:** el altavoz silencia todo (música, ambiente y efectos); mover cualquier barra lo reactiva.
- **iPhone y Android** (`lib/audioEngine.js`): en iPhone (y Chrome en iPhone, que usa WebKit) el volumen de un `<audio>` no hace nada y el audio solo arranca dentro de un gesto, y por eso al probarlo ni se oían los efectos ni el silencio apagaba la música. Ahora todo el sonido pasa por un único `AudioContext` con dos buses (música y efectos) cuyo volumen sale del mezclador: la música entra por el bus con `createMediaElementSource`, el ambiente cuelga del bus de efectos y los maullidos y ladridos suenan como buffers (así también pueden sonar sin un gesto, como el de Khalessi). El contexto se crea y se reanuda en el primer gesto (`pointerdown`, `pointerup`, `touchend`, `click` o `keydown`: en iOS no basta `pointerdown`), se reanuda al volver a la pestaña y pone `navigator.audioSession.type = "playback"` para que el interruptor de silencio del iPhone no calle Web Audio. Sin Web Audio se vuelve al `<audio>` de siempre. **Comprobado:** en Chrome de escritorio (los dos buses dejan pasar sonido y el altavoz los deja a cero y los devuelve) y con pruebas con un contexto simulado; **no se ha podido probar en un iPhone ni en un Android reales**.

**Menú y flujo de la portada**
- Sin partida: "Nueva aventura", "Opciones" y "Modo clásico". Con partida: "Continuar aventura" (principal), "Nueva aventura", "Opciones" y "Modo clásico". "Personalizar viajera" salió del menú: "Nueva aventura" lleva directa a la personalización y, dentro del valle, el botón de la barra superior (`copy.hud.customize`) reabre el creador. Se quitó el modo `?modo=editar`.
- El subtítulo "El portfolio interactivo de Guadalupe Cano" perdió su caja oscura: va en azafrán con un contorno duro de tinta.
- **Comillas rectas:** nunca comillas angulares. Se sustituyeron todas en `frontend/src` y en los documentos.

**Bocadillos más lentos y susto por los truenos (2026-11-09)**
- Cada bocadillo de Lupe se queda unos 4,5 s (antes 3-4 s, y no daba tiempo a leerlos); duraciones en `game/titleLife.js`. Las frases largas (bienvenida, "cómo empezar", modo clásico y el consejo de personalizar) van partidas en 2 o 3 bocadillos cortos (`welcome1`, `journeyNew1`...; textos en `lib/valleCopy.js`) porque en móvil un bocadillo alto tapaba el subtítulo. El subtítulo va pegado al título.
- Cuando se oye un trueno (llega con el retraso del rayo), Khalessi corre a esconderse tras Lupe, maúlla con `public/sounds/maullido gato asustado.mp3` (`petSounds.js`, clave `gatoAsustado`) y tiembla unos 4,5 s con orejas y rabo caídos (`khalessiScaredCanvas` en `pets/cats.js`) antes de volver a casa andando. Lupe suelta la caricia si estaba con ella. El susto vive en `game/titleCat.js` (`startScare`, `scaredCat`) y la escena lo aplica por encima del guion en `titleArt.js`; con movimiento reducido no hay susto. **Comprobado:** pruebas, lint, build y el sprite renderizado a tamaño ampliado; **no se ha visto el susto completo en la portada ni escuchado el maullido** (depende de que caiga un rayo).

**Bocadillos más grandes en web (2026-11-09)**
- Desde 1024 px el texto del bocadillo pasa de 18 a 24 px, el ancho máximo de 19 a 28 rem y el relleno crece (`components/valle/LupeBubble.jsx`, `px-bubble` en `pixel.css`). Con `text-wrap: balance` las líneas se reparten sin palabra suelta. Móvil y tablet no cambian. Comprobado a 1440 px por medidas (24 px, 448 px de ancho).

**Tormenta y consuelo (2026-11-09)**
- Con tormenta (`storm > 0,3` al empezar la visita) la gata no se acerca a Lupe: las escenas `fair` de `game/titleLife.js` (aviso, presentación, caricia, maullido, "reina del valle", despedida) quedan en una pausa y su maullido no suena. Antes Lupe decía "rascadita" con Khalessi escondida.
- Tras el susto, Khalessi sale de detrás de Lupe, se acerca y Lupe la consuela en dos bocadillos (`comfort1`, `comfort2`) y la acaricia unos 9 s antes de que vuelva a casa (`startScare` y `scaredCat` en `titleCat.js`; el guion queda anulado mientras dura el susto).
- Lenguaje inclusivo: "tu viajera o viajero" en las frases de Lupe.

**Comprobado:** lint, build y las 215 pruebas sin errores; renderizado en el navegador de amanecer, día, lluvia, tormenta nocturna, arcoíris, otoño, la mezcla entre estaciones, las poses de Lupe y de Khalessi y el juego con la mariposa y la avellana; portada en móvil (375 px); sincronía de las barras de volumen y el silencio total. **No se ha escuchado** el sonido (ambiente ni maullido): solo se comprobó por script.


### Visión, fase 1b: partida versionada, creador de personaje y opciones
- **Partida versionada:** `game/save.js` guarda `{ version, name, look }` en `valle-del-bucle:save`. Si solo existe la clave antigua `valle-del-bucle:look` (cuatro colores), `loadSave` la migra al leerla y `writeSave` la borra al escribir. Una partida dañada, de otra versión o con valores fuera de lista se ignora. El nombre se limpia con `sanitizeName` (letras, números, espacio, guion y apóstrofo; 16 como máximo) y nunca sale del navegador.
- **Creador de personaje:** "Nueva aventura" abre el creador con una viajera al azar y, dentro del valle, el botón "Personalizar viajera" lo abre con la guardada. Una sola pantalla: nombre, vista previa que se queda fija arriba al desplazar (con botón "Girar" para ver las cuatro direcciones), y nueve categorías: piel, expresión, peinado (largo, corto, recogido, rizado), color de pelo, vello facial (ninguno, barba, bigote), complemento (gafas, lazo, flor, gorro), ropa (vestido, camiseta, mono), color de la ropa y ribetes. Más "Aleatoria", "Restablecer" y "Volver al inicio". Cada color lleva nombre además de verse, y los estilos son botones con texto (`aria-pressed`). Si hay partida, avisa de que entrar la sustituye; la partida solo se escribe al pulsar "Entrar al valle", así que abandonar el creador no pierde la anterior.
- **Sprite por capas** (sustituido por `game/avatar/`, ver más abajo): `game/avatar.js` componía cabeza, cuerpo y pies como mapas de píxeles de texto (con las cuatro direcciones y el paso) y aplica las capas encima; `sprites.js` solo los pinta. Al ser funciones puras, `avatar.test.js` comprueba que **todas** las combinaciones dan 28 filas de 16 columnas con letras conocidas. También sale de aquí el perfil de la viajera, con ojo, mejilla, nariz y boca legibles.
- **Menú "Opciones"** en la portada (diálogo `<dialog>` nativo: foco atrapado, Escape y retorno del foco): casilla "Reducir el movimiento", que pinta la portada quieta aunque el sistema no lo pida (`valle-del-bucle:options`, en `lib/gameOptions.js`), y "Borrar partida" con confirmación. El lienzo de la portada en móvil se ajusta a la altura del menú. Después se le añadieron los tres volúmenes (ver "Portada viva").
- Estilos nuevos en `pixel.css`: `.px-input`, `.px-check` y `.px-dialog`.
- Tests del frontend: 133 (nuevos: avatar, partida y opciones). Lint y build sin errores.

### Visión, fase 1b: creador de personaje terminado
- **Avatar mujer u hombre** (`body`): dos tarjetas con el sprite real, cada una con su peinado y prenda de partida. El hombre tiene hombros más anchos, mandíbula algo más ancha y cejas marcadas. `switchBody` cambia peinado y prenda solo si seguían siendo los de partida del avatar anterior, así que alternar no deshace lo ya elegido.
- **Color de ojos** (siete tonos), **color del vello facial** (aparece solo si hay barba o bigote) y **color del pantalón** (aparece solo si la prenda lo lleva). La boca abierta de "Sorpresa" ya no toma el color de los ojos.
- **Apartado Ropa:** prenda (vestido, falda, camiseta, chaqueta, mono), color de la prenda, pantalón y ribetes. Falda enseña las piernas; chaqueta deja la camisa por el centro. Los campos se agrupan en seis apartados (Avatar, Rostro, Pelo, Vello facial, Complementos, Ropa) definidos en `LOOK_SECTIONS`, con visibilidad condicional por campo.
- **Pantalla rehecha:** en pantalla ancha ocupa todo el ancho en dos columnas (escena, nombre y acciones fijos a la izquierda; apartados a la derecha, en dos columnas). En móvil la escena se queda arriba al desplazar y las acciones en una barra inferior. La escena es un prado a la resolución del juego, ampliado en escala entera y alargado si sobra ancho (sin bordes vacíos); la escala se limita por ancho y por alto de ventana. Los nombres de color son por categoría (`COLOR_NAMES[idioma][campo]`).
- Compatibilidad: las partidas guardadas con menos campos se completan con los valores por defecto (`upgradeLook`), sin perder el aspecto.
- Tests del frontend: 138. Lint y build sin errores.

### Visión, fase 1b: personalización al estilo de un juego de vida rural
- **Cada opción se enseña dibujada**, no con su nombre: expresión, peinado, vello, complemento, prenda de arriba, de abajo y calzado son tarjetas con el sprite real recortado (cara, cabeza y hombros, torso, piernas o pies) y con el aspecto actual de la viajera, así que se ve exactamente cómo quedaría. Las opciones "sin nada" llevan una cruz de píxeles. El nombre queda como etiqueta accesible (`aria-label`) y como texto al pasar el ratón. Pelo y Ropa ocupan las dos columnas para que quepan las tarjetas.
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
- **Pelo oscuro:** `liftHair` sube el tono base del pelo hasta una luminosidad mínima, conservando matiz, para que no se funda con el contorno ni con las pupilas. "Tinta" queda como un añil.
- **Colisión independiente:** el cuerpo físico del juego (8×4 bajo los pies, `body.setSize(8, 4)` en `ValleScene.js`) no depende del dibujo; el anclaje son los pies, en el centro de la fila inferior.

### Visión, fase 1b: generador del avatar por partes y hoja de poses (2026-11-09)
- **Un solo generador** en `game/avatar/` para el creador, la portada y el juego. El enfoque técnico (funciones separadas por parte, dibujo propio para frente, perfil y espalda, y una hoja generada) se adaptó de un repo de referencia sin copiar sus gráficos, coordenadas ni resolución: se mantiene la nuestra, 16×28 en lienzo 18×34.
- **Partes** (`game/avatar/parts/`): `head`, `face`, `facialHair`, `hair`, `body` (prendas de arriba), `arms`, `legs` (piernas y cadera), `shoes` y `accessories`. Cada una pinta en la rejilla de `grid.js` con las columnas que le da `stance.js`; `compose.js` las apila (pelo trasero, piernas, cadera, prenda, brazos, cabeza, rostro, vello, pelo delantero y complementos), añade el contorno y devuelve la matriz de letras. `palette.js` resuelve las letras a colores y mantiene `liftHair`.
- **Poses:** 0 reposo y 1 y 2 los dos pasos, en cuatro direcciones. En un paso el cuerpo se hunde un píxel (las piernas se quedan en el suelo), de frente y de espalda un pie se levanta y el brazo contrario se alarga, y de perfil aparece la pierna de atrás en sombra y el brazo se balancea. El juego recorre reposo, paso, reposo, paso contrario (`WALK_CYCLE`).
- **Hoja de sprites:** `avatarSheet(look)` pinta 3 poses por 4 direcciones y `ValleScene.js` la registra como una textura con un fotograma por pose y dirección (`frameName`, `frameRect`). Ya no hay `flipX`: el perfil izquierdo viene dibujado.
- **Espejo solo donde no rompe asimetrías:** el perfil izquierdo es el derecho reflejado, salvo el guiño (cierra el ojo izquierdo del personaje, que enseña el perfil izquierdo), el rapado lateral (solo se ve por el lado rapado) y el lazo y la flor (se llevan en un lado). Esos casos se dibujan desde el lado que enseñan; hay pruebas que lo comprueban.
- **Opciones adaptadas a la estructura:** los trece peinados (el bob es el de la base aprobada, dibujado a mano; el resto conserva su forma y reparte reflejos y sombras solo), las cinco expresiones, el vello, los ocho complementos, las trece prendas de arriba, las siete de abajo y los tres calzados, para los dos avatares. Se revisó una galería de todas las opciones en las cuatro direcciones, en reposo y en paso. La camiseta es la de la base aprobada (cuello en pico con ribete y franja de ribete en el dobladillo); en las demás prendas el torso y las faldas se ajustaron a las filas de la base (torso de 7 filas, cadera de 3, piernas de 2, bota de 3).
- **Cambios de dibujo respecto al avatar anterior:** el pelo ya no se separa de la cara con una línea negra (la base aprobada no la lleva), los brazos se juntan con la manga y solo se separan del torso bajo el puño, y las gafas se rehicieron para los ojos de la base (más separados).
- **Borrado:** `game/avatar.js`, `game/hair.js`, `game/avatar.test.js`, `game/avatarBase/`, `src/lab/`, `avatar-lab.html` y `princessCanvas` (el nombre "princesa" ya no existe). El creador y la portada llaman a `avatarCanvas`.
- **Pruebas:** `game/avatar/compose.test.js` comprueba tamaño, letras conocidas y contorno cerrado en decenas de miles de combinaciones por dirección y pose, que los pies siguen apoyados al caminar, la simetría de frente y espalda, que el perfil izquierdo es el derecho reflejado salvo lo asimétrico, que cada pose y opción se ve distinta, que de perfil hay una sola mano y una sola pierna en reposo y dos al caminar, y la hoja.
- **Verificado en el navegador:** el creador (vista previa girando, tarjetas de cada opción recortadas con la nueva geometría) y el valle (en reposo y andando hacia la derecha).

### Contexto de producto para las herramientas de diseño (2026-11-09)
- Nuevo `PRODUCT.md` en la raíz: usuarios (reclutadores y clientes freelance por igual), propósito (conseguir empleo como desarrolladora), posicionamiento, restricciones, compromisos de marca, evidencia disponible y principios. No fija estética: esa sigue en `frontend/docs/DESIGN.md` y `docs/IDENTIDAD-VISUAL.md`.
- Sin cambios de código; sirve de base al rediseño de `/clasico` y al resto del trabajo de diseño.

### Sonido: el silencio y el volumen general llegan a todo (2026-11-09)
- **Síntoma:** en el navegador el botón de silenciar no callaba todo y la barra de volumen parecía mover solo los efectos.
- **Causa probable:** no había un control común. El general se multiplicaba por separado en cada bus, y la pista de música podía quedar fuera del motor (si el navegador la dejaba sonar antes del primer gesto) o con un fundido a medias pisando el volumen. **No se reprodujo con el sonido real** en un arranque normal: ahí ya funcionaba, así que el arreglo es estructural.
- **Arreglo:** `lib/audioEngine.js` pasa a tener un nodo general (`master`) entre los buses y la salida. El volumen general y el silencio solo cambian ese nodo; la música y los efectos llevan únicamente el suyo. Cualquier sonido futuro que cuelgue de un bus lo hereda.
- Al ajustar un volumen se borra lo programado antes (`cancelScheduledValues`), para que un fundido cancelado no deje la ganancia pegada.
- Si la pista ya sonaba antes del primer gesto, el primer gesto la conecta al motor. Sin Web Audio, el elemento usa también `muted`, no solo `volume`.
- **Comprobado:** pruebas nuevas del cableado y del mezclador, y en Chrome de escritorio midiendo la señal a la salida del nodo general (general a 0,25 baja la señal y silenciar la deja en cero). **Sin probar en un Android ni en un Safari/iPhone reales.**

### PWA: instalar la web en Android y iPhone (2026-11-09)
- **Hecho:** `public/manifest.webmanifest`, iconos de casita pixel art en `public/icons/` (generados con `frontend/scripts/make-pwa-icons.mjs`, sin dependencias; hay versión maskable y `apple-touch-icon`), service worker propio en `public/sw.js` y las metaetiquetas de `index.html` que Safari necesita aparte.
- **Aviso de instalación** (`components/InstallPrompt.jsx`; estado en `lib/installStore.js`, que escucha `beforeinstallprompt` desde `main.jsx` para no perder el evento; lógica de sistema en `lib/pwaInstall.js`): con el aviso del navegador (Chrome o Edge, en móvil o escritorio) sale un cartel con botón "Instalar" que abre su diálogo. En iPhone, sin diálogo, explica los pasos (Compartir y "Añadir a pantalla de inicio") adaptados a Safari, Chrome y otros. En Android sin aviso del navegador explica el menú. Todos dicen que se recomienda para una mejor experiencia. Opciones de la portada tiene un botón fijo "Instalar aplicación" para quien lo descartó.
- Se muestra a los 4 s de visita y solo tras decidir sobre las cookies (`lib/cookieConsent.js` emite un evento al guardar), abajo a la derecha en pantallas medianas para no tapar el menú de la portada. No sale dentro de `/valle`, ni si la web ya está instalada, y descartarlo lo silencia 14 días.
- **Corregido (2026-11-09):** el cartel no salía porque `InstallPrompt` nunca se había montado en `App.jsx` (mi edición no se aplicó por los saltos de línea CRLF). Detectado al probarlo en el panel del navegador.
- El manifest añade accesos directos ("Continuar aventura", "Modo clásico"), `display_override` y categorías.
- El service worker se registra también en desarrollo (Chrome no lanza el aviso de instalación sin él) pero en localhost no cachea nada. Cachea `/assets/*` y la portada (sin conexión abre esa); no toca `/api/` ni `/posts/`. `nginx.conf` sirve `sw.js` y el manifest sin caché.
- **Comprobado:** tests de plataforma, del store y del cartel; lint y build; y en el navegador del panel con un evento de instalación simulado (el cartel sale, "Instalar" lanza `prompt()` y el botón de Opciones funciona). **Sin probar:** el registro del service worker (el panel no admite service workers), la instalación real y el iPhone.
- **Pendiente:** capturas de pantalla en el manifest para el diálogo de instalación ampliado de Chrome (hacen falta capturas reales del juego); pasar el cartel por las skills de diseño.

### Repositorio y flujo
- Repo nuevo con historial limpio: https://github.com/Luprintech/pixel_portfolio. El repo anterior (`mi-portfolio`) sigue en GitHub como archivo; en local es el remoto `legacy` y la rama `legacy-main`.
- Documentación de contexto: `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y este archivo.
- Tests al cierre de esta fecha: frontend 101 y backend 60, todos en verde; build y lint sin errores.

### Valle a pantalla completa
- El lienzo del juego llena toda la ventana (móvil, tablet y escritorio) en lugar de un 320×180 con barras. Phaser pasa a `Scale.RESIZE` y la cámara se adapta con un zoom entero (`game/viewport.js`, con tests): da unos 220 px de mundo en el lado corto y nunca enseña más que el mapa. Así los sprites se ajustan con el mismo tamaño en cualquier pantalla.

### Creador: cada avatar con su propio aspecto
- Los cambios del creador afectan solo al avatar seleccionado (mujer u hombre). Al alternar se recupera lo que ya se le había hecho a cada uno; uno sin tocar arranca con su aspecto de partida (`defaultLook`, `selectBody` en `game/look.js`), sin heredar nada del otro. Las tarjetas "Avatar" muestran a cada uno con su propio aspecto. "Restablecer" y "Al azar" actúan solo sobre el seleccionado, y solo se guarda el seleccionado al entrar al valle. Sustituye a `switchBody`, que arrastraba el aspecto de uno al otro.

### Creador: mascota del visitante (sin Khalessi)
- Khalessi sale del creador y del valle: ya no sale en la vista previa, no sigue a la viajera y los textos del creador no la nombran. Sigue en la portada, que es su sitio hasta que llegue Lupe.
- Apartado **Mascota** del creador, en pasos: especie (sin mascota, perro o gato), raza, color del pelo y color de manchas y detalles. La elección se ve en la vista previa y en las tarjetas, y la mascota sigue a la viajera por el valle.
- **Cinco razas de perro**, cada una con su tamaño y silueta: border collie (negro con franja, hocico, pecho, patas y punta de cola blancos), pastor alemán (el más alto, orejas erguidas, silla y hocico oscuros), beagle (orejas largas, pequeño), husky (antifaz claro, ojos azules, cola rizada) y teckel (el más largo y bajo).
- **Cinco razas de gato**: europeo común, persa (redondo, cara chata, cola mullida), Maine Coon (el más grande, mechones en las orejas y cola de plumero que nace en la grupa y sube en curva, afinándose en la punta; antes arrancaba por debajo del cuerpo y dejaba un bulto), Sphynx (delgado, orejas enormes, cola de látigo) y bengalí (largo, con manchas y cola anillada). Ninguna es siamesa para no parecerse a Khalessi.
- **Paletas:** nueve colores de pelo y seis de manchas y detalles, comunes a todas las razas; cada raza decide dónde pone cada color y arranca con sus colores de siempre. Las sombras, luces y contrastes (ojos, nariz, bigotes) se calculan a partir de ellos, así un pelaje negro sigue viéndose.
- **Tamaño por raza:** cada raza tiene su propio lienzo, de 26×14 el teckel a 32×20 el pastor y el Maine Coon. Esto sustituye al lienzo único de 26×16 de antes y sigue pendiente de que se apruebe como base de mascotas. En el creador las tarjetas comparten caja para que se vea la diferencia de tamaño, y en el valle la sombra se ajusta al ancho.
- Datos, paletas y validación en `game/pet.js`; dibujo en `game/pets/`: `engine.js` pinta cualquier raza a partir de su ficha, `cats.js` y `dogs.js` tienen las fichas y el reparto de colores, y `colors.js` las ayudas de contraste. Khalessi usa la misma forma del gato común con sus colores fijos.
- Partida `SAVE_VERSION` 2 con `pet` (especie, raza y los dos colores); las de la versión 1 se leen sin mascota. "Restablecer" también quita la mascota. "Al azar" no la toca.
- Tests del frontend: 164 (jsdom no pinta canvas: los tests comprueban datos y colores, y el dibujo se revisa a ojo). Lint y build sin errores.

### Creador: personalización completa según las láminas de referencia (2026-11-09)
- **Origen:** la carpeta `img/` de la raíz (fuera de git: está en `.gitignore`) guarda las láminas de estilo de cada apartado. Solo se han usado las de `Items personalizacion/`; `lupe.png` es de la anfitriona, no de la viajera, y queda para cuando se haga su sprite.
- **Expresiones (12):** neutral, sonrisa, risa, guiño, sorpresa, enfado, tristeza, llanto, concentración, duda, sueño y vergüenza. Cada una es una ficha de ojos, cejas y boca en `parts/face.js`, con dibujo de frente y de perfil. Letras nuevas `Z` (cejas y párpados), `q` (lágrimas).
- **Rasgos faciales (16):** el apartado "Vello facial" pasa a "Rasgos faciales" y su campo `beard` a `trait`: sin vello, barba incipiente, corta y completa, bigote fino y ancho, perilla, patillas, pecas suaves y abundantes, dos lunares, cejas pobladas, ceja partida y dos cicatrices. Cada rasgo es una lista de tramos en `parts/traits.js` (sustituye a `facialHair.js`). El color del vello solo aparece en los rasgos con pelo. Letras `F` (peca o lunar) y `C` (cicatriz).
- **Complementos (16):** gafas redondas y rectangulares, de sol, pendientes pequeños y de aro, piercing de nariz, auriculares, diadema, lazo, horquillas, pañuelo, gorra, gorro de lana y sombreros de paja y de bruja. Cada uno es una función de `parts/accessories.js`; los sombreros usan el margen de cuatro filas sobre la cabeza. La flor pasa a ser el par de horquillas.
- **Calzado (16):** cuatro zapatillas (básicas, deportivas, altas, de lona), botines, botas de montaña, altas, de lluvia y de aventura, zapatos clásicos, mocasines, merceditas, bailarinas, sandalias, chanclas y tacones. `parts/shoes.js` los define por filas y las piernas se acortan según lo que tape cada calzado (`shoeTop`). Letra `r` (tono claro del calzado, para cordones y puños).
- **Peinados de chico (12):** cada avatar ofrece los peinados de su lámina (más "sin pelo"). Los de mujer no cambian; los de hombre son rapado, corto clásico, de punta, flequillo largo, rizado corto, afro, degradado, tupé, media melena, largo ondulado, moño y cresta, los tres últimos en común con las mujeres donde la lámina los repite. `styleChoices` decide qué lista enseña el editor y "Aleatoria" elige entre los del avatar. El hombre arranca con "corto clásico".
- **Ropa:** el catálogo ya coincidía con la lámina (13 prendas de arriba y 7 de abajo); no se ha tocado.
- **Migración:** las partidas guardadas pasan solas a los ids nuevos (`beard`→`trait`, `timida`→`verguenza`, `flor`→`horquillas`, `botas`→`botines`).
- **Editor:** los apartados de rasgos y complementos ocupan las dos columnas por el número de tarjetas, y los recortes de cabeza y pelo suben una fila para que quepan los sombreros altos.
- **Verificado:** galería de todas las opciones renderizada de frente, perfil y espalda (y calzado andando); creador y valle revisados en el navegador. Tests del frontend: 170; lint y build sin errores.

### Creador: escenas separadas, pestañas y rejillas homogéneas (2026-11-09)
- **Auditoría del creador** a 1920×1080, 1280×720, 768×1024 y 390×844: el avatar y la mascota compartían un solo prado de 34 píxeles de alto; las tarjetas medían 80×144, 40×40, 80×84, 80×120, 80×64, 116×44 y 104×68; el apartado "Avatar" ocupaba 600 px de alto con dos tarjetas; y en pantalla ancha sobraba espacio a los lados.
- **Dos escenas, una caja para cada una** (`AvatarStage`, `PetStage` sobre `stage/StageFrame.jsx`): del mismo alto (`--stage-h`, que crece con la altura de la ventana), cada una con su botón de girar. La viajera gira en cuatro direcciones; la mascota solo tiene perfil y gira entre derecha e izquierda. La ampliación es el mayor entero con el que cabe la figura con aire alrededor (sombreros y peinados anchos incluidos), y el prado llena la caja. Sin mascota, la caja lo dice. Hook `stage/useStageScene.js`, prado en `stage/meadow.js`.
- **Pestañas** (`EditorTabs`, ARIA tablist con flechas): Cuerpo (avatar, rostro, pelo y rasgos faciales), Ropa (ropa y complementos) y Mascota. `LOOK_TABS`, `LOOK_SECTIONS[].tab` y `TAB_NAMES` en `game/look.js`. El avatar (mujer u hombre) pasa de dos tarjetas a dos botones (`BodyChoice`) en el apartado "Avatar" de Cuerpo.
- **Rejillas homogéneas:** todas las opciones son celdas cuadradas (`StyleGrid`, `.px-grid`) y cada tarjeta se adapta a su propio ancho con una consulta de contenedor: 4 columnas y, desde 47 rem, 8. El dibujo se amplía con la mayor escala entera que cabe en la celda (`.px-sprite` con `round()`), así nunca se emborrona. Las muestras de color miden 44 px y las pestañas 52.
- **Opciones nuevas para que las filas salgan completas:** cuatro expresiones (picardía, miedo, aburrimiento, ternura), tres prendas (polo, chaleco, cárdigan), pantalón pirata y tres peinados prestados por avatar (la mujer puede llevar corto clásico, media melena y de punta; el hombre, bob, pixie y coleta baja). Quedan 16 opciones en expresiones, peinados, rasgos, complementos, prendas de arriba y calzado, y 8 en prendas de abajo.
- **Responsive:** móvil a una columna con las dos escenas fijas arriba (unos 270 px de alto) y acciones abajo; sin desplazamiento horizontal a 390 y 768 px de ancho; en pantalla ancha las escenas, el nombre y las acciones quedan fijos a la izquierda y las pestañas fijas arriba de las opciones. Desde 1600 px las tarjetas cortas se reparten en dos columnas.
- **Verificado:** capturas a los cuatro tamaños, medidas por script (sin desbordes, celdas de 66 px o más en móvil) y tests (171), lint y build sin errores. Sin revisar con un dispositivo táctil real.

### Creador: marcha en el sitio y avatar bajo el nombre (2026-11-09)
- **Vista previa andando:** la viajera recorre el ciclo del juego (reposo, paso, reposo, paso contrario, cada 140 ms) sin desplazarse, así que se le ven las piernas moverse; la mascota alterna las patas y mueve la cola. Con "Girar" la viajera se ve de perfil andando, y la mascota se pone a mirar a un lado o al otro. Ambas quedan dentro de su caja: la ampliación se calcula con el aire que necesita la figura y el reloj de cada escena (`stage/useWalkStep.js`) repinta solo esa escena, no el creador entero. El prado se pinta una vez por tamaño y se copia en cada fotograma.
- **Casilla "Animar la vista previa"** en la fila del texto "Avatar", alineada a la derecha. Empieza apagada si el sistema pide movimiento reducido o el visitante lo eligió en Opciones (`prefersReducedMotion` en `lib/gameOptions.js`, que ahora usa también la portada), y sirve para parar lo que se mueve solo.
- **Elección de avatar** (mujer u hombre) bajo el nombre, en la columna fija; el apartado "Avatar" de la pestaña Cuerpo desaparece. La barra de acciones queda fija abajo de esa columna, así "Entrar al valle" se ve siempre aunque la columna se desplace.
- **Verificado:** el dibujo de la viajera cambia entre tres poses y el de la mascota entre cuatro con la casilla activa, y se queda en una sola con ella apagada (medido en el navegador); pruebas, lint y build sin errores. Sin revisar en un dispositivo táctil.

### Creador: jerarquía común, nombres y selector de color (2026-11-09)
- **Misma jerarquía en cada apartado:** nombre del campo, sus opciones dibujadas y justo debajo sus colores. Rostro estaba al revés (colores arriba) y ahora lleva primero las expresiones y después piel y ojos. Cada fila de color tiene su título ("Color"), el nombre del tono elegido a la derecha y las muestras debajo. `LOOK_SECTIONS` anida los colores de cada campo (`colors`) y `visibleBlocks` resuelve qué se ve; con peto el color de la prenda de abajo sigue disponible como fila suelta.
- **Selector de cualquier color** (`Swatches`, `ColorRow`): un cuadrado más al final de cada fila de color de la viajera con un "+" dibujado en píxeles; abre la paleta del navegador y confirma al cerrarla (no mientras se arrastra, porque cada cambio repinta todas las tarjetas). El color elegido se ve en el propio cuadrado y se nombra "Personalizado". `isHexColor` valida `#rrggbb` en los campos de color al leer una partida; los de estilo siguen limitados a su lista.
- **La mascota no lo lleva:** sus colores salen solo de su paleta natural (decisión de Lupe: no tiene sentido un perro verde). `isValidPet` sigue comprobando la lista.
- **Nombre en cada opción:** todas las tarjetas, también las de especie y raza, llevan su nombre debajo (13 px, dos líneas reservadas para que las filas sean iguales). Con eso las rejillas pasan a 3 columnas en tarjeta estrecha (móvil), 4 en media y 8 desde 62 rem; solo en móvil la última fila de una lista de 16 queda a medias.
- **Auditoría del fondo de las tarjetas:** el verde del prado coincidía o casi con 10 de los 34 colores elegibles de las paletas, entre ellos los tres verdes, con un contraste de 1,00:1. Se midió contra diez fondos candidatos y se probó un gris violáceo (`#7a789a`), pero Lupe prefirió el verde de antes: `TILE_BACKGROUND` en `pickStyle.js` vuelve a `PAL.moss`. Se acepta que una prenda verde se parezca al fondo, porque el contorno oscuro de los sprites (3,9:1 sobre el verde) mantiene la silueta.
- **Verificado:** en el navegador a 1440 y 390 px (3 columnas, sin textos desbordados, sin desplazamiento horizontal, muestras de 44 px) y con un color personalizado elegido por script; pruebas, lint y build sin errores. No probado con la paleta real del sistema ni con un dispositivo táctil.

### Creador de la viajera: pasada final de accesibilidad y cierre (2026-11-09)
- **Botón "Girar":** pisaba la caja de la vista previa. La sombra dura del botón (9 px) y el anillo de la caja (6 px) sumaban más que los 12 px de separación; ahora hay 20 px. Cada botón lleva el nombre de su escena ("Girar: Viajera"), porque con dos botones "Girar" iguales no se sabía cuál era cuál.
- **Auditoría automática de la página** (nombres de controles, ids repetidos, `tabindex`, `aria-controls`, encabezados, tamaño de los objetivos táctiles, contraste de todo el texto visible y desborde horizontal): sin controles sin nombre, sin ids repetidos, encabezados en orden y 0 textos bajo 4,5:1 una vez corregido "Sin mascota" (3,8:1 sobre el verde; ahora va en una etiqueta de tinta, 13:1).
- **Dos `main`:** la página tenía el `main` de `App.jsx` y otro dentro del creador. Ahora el creador usa contenedores sin rol y solo hay un `main`.
- **Foco no tapado (WCAG 2.4.11):** en móvil las escenas fijas por arriba y la barra de acciones por abajo tapaban el control que recibía el foco al tabular. `useScrollPadding` mide esas franjas y fija `scroll-padding` (en pantalla ancha, el de las pestañas y el de la columna izquierda). Comprobado enfocando tarjetas de distintas filas: siempre quedan entre las dos franjas.
- **Reflow a 320 px (WCAG 1.4.10):** la barra de acciones se salía de la pantalla ("Restablecer"). Ahora se reparte en dos filas si no cabe y el margen inferior de la página crece con ella. Sin desplazamiento horizontal a 320, 390, 768 y 1440 px.
- **Contraste de los bordes (WCAG 1.4.11):** el borde de lo no elegido (`RING`) pasa de `#4b4380` (1,9:1 contra la tarjeta) a `PAL.mist` (3,6:1); una muestra negra casi no se distinguía.
- **Avisos para lector de pantalla:** "Aleatoria" y "Restablecer" anuncian lo que hicieron en una región `role="status"`. Un color propio se nombra con su código ("Personalizado #2FD37A").
- **Ya estaba bien y se mantiene:** pestañas con ARIA y flechas, `aria-pressed` en cada opción y color, nombre accesible que contiene el texto visible (2.5.3), objetivos de 44 px o más, casilla para parar el movimiento (2.2.2), movimiento reducido respetado, foco visible en todo y etiqueta del nombre con su ayuda enlazada.
- **Verificado:** a 1440, 390 y 320 px con scripts en el navegador; 173 pruebas, lint y build sin errores.
- **Estado:** el creador se da por terminado. Lo que sigue en "Pendiente" son ampliaciones opcionales, no trabajo a medias.

### Creador: nombre y sonido de la mascota, opciones del mismo tamaño (2026-11-09)
- **Nombre de la mascota:** al elegir una mascota aparece, justo debajo del nombre de la viajera, el campo "Nombre de la mascota" con las mismas reglas (16 letras, limpiado con `sanitizeName`, sin enviarse a ningún sitio) y la misma ayuda enlazada. Sin mascota no hay campo y el nombre guardado queda vacío. Se guarda aparte de la mascota (`petName` en la partida) para que cambiar de especie o raza no lo borre. `SAVE_VERSION` 3: las partidas de las versiones 1 y 2 se leen igual, la 2 con su mascota y sin nombre para ella. "Restablecer" también lo borra.
- **Botón de sonido** en la misma fila que el nombre, a la derecha: "Maullar" con un gato y "Ladrar" con un perro (`lib/petSounds.js`). Suenan las grabaciones de Lupe, `public/sounds/Maullido gato.mp3` y `public/sounds/Ladrido perro.mp3`, solo al pulsar. Cada raza afina la voz con la velocidad de reproducción (`preservesPitch = false`): el teckel y el sphynx más agudos, el pastor y el Maine Coon más graves. Pulsar de nuevo la hace sonar desde el principio. Al ver su audio en el navegador, los dos archivos cargan y suenan sin errores. Un primer intento con sonidos sintetizados se descartó al llegar las grabaciones.
- **Espacio entre los dos nombres:** la ayuda ("Hasta 16 letras…") iba entre ellos y separaba los campos 74 px; ahora va debajo de los dos, que quedan a 48 px, con el nombre de la mascota enlazado a esa misma ayuda. La frase va a 8 px del campo y con el interlineado ajustado a su altura (16 px), para que se lea pegada a los dos nombres.
- **Aviso "Ya tienes una aventura guardada":** pasa de quedar bajo el selector de avatar a ir arriba del todo, encima de la vista previa, que es lo primero que se lee al abrir "Nueva aventura".
- **Todas las opciones del mismo tamaño:** las tarjetas de apartado ya tenían el mismo ancho, pero las opciones no: una palabra larga ensanchaba una columna (86, 86 y 104 px en la misma fila), los nombres de tres líneas alargaban unas filas y las especies y razas de la mascota usaban otra rejilla. Ahora las columnas son `minmax(0, 1fr)` y el nombre rompe palabra si hace falta, todas las filas de una rejilla miden lo mismo (`grid-auto-rows: 1fr`), el nombre reserva tres líneas y las mascotas usan la misma rejilla que el resto. Se acortaron dos nombres que necesitaban cuatro líneas ("Sudadera con zip", "Gafas cuadradas"). Se quitó la disposición en dos columnas de las pantallas muy anchas: con ella, las tarjetas estrechas y las anchas daban celdas de 88 y 98 px.
- **Medido en el navegador** en las tres pestañas: todas las opciones miden igual a 390 px (92×139), a 768 px (154×201) y a 1440 px (182×229), sin desplazamiento horizontal. 178 pruebas, lint y build sin errores. El sonido se comprobó solo por script (el contexto de audio se crea y no hay errores): no se ha escuchado el resultado.

### Creador y opciones: reordenación del layout (2026-11-09)
- **Opciones de la portada:** la rejilla de dos columnas ya no estira la columna izquierda (el sonido ocupa cuatro filas y la última, `1fr`, absorbe la altura), así que desaparece el hueco entre "Reducir el movimiento" y "Partida guardada".
- **Girar:** un solo botón pequeño con una flecha circular dibujada píxel a píxel (`stage/TurnButton.jsx`), en la esquina superior derecha de cada caja; sustituye al botón de texto. Abajo pisaba los pies y la cola de los sprites.
- **Silencio en móvil y tablet:** solo el botón (`MusicControl compact`), en la fila "Viajero / Mascota", que queda fija al desplazar. En pantalla ancha sigue con su barra de volumen. Por debajo de `lg` no hay barra de volumen en el creador (en táctil ya sobraba; en una ventana estrecha de escritorio se regula desde Opciones).
- **"Volver al inicio":** en móvil va en la barra fija de abajo, en el hueco libre de una rejilla de 2×2 (no crece); en pantalla ancha, junto al título.
- **Título neutro:** "Tu avatar" (y "Your avatar"); la caja del avatar dice "Viajera" o "Viajero" según el cuerpo elegido. Quedan textos con "viajera" fuera del creador (ayuda de la portada, "Personalizar viajera") por revisar.
- **Columna izquierda sin scroll en pantalla ancha:** ocupa el alto de la ventana y las cajas de las escenas se estiran (tope de 26 rem). Los nombres van uno junto al otro, con el botón de sonido de la mascota en la fila de su etiqueta (16 px sobre el campo, por la sombra dura), y la casilla de la marcha comparte fila con la música. Medido sin scroll a 1920×1080, 1280×720 y 1366×620.
- **"Sin mascota" es un botón** que abre la pestaña Mascota, lleva el foco a ella y acerca el panel.
- **Verificado:** móvil (375 y 320 px) y escritorio en el navegador; 245 pruebas del frontend, 60 del backend, lint y build sin errores. No se probaron tablet ni el clic de "Sin mascota" en escritorio.
- **Visión:** pule la fase 1b (creador) sin tocar el modo clásico.

## Pendiente

### Quitar el blog del portfolio (decidido el 2026-11-09)
- Guadalupe ha decidido **retirar el blog** porque no le da uso. Hoy solo se ha quitado el acceso directo "Blog" del menú de la portada, que ahora muestra Proyectos, Contacto y CV centrados.
- **Hacerlo al rediseñar el modo clásico (`/clasico`)**, no antes, y avisarla del alcance antes de borrar nada. Dónde sigue el blog:
  - Frontend público: `pages/Blog.jsx`, `BlogPost.jsx`, `BlogPostPreview.jsx`, rutas en `routes/AppRoutes.jsx`, enlace en `components/Navbar.jsx`, sección en `components/valle/Content.jsx` y `pages/Clasico.jsx`, mención en `pages/PoliticaPrivacidad.jsx`, hook `hooks/usePost.js`, y textos en `lib/valleCopy.js`.
  - Juego: la mazmorra es la zona del Blog (`game/world.js`, `game/sprites.js`, `components/valle/ZonePanel.jsx`); hay que decidir qué ocupa su lugar en el mapa.
  - Backend y datos: `backend/lib/sitemap.js` (el sitemap incluye los posts), `backend/routes/ogMeta.js`, `backend/lib/database.js`, `backend/data/systemPrompt.js` (el chat habla del blog) y los tests de contenido. Los posts viven en PostgreSQL y el CMS `/bitacora` los edita.
  - Decidir si el CMS conserva la edición de proyectos y se retira la de posts, y qué pasa con las URLs `/blog/...` ya indexadas (redirección o 410).
  - Revisar `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y `docs/VISION.md` cuando se quite.

### Visión de producto
- La hoja de ruta de `docs/VISION.md` marca seis fases: identidad visual, `/clasico` como landing profesional, primer edificio completo (Taller del Código), resto del pueblo, mecánicas de aventura y pulido. El rediseño de `/clasico` (fase 2) lo hará la usuaria con las skills de diseño cuando termine el trabajo en curso. Antes de la fase 3 hay que cerrar las decisiones pendientes de su sección 13 (mapa, escala de tiles y sprites, estilo de edificios, diseño del modo clásico, interiores, NPC y mecánicas de la primera versión).

- Fase 1b de la visión (portada viva): la música también debe sonar dentro del valle (hoy solo suena en la portada y el creador). `Valle Exploration.mp3` ya está en `frontend/public/audio/` pero no suena en ningún sitio.
- Portada: los sonidos ambiente (viento, lluvia, grillos, pájaros, truenos) son sintéticos y no se han escuchado; si no convencen, se sustituye cada capa por una grabación. Lupe es una aproximación de su lámina (faltan mangas abullonadas y collar), y el dibujo de la pata de Khalessi aseándose es sencillo. Un tercer bioma de invierno (nieve) quedó fuera.
- Creador de personaje, ampliaciones opcionales (la fase 1b del creador está cerrada): de la sección 6 de `docs/VISION.md` quedan fuera las constituciones dentro de cada avatar y las formas de cara; se pueden añadir prendas (bufanda, delantal); y los complementos se eligen de uno en uno (unas gafas y un sombrero a la vez no se pueden), así que separarlos en capas compatibles sería el siguiente paso. Falta probar el creador con un lector de pantalla real y con un dispositivo táctil real: solo se ha revisado con scripts y emulación.
- El juego usa la hoja de poses del generador nuevo. Falta revisarla andando durante más rato por el valle (puertas, casas) con las prendas más anchas (falda larga, vestido) y el pelo largo; hasta ahora se ha visto en reposo y andando hacia la derecha.
- Fase 1 de la visión, lo que falta: vallas, flores en macetas y otros detalles de cariño; diseño propio del Taller y renombrar los edificios (Taller, Biblioteca, Taberna, Correos).

### Personajes y mascotas (decisiones del 2026-11-09)

Las reglas de producto están en `docs/VISION.md`, sección 6; aquí solo se registra qué falta. El creador de la viajera y la elección de mascota ya están hechos; lo que sigue son los puntos de abajo.

**Papeles** (Khalessi es la gata de Lupe, no la mascota del visitante): ya no sigue a la viajera ni sale en el creador, y en la portada acompaña a Lupe (la visita, la acaricia y juega por el prado).
- Lupe ya tiene sprite y diálogo en la portada (ver "Portada viva"). Siguen pendientes su retrato, su papel como NPC dentro del valle y la bienvenida completa de `DIALOGOS.md`: los diálogos de la portada son una versión propia, más corta.

**Orden de prioridad** (propuesto en el encargo, pendiente de arrancar):
1. ~~Aprobar y consolidar la base visual del avatar.~~ Hecho el 2026-11-09 (16×28, lienzo 18×34). Siguen sin fijarse las dimensiones de las mascotas y los NPC.
2. ~~Adaptar las opciones actuales (peinados, ropa, complementos) a esa base.~~ Hecho el 2026-11-09 (`game/avatar/`). Los peinados que no son el bob conservan su forma de antes y no se han revisado uno a uno con la usuaria.
3. Mejorar el editor (opcional): la vista previa ya anda y gira (hecho el 2026-11-09). Faltan guardar y recuperar varias personalizaciones, aleatorizar por categorías con bloqueo y restablecer por categoría; hoy existen "Aleatoria" y "Restablecer" globales.
4. Mascota del visitante: hecho lo de elegir sin mascota, perro o gato con cinco razas y dos colores cada una, vista previa y persistencia (`SAVE_VERSION` 2). Hecho el nombre propio y el sonido (2026-11-09). Faltan desactivar el acompañamiento sin perder la elección y cambiarla dentro del valle, y usar el nombre en el juego (hoy solo se guarda).

**Propuestas pendientes de concretar** (en `docs/VISION.md`, 6.4): el nombre de la mascota usa por ahora el mismo límite que el de la viajera (16 letras) y empieza vacío; faltan por decidir el valor por defecto, la selección inicial de apariencias por especie, la distancia y recuperación del seguimiento, comportamiento en interiores, diálogos y viaje rápido, y comportamiento con movimiento reducido.

### Estructura y calidad de código
- Revisar con el mismo criterio el resto de comentarios en español: tono natural, explican el porqué.

### Funcionalidad
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
| La mascota del visitante es perro o gato opcional, con variaciones solo cosméticas (2026-11-09) | Personalizar sin crear diferencias de personalidad ni habilidades. Implementada con cinco razas por especie. |
| Base visual del avatar aprobada: figura de 16×28, lienzo de 18×34 (2026-11-09) | Lupe prefirió la escala pequeña; las dimensiones de los NPC siguen abiertas. |
| El avatar sale de un único generador por partes, con hoja de 3 poses × 4 direcciones (2026-11-09) | Editor, portada y juego no pueden divergir, y cada parte se retoca sin tocar las demás. |
| El perfil izquierdo se refleja solo donde no rompe asimetrías (2026-11-09) | El guiño, el rapado, el lazo y la flor cambian de lado y se dibujan desde el lado que enseñan. |
| `CLAUDE.md` y `AGENTS.md` viven dentro del repo | Para tener el contexto completo al trabajar desde otro ordenador. |
| El valle llena toda la pantalla con zoom entero de cámara (2026-11-09) | Un lienzo fijo de 320×180 dejaba barras en móvil y tablet. El zoom entero mantiene el pixel art sin costuras y los sprites se ajustan igual en cualquier pantalla. |
| Cada avatar (mujer u hombre) guarda su propio aspecto en el creador (2026-11-09) | Lo que se cambia en uno no debe tocar al otro; alternar recupera lo ya hecho y un avatar sin tocar parte de su aspecto de partida. |
| Khalessi no es una opción de mascota ni acompaña a la viajera (2026-11-09) | Es la gata de Lupe. Los gatos de la viajera no son siameses para no parecerse a ella. |
| El creador se reparte en pestañas (cuerpo, ropa, mascota) y la viajera y la mascota tienen cada una su escena (2026-11-09) | Una sola pantalla con más de 80 opciones recargaba; separar las escenas permite ver cada una a su tamaño, también al girar. La pestaña se llama "Mascota", como la escena. |
| El nombre de la mascota se guarda aparte de la mascota y sale del mismo limpiador que el de la viajera (2026-11-09) | Cambiar de especie o de raza no debe borrar el nombre, y un solo criterio de limpieza evita dos formas de guardar texto del visitante. |
| El sonido de las mascotas son las grabaciones de Lupe, con el tono según la raza (2026-11-09) | Son el sonido que ella eligió; cambiar la velocidad da una voz distinta a cada raza sin más archivos. |
| Los apartados del creador van en una sola columna, todos del mismo ancho (2026-11-09) | Con dos columnas, las tarjetas estrechas y las anchas daban opciones de tamaños distintos. |
| Cada campo del creador se presenta como opciones primero y colores debajo (2026-11-09) | Una sola jerarquía en todos los apartados; el nombre del color elegido se ve al lado del título de su fila. |
| La viajera admite cualquier color; la mascota solo los de su paleta (2026-11-09) | Un perro verde no tiene sentido, mientras que el pelo o la ropa de colores sí encajan en el mundo. |
| El fondo de las tarjetas del creador es el verde del prado (2026-11-09) | Lo prefirió Lupe tras probar un gris violáceo; coincide con algunos colores elegibles, pero el contorno oscuro de los sprites mantiene la silueta. |
| La vista previa del creador anda en el sitio y se puede parar con una casilla (2026-11-09) | Se ve cómo queda el personaje en movimiento, también de perfil, sin salirse de su caja; quien prefiere quietud (sistema u Opciones) la tiene apagada de entrada. |
| Las listas del creador tienen 8 o 16 opciones y las rejillas, 4 u 8 columnas (2026-11-09) | Así ninguna fila queda a medias; se crearon las opciones que faltaban en vez de dejar huecos. |
| Las láminas de `img/` son la referencia de estilo de cada opción del creador y la carpeta no se sube a git (2026-11-09) | Son material de trabajo de Lupe; el repositorio solo lleva el resultado implementado. |
| Los rasgos faciales (pecas, lunares, cejas, cicatrices) se eligen de uno en uno junto con el vello, en el campo `trait` (2026-11-09) | La lámina los presenta como una sola rejilla de dieciséis; así se evita mezclar capas sin que lo pida el diseño. |
| Cada avatar ofrece solo los peinados de su lámina (2026-11-09) | Las láminas de mujer y de chico son listas distintas; los tres peinados que repiten (ondulado, rizado corto, moño) se dibujan igual en los dos. |
| Cada raza de mascota tiene su propio tamaño de lienzo (2026-11-09) | Lupe pidió que el tamaño se ajuste a la raza (un pastor no mide como un teckel). Sustituye al lienzo único 26×16. |
| Las mascotas se tiñen con dos paletas comunes (pelo y detalles) y cada raza decide dónde van (2026-11-09) | Da personalización real sin tablas de pelajes por raza; las sombras y contrastes se calculan, así cualquier combinación se ve bien. |
| El cielo y el tiempo de la portada son funciones puras de (tiempo, semilla) | Poder probarlos sin canvas ni audio y que dibujo y sonido solo los consuman. |
| Los bocadillos de Lupe son HTML sobre el canvas, no texto dibujado | Texto nítido, traducible y con saltos de línea; el lienzo de 320×180 no admite una tipografía legible. |
| Las rutas de Khalessi se calculan por distancias a velocidad constante y su juego se decide con el cielo al empezar la escena | Nunca se teletransporta ni cambia de juego a mitad; y se puede comprobar con pruebas. |
| El sonido ambiente se genera con Web Audio, sin archivos | No hay grabaciones propias todavía; se pueden sustituir capa a capa. |
| La barra de volumen de la pantalla es el volumen general y el altavoz silencia todo | Una sola barra, igual en la pantalla y en Opciones, y un silencio que de verdad calla. |
| "Personalizar viajera" sale del menú de la portada; se hace al empezar una nueva aventura y desde el botón dentro del juego | Una portada más limpia y un flujo más claro: quien vuelve continúa. |
| Comillas siempre rectas, nunca angulares | Preferencia expresa de Guadalupe. |
| La visita principal son reclutadores y clientes freelance por igual, y el objetivo actual es conseguir empleo (2026-11-09) | Marca la prioridad del modo clásico profesional y de que ninguna mecánica esconda información. Recogido en `PRODUCT.md`. |
| Cartel de instalación propio, sin dependencias de PWA (ni `vite-plugin-pwa`) | El service worker necesario es de 50 líneas y una dependencia más de build no aportaba nada. En iPhone no existe diálogo de instalación, así que el cartel tiene que explicar los pasos. |
| En pantallas táctiles (móvil y tablet) se oculta la barra de volumen general y solo queda el altavoz de silenciar | El volumen general lo regulan las teclas físicas del dispositivo, y la web no puede leerlas para sincronizar una barra. Se decide por `(pointer: coarse)` (`.px-volume-bar` en `pixel.css`), no por el ancho: una ventana estrecha de escritorio conserva la barra. Música y Efectos de Opciones se mantienen. |
| Opciones de la portada: una columna compacta en móvil y dos columnas desde 640 px de ancho; en pantallas de menos de 600 px de alto se ocultan los textos de ayuda y se aprieta el espaciado | Debe caber sin desplazarse en móvil vertical y horizontal. Medido sin desplazamiento en 320×568, 360×640, 390×844, 667×375 y 768×1024. Los avisos siguen ligados a su control (`aria-describedby`) aunque no se vean. |
| (Revisada el 2026-11-09: el subtítulo vuelve a ir bajo el título también en móvil, sin apellido, a petición de la usuaria; en la captura a 375 px el bocadillo de Lupe no lo tapa.) Portada: en móvil el subtítulo baja al pie del mapa (sobre el menú) y sin apellido; la firma de la esquina pasa de "Luprintech" a "Guadalupe Cano" (2026-11-09) | Los bocadillos de Lupe tapaban el subtítulo bajo el título, y sin el apellido cabe en una fila. En web el subtítulo sigue bajo el título y con el nombre completo. |
| Portada: sin firma en la esquina y menú de accesos con Proyectos, Contacto y CV centrados, sin Blog (2026-11-09) | Guadalupe retirará el blog del portfolio; el resto de su limpieza queda anotada en "Quitar el blog del portfolio" y se hará con el modo clásico. |
| El CV se ve en una página propia `/cv` (visor de PDF con "Volver" y "Descargar PDF") en vez de abrir el PDF suelto (2026-11-09) | En iPhone, y sobre todo en la app instalada, un PDF abierto a pantalla completa no tiene forma de volver atrás. `/cv` es pantalla completa sin la barra del modo clásico y reutiliza `PdfPreview`. Los enlaces "CV" de la portada y de Sobre mí apuntan ahí. Sin probar en un iPhone real. |
| La barra del visor del CV es compacta: "Pagina 1 / 1", "-", porcentaje de zoom, "+" y flechas de página, sin "Ajustar ancho", "Pagina completa" ni el botón "100%" (2026-11-09) | Menos controles y cabe en una fila en móvil. Es la opción `compact` de `PdfCanvasViewer`; el editor del CMS y los documentos del blog conservan la barra completa. |
