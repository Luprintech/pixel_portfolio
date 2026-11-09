# Identidad visual de Valle del Bucle

Resultado de la fase 1 de `docs/VISION.md`. Fija las reglas gráficas que deben cumplir sprites, terreno y edificios nuevos. Las decisiones que siguen abiertas están marcadas como **pendiente**.

## 1. Escala

Auditoría de lo que existe hoy:

| Elemento | Tamaño | Relación con la tesela (16 px) |
| --- | --- | --- |
| Tesela de terreno | 16×16 | 1 |
| Protagonista | 16×28 (lienzo 18×34 con contorno y margen para moños) | casi dos teselas de alto |
| Gata Khalessi | 20×13 (lienzo 22×14) | algo menos de una tesela de alto |
| Árbol | 44×60 | casi 3 de ancho, 3,75 de alto |
| Casa | 64×64 | 4 × 4 teselas |
| Mazmorra | 80×52 | 5 × 3,25 teselas |
| Lienzo del juego | 320×180 | 20 × 11,25 teselas a la vista |

> Cotas de la tabla comprobadas en el código el 2026-11-09: el lienzo de la viajera es de **18×34** (figura de 16×28, cuatro filas libres arriba para moños y pompones y un píxel de contorno; `avatarCanvas` en `game/avatar/paint.js`) y el de Khalessi de **26×16** (`catCanvas` en `game/sprites.js`). La base visual del avatar quedó **aprobada el 2026-11-09**, así que esas cotas de la viajera son definitivas. El 22×14 de Khalessi es anterior a sus rediseños. **Siguen sin fijarse** las dimensiones de las mascotas del visitante y de los NPC.

**Decisión: mantener la tesela de 16 px** (Stardew también usa 16). Lo que crece es el detalle: la viajera pasa de 10×13 a 16×28 y casas y árboles ganan altura. Motivos:

- Con el lienzo de 320×180 se ven unas 20 × 11 teselas: suficiente para ver un edificio y su entorno sin que el mundo se sienta pequeño.
- Subir a 32 px reduciría el campo de visión, algo malo en móvil.
- El detalle sale del sombreado en varios tonos, la textura y la silueta, no de más píxeles por tesela.

Reglas que se derivan de la escala:

- Los edificios miden un número entero de teselas de ancho. El alto puede llevar media tesela para el tejado.
- La puerta ocupa una tesela de ancho y se sitúa justo debajo del edificio; el felpudo es la propia tesela de la puerta.
- Un personaje debe caber por un camino de una tesela. Los caminos horizontales principales son de dos.
- Los objetos decorativos (cartel, valla, roca) miden como mucho una tesela de ancho y dos de alto.
- La base de cada sprite con colisión se alinea con el borde inferior de su tesela y su cuerpo sólido es solo la parte baja.
- Todo texto o icono de interfaz dentro del lienzo usa múltiplos enteros de píxel. Nada de escalados fraccionarios ni suavizado (`pixelArt: true`).

## 2. Estilo, paleta y contorno

**Dirección: cute y cálido, a la manera de Stardew Valley.** Formas redondeadas, flores por todas partes, tonos suaves y personajes con carita. Es un estilo propio de Lupe: rosa pastel, cerezos en flor y la gata Khalessi, que es de Lupe (no del visitante).

- Los colores base son los de `game/palette.js` y los tokens de `index.css`. Para sombrear, cada superficie usa una **escala de cuatro o cinco tonos** (`TONE` en `palette.js`): hierba, tierra, agua, madera, pared, piedra y cerezo. Un color base nuevo exige añadirlo primero a ambos sitios.
- **Contorno de color**, no negro: cada borde sale del tono más oscuro de su vecino (`outline()` en `game/pixelKit.js`). El terreno no lleva contorno.
- Luz desde arriba a la izquierda: reflejos arriba a la izquierda y sombra proyectada abajo a la derecha.
- Cada superficie lleva textura (ruido de valor, matas, guijarros, grietas); nunca un color plano.
- Los bordes de camino, laguna y plaza son irregulares: se calculan con la distancia al borde de las teselas más un poco de ruido (`game/ground.js`).
- Sombras pixeladas y duras (`shadowSprite`), sin degradados ni transparencias suaves.
- Detalles de cariño: jardineras con flores en las ventanas, postigos de colores, cerezos rosas entre los árboles verdes y flores agrupadas en la hierba.
- Rosa pastel (`--accent-rose`) y azafrán son los acentos de la marca; el rosa no sustituye al azafrán en botones principales.

## 3. Terreno

| Tipo | Uso | Tesela |
| --- | --- | --- |
| Hierba | Fondo general, con salpicado de motas y flores sueltas | `grassTile` |
| Camino de tierra | Senderos entre la plaza y cada puerta | `pathTile` |
| Plaza empedrada | Centro del pueblo | `plazaTile` |
| Agua | Lago | `waterTile` |

Criterios:

- La plaza se distingue del camino por material y color: adoquín claro frente a tierra.
- Los caminos solo llegan a puertas, plaza o cruces. No hay caminos que no lleven a ninguna parte.
- **Pendiente:** bordes y esquinas naturales entre hierba y camino. Hoy el límite es recto; requiere un autotile de transición.

## 4. Vegetación

- El borde del mapa es un cinturón de árboles que cierra el escenario.
- Dentro, los árboles se reparten sin tapar caminos, plaza, puertas, lago ni el punto de aparición.
- Agrupar mejor que esparcir: un grupo de tres o cuatro árboles dice más que ocho sueltos.
- **Pendiente:** variedad de tamaños y tipos (pino, arbusto, flores agrupadas). Hoy hay dos variantes de color del mismo árbol.

## 5. Edificios

- Cada edificio representa una sección real del portfolio y es reconocible por la **silueta** además del color.
- Los tejados son los que aportan identidad: color propio por edificio (rojo, turquesa, morado, gris) y rasgos distintivos (chimenea y brillo en la taberna, arco de piedra en la biblioteca).
- Cuerpo de tono hueso, tejado en filas de dos tonos, ventanas en azafrán, puerta de madera.
- **Pendiente (sección 13 de la visión):** estilo final de los edificios. El Taller del Código será el primero en recibir un diseño propio cuando se aborde la fase 3.

## 6. Distribución del valle

Mapa de 56×30 teselas. Una plaza central de 9×6 y un camino principal de este a oeste que la cruza. Cada edificio cuelga de ese eje con un ramal corto hasta su puerta.

```
        N
   Casa de Lupe        Taller        Biblioteca
   (Sobre mí)          (Proyectos)   (Blog)
        \                  |            /
  W ---- camino ---- [ PLAZA + cartel ] ---- camino ---- E
        /                              \
   Taberna                  Lago        Correos
   (Stack)                              (Contacto)
        S
```

| Zona | Id en el código | Posición (teselas) | Puerta |
| --- | --- | --- | --- |
| Plaza | `PLAZA` | 24,12 (9×6) | cruce de caminos |
| Casa de Lupe: Sobre mí | `about` | 10,6 | 12,10 |
| Taller del Código: Proyectos | `projects` | 26,4 | 28,8 |
| Biblioteca de los Logs: Blog | `blog` | 42,6 | 44,10 |
| Taberna del Debug: Stack | `stack` | 10,19 | 12,23 |
| Oficina de Correos: Contacto | `contact` | 44,17 | 46,21 |
| Lago | `LAKE` | 26,21 (9×5) | n/a |

Razones del reparto:

- El Taller queda justo al norte de la plaza, en línea recta desde donde aparece la protagonista: es el destino principal y el primer edificio completo de la hoja de ruta.
- Casa de Lupe y Taberna al oeste, Biblioteca y Correos al este: dos edificios por lado, nada apelotonado y con el lago como respiro al sur.
- Una sola dirección de lectura de oeste a este por el camino principal; cada ramal es corto para no obligar a recorrer el mapa.
- No se reproduce la distribución de ninguna web de referencia.

Los nombres con los que el juego rotula cada edificio (`valleCopy.js`) siguen siendo los de siempre: renombrarlos a Taller, Biblioteca, Taberna y Correos es una decisión de contenido pendiente.

## 7. Portada

Composición cerrada (`pages/Title.jsx`, `game/titleArt.js`):

- Nombre «Valle del Bucle» como protagonista y debajo el subtítulo «El portfolio interactivo de Guadalupe Cano». «Luprintech» queda como firma de estudio en la esquina inferior derecha, igual que el crédito de una pantalla de título.
- Paisaje con tres planos dibujado a 320×180 con los mismos sprites del juego: montañas, sol y nubes al fondo; una aldea lejana y pequeña sobre la colina; y en primer plano la herrería con humo, la mazmorra, un cerezo en flor, la viajera y Khalessi.
- La aldea del fondo deja libre la zona baja izquierda: el menú no tapa casas.
- Menú compacto con tres opciones: «Nueva aventura», «Personalizar viajera» y «Modo clásico», más los atajos a Proyectos, Blog y Contacto. En móvil la ilustración ocupa la parte superior y el menú va debajo, así la viajera y la gata siguen a la vista.
- Color: el botón principal es azafrán; el rosa (`--accent-rose`) solo aparece al apuntar los botones secundarios.
- Pendiente: «Continuar explorando» (requiere guardar progreso), «Opciones», animaciones ambientales (nubes, humo, pájaros) y música.

## 8. Criterios al añadir un elemento

1. ¿Usa solo colores de la paleta y contorno de Tinta?
2. ¿Respeta la escala de 16 px y los tamaños de este documento?
3. ¿Tiene función (guía, decora con sentido, marca un lugar) o solo rellena?
4. ¿Se ve bien en un lienzo de 320×180 sin escalar de forma fraccionaria?
5. ¿Deja pasar a la protagonista y a la gata?
