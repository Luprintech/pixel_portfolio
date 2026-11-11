# Sistema de diseño: Valle del Bucle

Sustituye al sistema anterior ("The Neon Luminary", fucsia/cian). Aquel se descartó por genérico; este busca algo original y con reino propio.

## 1. Idea

Un overworld top-down en pixel art, inspirado en los Zelda clásicos pero con identidad propia. Cada zona del portfolio es un edificio del valle. Quien prefiera leer sin jugar tiene `/clasico`, que desde 2026-11-10 sirve la web original (ver la excepción al final de la sección 6), hecha en HTML real, accesible e indexable.

Referencia de inspiración (no copiar): alexxblaro16.github.io.

## 2. Mapa del valle

| Edificio | Contenido |
| --- | --- |
| Casa roja | Sobre mí |
| Casa turquesa | Proyectos |
| Casa morada | Contacto |
| Herrería (chimenea, brillo) | Stack |
| Mazmorra | Blog |

Mapa de 56×30 teselas de 16 px. Definición en `frontend/src/game/world.js`. Se entra a una casa **pisando su puerta**.

El valle se organiza alrededor de una plaza empedrada central con un cartel, de la que parte un camino principal de este a oeste. Escala, reglas de sprites y reparto completo en `docs/IDENTIDAD-VISUAL.md`.

## 3. Personajes

Reparto de papeles (decidido el 2026-11-09; el detalle de producto está en `docs/VISION.md`, sección 6):

- **La viajera o el viajero**: el personaje personalizable de quien visita el portfolio, independiente de Lupe. Es un avatar original (no es Zelda) con nombre propio. Su aspecto se edita por capas o se genera al azar y se guarda en `localStorage` dentro de la partida versionada `valle-del-bucle:save` (`game/save.js`, `game/look.js`, `game/avatar/`).
- **Lupe**: la anfitriona y guía del pueblo. Recibe al visitante y orienta sin imponer recorrido. Aún no tiene sprite ni retrato.
- **Khalessi**: la gata de Lupe y su pareja, gata siamesa tabby real. Acompaña a Lupe en la bienvenida y puede aparecer junto a ella. **No es la mascota del visitante**.
- **Mascota del visitante** (futura, no implementada): perro o gato opcional con nombre propio y apariencia cosmética. No sustituye a Khalessi ni toma su nombre, historia o diálogos.

La base visual del avatar está aprobada (2026-11-09): figura de 16×28 en un lienzo de 18×34 por fotograma, con tres poses (reposo y dos pasos) en cuatro direcciones. Las dimensiones de Khalessi, las mascotas del visitante y los NPC se fijan en `docs/IDENTIDAD-VISUAL.md` y siguen abiertas.

## 4. Color

Todos los colores viven como tokens en `frontend/src/index.css`; el juego usa los mismos valores en `game/palette.js`.

Hay dos ejes de tema. El **tema del sitio** (`data-theme` en `<html>`, `context/ThemeContext.jsx`) tiene tres valores: **`valle`** (por defecto, pastel), **`dark`** (modo noche) y `light` (hueso, heredado). Gobierna el blog, el CMS y las páginas que no son el juego; su botón está en la barra del sitio y se guarda en `valle-del-bucle:theme`.

El **tema del juego** (`data-game-theme` en `<html>`, `context/GameThemeContext.jsx`) existe solo en la portada y el valle y se elige en Opciones: **Aventura** (por defecto: el azul marino y el azafrán originales, paleta de `game/palette.js`) y **Cozy** (el pastel de la sección siguiente). Se guarda en `valle-del-bucle:game-theme`, se cambia en caliente sin reiniciar la partida y es independiente del tema del sitio; `/clasico` no lo recibe. Aventura usa los tokens del bloque oscuro de `index.css` y Cozy los del bloque valle, con la especificidad suficiente para ganar al tema del sitio dentro del juego.

### Tema Aventura (por defecto en el juego)

La paleta original de la tabla que sigue a la sección Cozy, sin mezcla de rosa pastel, frambuesa ni lavanda. Es lo que se ve en el juego si no hay una elección guardada.

### Tema Cozy (el tema valle de antes)

Lavanda, rosa empolvado, azul cielo y marfil, con texto y contornos en ciruela oscuro. La frambuesa se reserva para la acción principal y lo seleccionado; no se reparte por marcos, enlaces ni controles en reposo. Los valores viven como `--t-*` en el bloque valle de `index.css`, que sirve al tema del sitio `valle` y al tema del juego Cozy.

| Nombre | Hex | Uso |
| --- | --- | --- |
| Ciruela | `#3a1c47` | Texto, contornos, sombras duras (`--t-ink`) |
| Lavanda | `#dccbf0` | Fondo de página y paneles flotantes (`--t-lavender`); `#bfa6dd` para anillos y sombras (`--t-lavender-deep`) |
| Marfil | `#fff6e6` | Tarjetas, botones secundarios, bocadillos (`--t-ivory`) |
| Rosa empolvado | `#fbd3e3` | Apoyo y hover suave (`--t-powder`) |
| Azul cielo | `#bfe3f7` | Apoyo (`--t-sky`) |
| Frambuesa | `#d81b6a` | Solo acción principal y selección (`--t-berry`); `#a30f4c` para texto, enlaces y foco (`--t-berry-deep`); `#f27ab0` en hover (`--t-berry-soft`) |
| Pistacho | `#b5d19a` | Fondo de las tarjetas con dibujo del creador (`--t-tile`); la cruz de "sin opción" va en `#a30f4c` |

Contrastes comprobados: ciruela sobre lavanda 9,6:1, frambuesa honda sobre lavanda 5,1:1, marfil sobre frambuesa 4,6:1, contorno de los sprites sobre el pistacho 11:1.

**Cómo se usa en el código.** Las piezas que llevan colores en línea (creador, panel de zona, HUD, joystick) los piden con `tone('ink', PAL.ink)` (`lib/tone.js`): la variable del tema si existe y, si no (modo noche), el color de siempre. Las piezas compartidas (botones, enlaces, volumen, marcos, diálogos, campos) se tiñen en la sección de tema pastel de `pixel.css`; la portada, en `title.css`. El paisaje de la portada y el prado de las escenas del creador se aclaran y suavizan en el propio dibujo (`game/titleSoften.js`), no con un filtro CSS, para que Lupe, Khalessi y las flores móviles conserven su color. El mapa del juego (`/valle`) se pinta con la paleta del tema del juego: la original en Aventura y la aclarada en Cozy.

| Nombre | Hex | Uso |
| --- | --- | --- |
| Tinta | `#1c1b3a` | Fondo oscuro, contornos |
| Musgo | `#4f7f3f` | Vegetación oscura |
| Prado | `#a3c14f` | Hierba, acento verde |
| Laguna | `#3e9bb0` | Agua, acento secundario |
| Azafrán | `#f2b134` | Acento principal, anillos de foco |
| Teja | `#d4503a` | Tejados, acento cálido |
| Hueso | `#f1e6cf` | Fondo claro, texto sobre oscuro |
| Rosa | `#f4b8cc` | Solo hover de los botones secundarios (`--accent-rose`); el azafrán sigue siendo el color del botón principal |

Dentro del juego, cada color base se amplía con una escala de cuatro o cinco tonos (`TONE` en `game/palette.js`: hierba, tierra, agua, arena, madera, pared, piedra y cerezo) para sombrear al estilo cálido de Stardew. Los contornos son del tono oscuro de cada sprite, no negro. Detalle en `docs/IDENTIDAD-VISUAL.md`.

Tokens de superficie y texto: `--bg-primary`, `--bg-surface`, `--text-primary`, `--accent-primary`, etc. Usa siempre el token, nunca un hex suelto.

## 5. Tipografía

- **Jersey 10**: títulos (`--font-headline`, clase `.px-title`).
- **Pixelify Sans**: interfaz (`--font-body`, clase `.px-text`).
- **Literata**: texto largo como posts del blog (`--font-read`, clase `.px-read`).

## 6. Componentes y estilo

`frontend/src/pixel.css` define marcos, botones y títulos de píxel a partir de los tokens. Bordes duros, sombras sólidas sin difuminar, esquinas rectas. Nada de gradientes, partículas ni cristal esmerilado.

**Excepción: `/clasico`.** Desde 2026-11-10 esa ruta usa la web original (fucsia `#e879f9`, cian `#22d3ee`, fondo `#0b1120`, Manrope, Plus Jakarta Sans y Space Grotesk, gradientes y cristal incluidos). No usa los tokens del Valle: sus tokens propios viven en `frontend/src/clasico/clasico.css` bajo `.clasico-root`, y nada de ese archivo puede salir de ese selector. Todo lo demás se rige por este documento.

## 7. Interacción

- Teclado y joystick táctil (`components/valle/Joystick.jsx`) en móvil.
- El panel de cada zona (`ZonePanel.jsx`) reutiliza `Content.jsx`.
- Phaser 3.80.1, lienzo 320×180 con escalado `FIT` y `pixelArt: true`.

## 8. Accesibilidad

El juego no es la única vía: `/clasico` ofrece el contenido como HTML semántico. Mantén contraste suficiente entre token de texto y fondo en ambos temas, y foco visible con `--px-ring`.

## 9. Idiomas

Español e inglés. Textos del Valle en `frontend/src/lib/valleCopy.js`; el resto con i18next (`frontend/src/locales`).
