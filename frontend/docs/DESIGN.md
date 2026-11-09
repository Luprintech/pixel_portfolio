# Sistema de diseño: Valle del Bucle

Sustituye al sistema anterior ("The Neon Luminary", fucsia/cian). Aquel se descartó por genérico; este busca algo original y con reino propio.

## 1. Idea

Un overworld top-down en pixel art, inspirado en los Zelda clásicos pero con identidad propia. Cada zona del portfolio es un edificio del valle. Quien prefiera leer sin jugar tiene el **modo clásico**, hecho en HTML real, accesible e indexable.

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

- **Protagonista**: princesa original (no es Zelda). El aspecto se edita (pelo, piel, vestido, aro) o se genera al azar; se guarda en `localStorage` con la clave `valle-del-bucle:look` (`game/look.js`).
- **Compañera**: Khalessi, gata siamesa tabby real de la usuaria.

## 4. Color

Todos los colores viven como tokens en `frontend/src/index.css`; el juego usa los mismos valores en `game/palette.js`. Modo claro = Hueso, modo oscuro = Tinta.

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

## 7. Interacción

- Teclado y joystick táctil (`components/valle/Joystick.jsx`) en móvil.
- El panel de cada zona (`ZonePanel.jsx`) reutiliza `Content.jsx`, igual que el modo clásico.
- Phaser 3.80.1, lienzo 320×180 con escalado `FIT` y `pixelArt: true`.

## 8. Accesibilidad

El juego no es la única vía: el modo clásico ofrece todo el contenido como HTML semántico. Mantén contraste suficiente entre token de texto y fondo en ambos temas, y foco visible con `--px-ring`.

## 9. Idiomas

Español e inglés. Textos del Valle y del clásico en `frontend/src/lib/valleCopy.js`; el resto con i18next (`frontend/src/locales`).
