# Valle del Bucle — Visión de producto y dirección de diseño

**Proyecto:** Portfolio interactivo de Guadalupe Cano (Luprintech)  
**Estado:** Diseño y desarrollo en curso  
**Última integración:** 9 de noviembre de 2026 (unifica la visión inicial del 8 de noviembre con «Visión y decisiones de producto» del 9)  
**Tipo:** Documento de visión, decisiones y propuestas de implementación

---

## 0. Mapa de documentos

Este archivo es la visión general. Los otros dos documentos de trabajo la complementan y se leen juntos al diseñar:

| Documento | Qué contiene | Cuándo consultarlo |
| --- | --- | --- |
| `docs/VISION.md` (este) | Objetivo, identidad, mecánicas, controles, arquitectura, privacidad, hoja de ruta y decisiones pendientes | Siempre, antes de cualquier tarea de juego, portada o `/clasico` |
| [LORE_Y_MUNDO.md](LORE_Y_MUNDO.md) | Hechos biográficos, cronología, reparto con seudónimos, relaciones y mapa de lugares | Al diseñar un lugar, un edificio, un personaje o un objeto |
| [DIALOGOS.md](DIALOGOS.md) | Guion de cada interacción: páginas, opciones, condiciones y notas de producción | Al implementar un NPC, un objeto interactivo o un panel de conversación |
| `docs/ESTADO.md` | Qué existe ya y qué falta | Antes de empezar un bloque |
| `docs/IDENTIDAD-VISUAL.md` y `frontend/docs/DESIGN.md` | Reglas gráficas y tokens vigentes | Antes de dibujar o maquetar |

### Cómo interpretar las decisiones

| Estado | Significado |
| --- | --- |
| Decidido | Preferencia expresada por Lupe. |
| Base documentada | Comportamiento descrito en `CLAUDE.md`, `AGENTS.md` o `docs/ARCHITECTURE.md`; comprobar en el código real. |
| Propuesto | Solución editorial o técnica que aún puede cambiar. |
| Pendiente | Falta confirmar información, diseño, disponibilidad o autorización de publicación. |

Nada en estos documentos acredita que una función nueva esté implementada. Las propuestas no son requisitos cerrados.

---

## 1. Objetivo del proyecto

Valle del Bucle es el portfolio personal de Guadalupe Cano (Lupe), desarrolladora web Full Stack, bajo su marca Luprintech.

El objetivo es crear una web profesional con dos formas de navegación:

1. **Modo aventura:** un mundo pixel art explorable donde los visitantes descubren proyectos, experiencia y contenido interactuando con edificios, objetos y personajes.
2. **Modo clásico:** una landing profesional, moderna, accesible y responsive que presenta todo el contenido sin necesidad de jugar.

Ambos modos comparten la misma información, gestionada desde el CMS existente. El juego aporta personalidad y una experiencia diferente, sin dificultar el acceso a la información profesional.

**Principio del proyecto:** Valle del Bucle debe sentirse como un pequeño mundo que invita a explorar el trabajo de Guadalupe Cano, manteniendo siempre la utilidad y claridad de un portfolio profesional.

## 2. Identidad del proyecto

### Decidido

- Nombre: **Valle del Bucle**. Marca personal: **Luprintech**. Autora: Guadalupe Cano.
- Estética cute, acogedora y pixel art, colorida y con elementos de aventura. Ambientación inspirada en Stardew Valley; exploración, movimiento e interacciones legibles al estilo de Zelda clásico.
- Identidad propia: composición, edificios, personajes, textos, sonidos y recursos originales o con licencia adecuada. Las referencias no son plantillas que reproducir.
- Dos accesos al portfolio, aventura y modo clásico, sin exigir jugar para consultar proyectos, experiencia o contacto.
- **El mundo conecta etapas reales de Lupe con lugares y objetos.** El humor acompaña; los hechos profesionales siguen siendo claros. Esa mezcla autobiográfica es lo que distingue al valle (ver sección 4 y `LORE_Y_MUNDO.md`).
- Conservar la arquitectura y el CMS existentes.

### Referencia externa

Portfolio de Alejandro Blanco: https://alexxblaro16.github.io/

Fue una inspiración inicial para la idea de un portfolio explorable. No debe utilizarse como plantilla visual ni funcional. Evitar especialmente reproducir su combinación de: pantalla inicial oscurecida con menú centrado; misma distribución y denominación de opciones; presentación del nombre como función de código; distribución de edificios que recuerde demasiado a su escenario.

### Derechos de terceros

No reproducir mapas, sprites, edificios, personajes, interfaces ni otros elementos protegidos de Stardew Valley, Zelda o cualquier otro juego. Los guiños (nombres de seudónimos, ambientación) no implican copiar diseños, frases, personalidades o relaciones de esos personajes.

### Propuesto

Una sesión breve debe permitir descubrir un proyecto y contactar. La exploración larga ofrece conversaciones, recuerdos y detalles opcionales. Ningún secreto bloquea el CV ni los enlaces profesionales.

---

## 3. Pantalla de inicio

### Estado actual

Portada pixel art con paisaje al atardecer, montañas, edificios, la viajera y Khalessi (la gata de Lupe). Permite acceder al valle, personalizar la viajera y utilizar el modo clásico.

### Propuesta de mejora

Transformar la portada en una pantalla de título de videojuego con paisaje animado.

**Composición:**

- Nombre «Valle del Bucle» como elemento principal.
- Referencia a Luprintech: «Luprintech presenta · Valle del Bucle · El portfolio de Guadalupe Cano».
- Paisaje pixel art con profundidad visual, la viajera y Khalessi visibles.
- Menú reconocible, sin ocupar excesivamente el escenario.

**Opciones de navegación propuestas:** Nueva aventura · Continuar explorando (si hay progreso guardado) · Personalizar personaje · Explorar portfolio clásico · Opciones. No es necesario que todas aparezcan desde la primera versión. Variante de rotulado propuesta: «Entrar al valle», «Ver portfolio clásico», «Personalizar viajera».

Personalizar la viajera no cambia quién es Lupe: la visitante y la anfitriona son personajes distintos (sección 6).

### Animaciones

Implementar progresivamente: nubes lentas, humo de chimeneas, vegetación con movimiento sutil, pájaros, animaciones de espera de la viajera y de Khalessi, pequeños efectos al seleccionar opciones. Respetar la preferencia de movimiento reducido.

### Audio

Mejora posterior: música original o con licencia compatible y efectos ambientales. El sonido empieza desactivado y se controla fácilmente. No bloquear la entrada con introducciones obligatorias.

---

## 4. Mundo explorable

### Objetivo

Crear un pueblo con zonas reconocibles y edificios que representen partes reales del portfolio y de la historia de Lupe. La sensación debe ser de exploración, pero la navegación sigue siendo sencilla.

El mapa es una **composición simbólica**, no una reconstrucción geográfica de Córdoba, Burgos, Messina o Granada. Evitar un mapa desmesurado: un acceso con panel o interior puede representar varias etapas.

### Dos capas que conviven

El valle tiene una capa **funcional** (dónde se consulta el contenido profesional) y una capa **autobiográfica** (los lugares de la historia de Lupe). Cada lugar de la segunda puede abrir contenido de la primera: por ejemplo, el recorrido laboral desde el Mihrab, o los proyectos desde el PC de la casa.

**Capa funcional (propuestas de la visión inicial):**

| Zona | Contenido |
| --- | --- |
| Plaza central | Entrada y centro de navegación: señales, accesos a otras zonas, NPC de bienvenida |
| Casa de Lupe | Sobre mí: presentación, formación, trayectoria, experiencia, CV y enlaces profesionales |
| Taller del Código | Proyectos como máquinas, mesas de trabajo u objetos interactivos. Cada uno abre una ficha con nombre, descripción, problema que resuelve, tecnologías, capturas reales, funcionalidades y enlaces a GitHub y demo si existen. Se obtienen de la API existente |
| Biblioteca de los Logs | Blog: artículos como libros o estanterías, con recientes, búsqueda y acceso al post completo. El contenido sigue viniendo del CMS |
| Taberna del Debug | Tecnologías, herramientas y experiencia. Puede incluir NPC con diálogos breves. No sustituye la información estructurada y accesible |
| Oficina de Correos | Contacto: reutiliza el sistema de envío y validación existente |

El taller, la biblioteca y el buzón son propuestas funcionales. **No sustituir ni renombrar automáticamente los lugares autobiográficos ya decididos**. Cómo se reparten la Taberna del Debug y el Mihrab, o la Casa de Lupe y la casa del cuarto gaming, está en las decisiones pendientes (sección 16).

**Capa autobiográfica (detalle en `LORE_Y_MUNDO.md`, sección 7):**

```text
NORTE   Jardín del aprendizaje ── Escuelas ── Patio universitario
                  │                              │
OESTE   Piscina ── Plaza de bienvenida ── Taller de proyectos   ESTE
          │            │      │                  │
        Mihrab       Copos   Parada de bus     Biblioteca*
          │            │      │                  │
SUR     Casa de Lupe ── Zona de asistencia ── Punto de encuentro
          └─ azotea         y grúa             de amigos

* Taller, biblioteca y buzón/contacto: ampliaciones funcionales propuestas.
```

El dibujo expresa conexiones, no coordenadas ni tamaño. La casa no necesita estar junto al bar en el diseño final.

| Lugar | Qué representa | Qué permite descubrir |
| --- | --- | --- |
| Casa y cuarto gaming | Aficiones y hogar compartido | Impresora (3D), PC retro (redes), consolas, TV, Khalessi, azotea con telescopio |
| Mihrab | Empleo en el bar | Caja registradora: investigar un problema y configurar una solución |
| Copos | Empleo antes del Bachillerato | Etapa anterior al desarrollo web |
| Piscina y kiosko | Primer trabajo, a los 16 | Primer empleo y vínculo con su hermana |
| Cervantes, Dionisio Ortiz | ESO y Bachillerato de Artes | Hitos de formación |
| Burgos, Messina, Granada | Pedagogía, Erasmus, SICUE | Itinerario universitario y TFG |
| Escuela de DAW y laboratorio | Desarrollo web y máster en curso | Paso hacia el desarrollo y formación en seguridad |
| Zona de asistencia y grúa | Nueve años en RACE | Atención y coordinación, sin inventar métricas |
| Parada, rincón musical, punto de encuentro, paseo, jardín | Entorno familiar y de amistades | Escenas cotidianas opcionales |

Cada episodio relaciona un hecho con una capacidad observable. No atribuir experiencia profesional en ciberseguridad a una formación en curso.

### Posibles zonas futuras

Bosque de los Bugs, Laboratorio de IA, zona de impresión 3D, sala de servidores, museo de proyectos. Son propuestas, no decisiones.

---

## 5. Dirección visual y diseño de escenarios

### Decidido

- Cuadrícula base de **16 × 16 píxeles**. Edificios y árboles pueden ocupar varios tiles.
- Viajera de **16 × 28 píxeles**. La altura visual no determina el área de colisión: usar los pies como referencia.

### Estilo

El valle combina naturaleza amable con tecnología cotidiana: casa con azotea, dos puestos gaming, taller de impresión, piscina, comercio, escuelas y una grúa.

- Escalado entero cuando sea viable y filtrado nítido; sin suavizado que difumine los píxeles. Adaptar el encuadre antes que estirar el mapa.
- Proporciones consistentes, paleta controlada, contornos coherentes y animaciones adecuadas a la resolución.
- Siluetas reconocibles, vegetación por grupos, caminos claros y puertas fáciles de localizar.
- Sombras duras pixeladas y contraste suficiente para texto e interacción.
- Usar los tokens de `frontend/src/index.css` y las reglas de `docs/IDENTIDAD-VISUAL.md`. No reintroducir el tema Neon Luminary.
- Retratos con expresiones discretas: neutral, sonrisa, curiosidad. Las personas se representan con seudónimos y sin caricaturas despectivas.

### Mejoras prioritarias del escenario

Caminos con bordes y esquinas naturales, variaciones de terreno, árboles de distintos tamaños y tipos, arbustos y flores agrupadas, sombras consistentes, señales y carteles, rocas, vallas y objetos decorativos, agua con animaciones sencillas y edificios con siluetas diferenciadas. Evitar decoración sin función ni distribución coherente.

---

## 6. Personajes y mascotas

Esta sección separa cuatro niveles, para que no se mezclen: (1) lo que existe y está comprobado en el código, (2) las decisiones de producto aprobadas, (3) las propuestas aún por concretar y (4) las funciones futuras sin implementar. El estado de la implementación se lleva en `docs/ESTADO.md`; aquí no se repite.

### 6.1 Estado actual (comprobado en el código el 2026-11-09)

- **Viajera:** existe un creador de personaje por capas (cuerpo, cara, pelo, vello, complementos y ropa), con vista previa que gira entre las cuatro direcciones, botones «Aleatoria» y «Restablecer» sobre todo el aspecto, y partida versionada en `localStorage` (`valle-del-bucle:save`, versión 1, con migración de formatos anteriores). Los sprites se generan por código con un único generador por partes (`game/avatar/`), con hoja de 3 poses × 4 direcciones.
- **Khalessi:** existe como sprite (`catCanvas`). Hoy aparece en la portada (pasea y descansa), en la vista previa del creador y dentro del valle, donde **sigue a la viajera** desde la plaza (`ValleScene.js`). Esto último contradice la decisión de abajo y está registrado como pendiente en `docs/ESTADO.md`.
- **Lupe:** no existe como personaje en pantalla (ni sprite, ni retrato, ni diálogo). Solo aparece como autora en textos y en el guion de `DIALOGOS.md`.
- **Mascota del visitante:** no existe.

### 6.2 Decisiones de producto aprobadas (2026-11-09)

- **La viajera o el viajero** es el personaje personalizable de quien visita el portfolio, independiente de Lupe: un avatar sin historia personal asignada. Ambas aparecen en pantalla, pero son personajes distintos.
- **Lupe** es la anfitriona y guía del pueblo. Recibe al personaje visitante y ofrece orientación **sin imponer un recorrido**.
- **Khalessi** es la gata de Lupe y su pareja. Acompaña a Lupe en la bienvenida y puede aparecer junto a ella en el mundo. Dice «meaw!»; puede acompañarse de un maullido original de timbre 8 bit, solo con sonido activado. Sus animaciones y apariciones son propuestas, sin traducir sus maullidos a testimonios humanos.
- **Khalessi no es la mascota personalizable del visitante.** Las mascotas del visitante no sustituyen a Khalessi ni adquieren su nombre, historia o diálogos.
- Sin cuentas de usuario para guardar preferencias.

### 6.3 Mejoras de animación (propuestas)

- Completar animaciones de frente, espalda y laterales; caminar e inactividad; transiciones entre direcciones.
- Mantener las opciones de personalización y conservarlas al navegar por el mundo.

### 6.4 Función futura: mascota del visitante (no implementada)

Es una función futura. Sus puntos se dividen entre lo que ya se ha pedido y lo que está por concretar.

**Pedido para esta función**

- Elección opcional: sin mascota, perro o gato.
- Nombre personalizable, independiente del nombre del avatar.
- Apariencias por estilos de pelaje originales y reconocibles (colores, manchas y patrones). Las variaciones son **solo cosméticas**: ninguna apariencia da personalidad ni habilidades distintas.
- Estilo cute pixel art, escala coherente con el avatar y siluetas claramente distintas entre perro y gato.
- Previsualización junto al avatar antes de entrar.
- Acompañamiento opcional durante la exploración, con animaciones de reposo y marcha.
- Poder cambiar nombre, apariencia o desactivar el acompañamiento después.

**Propuestas por concretar (pendientes de aprobación)**

- *Nombre:* de 1 a 16 caracteres, con los mismos caracteres admitidos que el nombre de la viajera (`sanitizeName`: letras, números, espacio, guion y apóstrofo). Valor predeterminado si queda vacío: «Perro» o «Gato» según la especie, traducido por i18n. No puede ser «Khalessi» (comparación sin mayúsculas ni acentos), para no confundirla con la gata de Lupe.
- *Selección inicial de apariencias* (pequeña, y cada una con nombre accesible además de verse):
  - Perro: canela, negro con pecho claro, blanco con manchas marrones, gris moteado.
  - Gato: naranja atigrado, negro, blanco y negro (bicolor), gris atigrado.
  - Se evita la combinación siamesa crema con máscara marrón en los gatos del visitante, para que Khalessi siga siendo reconocible.
- *Seguimiento:* distancia de seguimiento corta, con retraso suave; si queda más lejos de un umbral (por ejemplo, ocho teselas) o fuera de pantalla, reaparece junto a la viajera. La Khalessi actual sirve de referencia técnica, sin reutilizar su sprite.
- *Interiores:* al entrar a un edificio, la mascota entra con la viajera y se coloca junto a la puerta, fuera de la ruta hacia la salida y los objetos.
- *Diálogos:* durante una conversación se queda quieta y en reposo; no habla ni interviene.
- *Viaje rápido:* aparece junto a la viajera en el destino, sin recorrer el trayecto.
- *Sin bloqueos:* no tiene colisión con la viajera ni con puertas, objetos interactivos o NPC; puede atravesar lo que la viajera ocupa, y nunca impide una interacción.
- *Accesibilidad:* la elección y el nombre se manejan con teclado y en móvil; el acompañamiento se puede desactivar. Por decidir: si con «Reducir el movimiento» activado la mascota se queda quieta junto a la viajera o no acompaña.
- *Persistencia:* local, sin cuenta, dentro de la partida `valle-del-bucle:save`. Requiere subir `SAVE_VERSION` a 2 con un bloque `pet` (`{ species, coat, name, follows }`), una migración desde la versión 1 (sin mascota, acompañamiento activado) y tolerancia a apariencias desconocidas (se sustituyen por la de partida en vez de descartar la partida). Una partida de otra versión mayor se ignora, como hoy. **No se toca el CMS, la API ni la base de datos.**
- *Dimensiones de los sprites:* se fijan después de aprobar la base visual del avatar (ver el orden de trabajo de 6.6).

### 6.5 Otras mejoras futuras del editor (no implementadas)

- Guardar y recuperar la personalización.
- Aleatorizar categorías individuales y bloquear las que se quieran conservar (hoy «Aleatoria» cambia todo).
- Vista previa en cuatro direcciones, en reposo y caminando (hoy hay vista previa con giro, en reposo).
- Restablecer una categoría sin borrar toda la apariencia (hoy «Restablecer» vuelve a todo lo de partida).
- Controles accesibles por teclado y móvil.

### 6.6 Orden de trabajo

1. ~~Aprobar y consolidar la base visual del avatar (cuerpo, cabeza, escala, contorno).~~ Hecho el 2026-11-09.
2. ~~Adaptar las opciones actuales (pelo, ropa, complementos) a esa base.~~ Hecho el 2026-11-09.
3. Mejorar guardado, aleatorización y previsualización (6.5).
4. Diseñar e implementar las mascotas del visitante (6.4).

No se fijan dimensiones nuevas de sprites hasta cerrar el paso 1.

### 6.7 Creación de personaje (primera versión hecha el 2026-11-09; ver `docs/ESTADO.md` para lo que falta)

Decisión de Lupe (2026-11-09): al elegir «Nueva aventura» el juego abre un creador de personaje al estilo de Stardew Valley, con el nombre de la viajera. Los apartados siguientes son la propuesta original; lo implementado y lo pendiente está en `docs/ESTADO.md`. La vista previa del creador mostraba a Khalessi junto a la viajera: con la decisión de 6.2, esa compañía se sustituirá por la mascota del visitante cuando exista (6.4).

**Orden de trabajo:** primero se termina la pantalla de inicio (animación, música y «Continuar aventura»); el creador se aborda después como un bloque propio.

**Flujo propuesto:**

1. Nombre de la viajera (campo de texto con límite de longitud y validación; sin datos personales).
2. Creador con vista previa en vivo, que reutiliza el sprite del juego (y, en el futuro, la mascota del visitante).
3. Confirmar y entrar al valle. Si ya hay partida guardada, avisar de que «Nueva aventura» la sustituye.

**Opciones a ofrecer:**

- Cuerpo: dos o tres constituciones o siluetas, sin etiquetar por género.
- Cara: varias formas y expresiones.
- Pelo: estilos largos, cortos, recogidos y rizados, cada uno con su color.
- Vello facial: con barba, sin barba, bigote y patillas, para quien lo quiera.
- Complementos: gafas, aros, pendientes, gorros, lazos, flores en el pelo.
- Ropa: vestido, camiseta, chaqueta, mono, con varios colores y un ribete.
- Colores: paletas por categoría, con una gama amplia de tonos de piel.
- Botones «Aleatoria» y «Restablecer».

**Requisitos técnicos y de diseño:**

- Sprite por capas (cuerpo, cara, pelo, barba, ropa, complementos) con las mismas cuatro direcciones y el paso de caminar de hoy. Decidir si cada capa es un mapa de píxeles propio o una variante recoloreable de uno común.
- Mismo estilo cute y cálido que el resto del valle, con contorno de color.
- Accesible: teclado y lector de pantalla, con los colores nombrados además de mostrados (criterios en la sección 17).
- Móvil: debe caber en pantalla vertical sin desplazar la vista previa fuera.
- Textos en español e inglés (`valleCopy.js`).
- Se guarda en `localStorage`, como el resto del progreso (sección 8). Ampliar `game/look.js` con el nombre y las capas nuevas, y migrar los looks antiguos de cuatro colores.

---

## 7. Interiores de edificios

Los edificios deberían tener interiores propios.

**Propuesta técnica:** plantilla reutilizable de escenas interiores con punto de entrada y de salida, colisiones, objetos interactivos, eventos de interacción, cámara y límites, e integración con paneles React. Cada interior tiene decoración y contenido propios, pero comparte los mecanismos de navegación.

**Prioridad:** empezar por un solo edificio completo y reutilizar lo aprendido para el resto. La visión inicial elige el Taller del Código; la propuesta del 9 de noviembre empieza por la casa (bienvenida, cuarto gaming, impresora, telescopio y PC). Está por decidir (sección 16).

La casa es una habitación compacta y recorrible: dos escritorios (el de Atreus con dos pantallas, cascos y torre blanca), cama doble, TV, estantería de consolas, rincón de impresión 3D y acceso a la azotea.

---

## 8. Controles y mecánicas de aventura

### Controles (decidido)

| Acción | Control |
| --- | --- |
| Moverse | WASD o flechas |
| Entrar, hablar, examinar | E al estar cerca del objetivo |
| Leer un diálogo | Panel inferior con retrato del hablante a la derecha |

### Contrato de interacción (propuesto)

- Mostrar un único objetivo contextual: «E · Hablar», «E · Entrar» o «E · Examinar». Resolver por distancia y orientación; no activar dos conversaciones a la vez.
- E revela de golpe el texto en curso; la siguiente pulsación avanza. Enter como alternativa accesible. Esc cierra o vuelve atrás.
- Evitar que la misma pulsación abra y salte la primera página; al cerrar, exigir una nueva pulsación antes de reactivar.
- Detener el movimiento mientras haya diálogo o panel. No capturar los controles cuando un formulario tenga el foco.
- Móvil: joystick y botón de acción con etiqueta, con las mismas reglas. Incluir una alternativa accesible fuera del canvas.
- Texto de aparición progresiva con opción de mostrarlo al instante. Sin sonido obligatorio por letra.
- Nombre del hablante siempre en texto; el retrato no es la única identificación.
- Restaurar el foco al cerrar paneles. Menú accesible con controles, volumen y modo clásico.
- La bienvenida se reproduce una vez por partida o hasta completarla; después se puede repetir voluntariamente.

### Mecánicas (propuestas, progresivas)

- **NPC:** explicaciones breves y enlaces a contenido real. Diálogos opcionales y omitibles. No convertir a cada personaje en una recomendación profesional artificial; los objetos pueden mostrar hechos directamente con voz de Lupe.
- **Diario de aventuras:** mapa del pueblo, proyectos descubiertos, lugares visitados y accesos directos.
- **Viaje rápido:** desplazarse directamente a edificios o zonas, sin obligar a recorrer el mapa repetidamente.
- **Misiones opcionales:** tres objetivos (conocer a Lupe, descubrir un proyecto, visitar la biblioteca). Nunca bloquean una sección.
- **Guardado:** preferencias y progreso básico en `localStorage`. Sin autenticación ni tablas nuevas sin necesidad real.
- **Cofres y secretos:** opcionales; nunca esconden información profesional importante.

---

## 9. Diálogos y contenido profesional

La bienvenida presenta a Lupe y a Khalessi y después permite explorar sin tutorial obligatorio. Las conversaciones son de pocas páginas, con una idea por intervención y opciones como «Cuéntame más», «Ver experiencia» o «Seguir explorando». El guion completo, con IDs, condiciones y notas de producción, está en [DIALOGOS.md](DIALOGOS.md).

Reglas:

- Los diálogos son **escritura nueva de ficción**, no testimonios ni recomendaciones de personas reales. No reutilizarlos en el portfolio clásico.
- No hacer depender un dato profesional de una variante aleatoria: las repeticiones sustituyen saludos, no eliminan información.
- No presentar opciones sin destino real. El contenido profesional se consume de la fuente compartida (`Content.jsx`).
- No atribuir certificaciones, experiencia de pentesting, auditorías o puestos que no se han aportado. Las notas académicas están pendientes de revisión antes de publicarse.

| Episodio | Qué permite descubrir |
| --- | --- |
| Caja registradora del Mihrab | Investigar un problema y configurar una solución útil |
| Asistencia en carretera | Experiencia de atención y coordinación |
| Pedagogía y movilidad | Formación, enseñanza y orientación laboral |
| DAW | Paso hacia el desarrollo web mientras trabajaba |
| Impresión 3D | Diseño y fabricación como afición creativa |
| Máster en ciberseguridad | Formación en curso y atención a la seguridad desde el desarrollo |

---

## 10. Tiempo, clima y cielo

### Decidido

- Ciclo de día y noche y lluvia aleatoria para dar vida al entorno.
- Telescopio en la azotea: de día, cielo con nubes y pájaros; de noche, estrellas, un planeta reconocible por sus anillos y alguna estrella fugaz.

### Propuesto

- Tiempo de juego independiente de la hora real; duración configurable, sin fijar aún minutos exactos.
- Transiciones suaves, accesos y objetivos siempre legibles.
- Lluvia ambiental moderada, con pausas y opción de desactivarla.
- Estado compartido entre exterior y vista del telescopio. Si llueve, nubes y respuesta coherente; sin estrellas visibles a través de ellas.
- El cielo es una escena artística, no una simulación astronómica ni la imagen exacta del telescopio real de Lupe. Nunca representar observación directa del Sol.
- Clima, hora y animaciones nunca impiden leer contenido profesional. Reducir efectos con movimiento reducido.
- Sin geolocalización ni servicios meteorológicos.

---

## 11. Modo clásico

### Decisión de diseño

El modo clásico debe dejar de parecer una página pixel art de tarjetas de videojuego y convertirse en una landing profesional visualmente independiente. Su estética definitiva está pendiente.

### Diseño propuesto

Composición moderna y limpia, tipografía legible, espaciado equilibrado, totalmente responsive, tarjetas de proyectos con capturas reales, paleta relacionada con la marca sin reproducir el pixel art, y guiños a Valle del Bucle con moderación. Su rediseño se hace con las skills de diseño cuando Lupe lo pida; hasta entonces no cambiar su aspecto.

### Estructura

- **Hero:** nombre completo, profesión, presentación breve y acciones visibles.
- **Sobre mí:** trayectoria, formación y especialización.
- **Proyectos destacados:** aplicaciones reales con capturas, tecnologías, descripción y enlaces.
- **Experiencia y stack:** información estructurada y fácil de consultar.
- **Blog:** últimos artículos.
- **Contacto:** formulario y enlaces profesionales.

### Requisitos

HTML semántico, SEO, accesibilidad, navegación por teclado, metadatos para compartir, buena velocidad, contenido accesible sin Phaser y buen uso en móvil. Es prioritario: debe funcionar como portfolio profesional incluso para quien no quiera jugar. El acceso directo a `/clasico` está disponible desde el juego (`ruta.clasico`).

---

## 12. Arquitectura

La arquitectura documentada no debe sustituirse.

```text
CMS privado /bitacora
        │
        ▼
Express ── PostgreSQL + CONTENT_PATH para medios
        │
        ▼
/api/projects y /api/posts
        │
        ▼
lib/ y hooks de React ── Content.jsx
                         ├─ modo clásico
                         └─ paneles del juego
```

- **Frontend:** React + Vite. **Juego:** Phaser 3, carga diferida desde `pages/Valle.jsx`; no extender su coste al modo clásico. **Backend:** Express. **Persistencia:** PostgreSQL. **CMS:** panel privado `/bitacora`.
- Rutas: `/` título, `/valle` juego, `/clasico` contenido convencional.
- El contenido profesional tiene una única fuente de datos; no duplicar proyectos, artículos o descripciones por modo.
- Los JSON públicos de posts y proyectos son semillas iniciales, no fuente operativa en runtime. Respetar `CONTENT_PATH`, sitemap, slugs y CORS.

**Estructura documentada:**

- `frontend/src/game/world.js`: datos del mundo (sin Phaser).
- `frontend/src/game/ValleScene.js`: escena del juego.
- `frontend/src/game/sprites.js`: generación de sprites por código. Migrar a hojas externas sería una decisión nueva.
- `frontend/src/components/valle/`: interfaz del juego; `Content.jsx` es el contenido compartido.
- `frontend/src/pages/Valle.jsx`: integración de Phaser.
- Comunicación actual mediante `registry` (`locked`, `joy`) y callbacks de proximidad. No sustituirla sin revisar el código.

Phaser se ocupa de movimiento, colisiones, proximidad, sprites y ambiente; React, de diálogos, fichas, fotos, formularios y navegación accesible. Evitar lógica de acceso a datos en sprites o escenas, y que cada edificio haga su propia petición a la API. Antes de modificar estas piezas, revisar su implementación real.

### Lore y diálogos en el CMS (propuesta, no existe)

La gestión de lore y diálogos en el CMS **no está acreditada como existente**. Empezar con un modelo editorial definido y decidir su persistencia tras revisar el proyecto. Si se añade al CMS, diseñar contratos, validación, borradores, revisión y proyección pública antes de ampliar la base de datos.

```text
Personaje: id, nombrePublico, rol, retrato
Lugar: id, nombre, interacciones
Diálogo: id, personajeId, lugarId, condiciones, páginas, opciones
Revisión: hechosVerificados, textoAprobado, identidadAprobada, mediosAprobados
```

Los estados editoriales privados permanecen en el backend o en documentación de trabajo excluida de publicación. No basta con esconder en React textos que ya llegaron al navegador: publicar únicamente la proyección aprobada. IDs estables, separados de los nombres y sin datos personales. Ningún borrador es publicable por defecto.

---

## 13. Privacidad, seudónimos y recursos

- Las personas del entorno de Lupe aparecen con **seudónimos** provisionales (guiños a Zelda, God of War y Stardew Valley, a petición de Lupe), consistentes entre lore y diálogos. Lupe y Khalessi conservan sus nombres. No existe ni debe crearse una tabla de correspondencias con nombres reales, ni IDs, nombres de archivo o comentarios que los reflejen.
- Lupe ha indicado que los detalles íntimos aportados como contexto creativo **no se incluyen**. Se mantienen trabajo, formación, hobbies y vínculos cotidianos.
- Los oficios y relaciones proceden del relato de Lupe, pero su presencia en un borrador no equivale al consentimiento de terceros para aparecer públicamente. Revisar instituciones, profesiones y cargos antes de publicar: la combinación oficio, institución y relación también puede identificar a alguien.
- **Decidido (2026-11-09):** los lugares donde Lupe ha trabajado o estudiado aparecen con su nombre real, como en su currículum (por ejemplo, «bar Mihrab»). No se nombran empresas ni cargos concretos de familiares o amistades. Los compañeros del bar son personajes ficticios; el jefe puede reflejar lo que Lupe cuenta (que se alegró de que arreglara la caja) para mostrar su iniciativa, sin presentarlo como cita real.
- Estos documentos son material de trabajo, **no una autorización de publicación**. El repositorio es privado por ahora; si pasa a público, mover lore y diálogos fuera o repasarlos antes. No incluir material privado en el frontend público, en el CMS exportado ni en los assets. Las conversaciones y los personajes se irán modelando sobre la marcha.
- Fotos reales de la habitación: condicionadas a selección y aprobación; revisar personas, pantallas y elementos identificativos.
- PC retro: evocar una interfaz de principios de los 2000 con sistema ficticio propio (propuesta «Pradera»), con nombre, paisaje, iconos y audio originales. No incorporar el sonido de inicio, el wallpaper ni los assets de Windows XP. Pixelar un recurso ajeno no acredita permiso de uso.
- Redes: Luprintech es el identificador aportado en YouTube, Instagram, TikTok y MakerWorld, pero faltan URLs verificadas. No fabricarlas. Si una plataforma no admite incrustación, ofrecer enlace externo explícito.
- Consolas y grúa: recreaciones originales o con licencia; sin logotipos ni diseños de referencia sin revisar su uso. Las figuras que Lupe imprime y pinta no deben mostrar personajes de terceros como propiedad original.
- Mantener un registro de autoría, procedencia y licencia de cada medio antes de publicarlo.

---

## 14. Reglas técnicas y de mantenimiento

Respetar `CLAUDE.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `frontend/docs/DESIGN.md` y `docs/ESTADO.md`.

**Diseño:** reutilizar los tokens; no restaurar el tema Neon Luminary; sin gradientes, halos ni sombras difuminadas en el pixel art; consistencia entre sprites, paneles y escenarios; no introducir estilos nuevos sin revisar el sistema de diseño.

**Código:** componentes pequeños y reutilizables; separación entre vista, lógica y acceso a datos; textos visibles por i18n (español e inglés; los guiones de `DIALOGOS.md` pasan a i18n, no a la escena Phaser); sin dependencias innecesarias; respetar rutas y contratos de API.

**Git:** ramas de funcionalidad, nunca commits directos a `main`, PR según el flujo documentado y autoría solo de Guadalupe.

**Validaciones:** antes de cerrar, ejecutar las comprobaciones de `CLAUDE.md` y `AGENTS.md`; no declarar verificaciones no ejecutadas. Actualizar `docs/ESTADO.md` al terminar cada bloque, y los documentos de arquitectura o diseño si cambian.

---

## 15. Hoja de ruta sugerida

| Fase | Entrega | Criterio de aceptación |
| --- | --- | --- |
| 0 · Revisión editorial | Contrastar visión, lore y diálogos con `DESIGN.md` y `ESTADO.md`; aprobar seudónimos y textos | Sin conflictos sin resolver ni contenido privado publicable |
| 1 · Identidad y bases visuales | Composición de la portada, paleta, escala y sprites, distribución del valle, criterios de edificios, terreno y vegetación | Identidad visual consistente |
| 1b · Inicio vivo y creador de personaje | Ver detalle abajo | Portada con vida y primera partida personal |
| 2 · Portfolio profesional | `/clasico` como landing, tarjetas de proyectos, contenidos reales, responsive, accesibilidad y SEO | Portfolio completo y presentable sin jugar y sin cargar Phaser |
| 3 · Primer edificio completo | Un edificio con interior, entrada y salida, conectado a contenido real (Taller del Código o casa; ver sección 16) | Primer recorrido completo desde el valle hasta un proyecto o una conversación |
| 4 · Expansión del pueblo | Resto de edificios funcionales (casa, biblioteca, taberna, correos) y señalización | Todas las secciones principales accesibles desde el mapa |
| 5 · Conversación y biografía | Panel de diálogo, bienvenida, objetos de la casa; Mihrab, Copos, piscina, escuelas, asistencia y DAW | Cada lugar muestra hechos aprobados y ofrece salida rápida |
| 6 · Entorno personal | Personajes con seudónimos y escenas cotidianas | Relaciones coherentes y revisión de identidad completada |
| 7 · Experiencia de aventura | NPC, mapa, viaje rápido, diario, animaciones de Khalessi, mascota del visitante (6.4) y misiones opcionales | Exploración agradable sin obstaculizar la navegación |
| 8 · Ambiente | Día/noche, lluvia, telescopio y audio opcional | Variantes coherentes, con control de movimiento y de sonido |
| 9 · Evolución editorial | Evaluar CMS de diálogos | Fuente única, borradores protegidos y ningún dato privado en la API pública |
| 10 · Pulido y publicación | Rendimiento, accesibilidad, móvil, pruebas de navegación y SEO | Experiencia estable para visitantes reales |

### Fase 1b — Pantalla de inicio viva y creador de personaje

Se hace después de cerrar la identidad visual de la fase 1.

1. Pantalla de inicio viva: Khalessi se mueve, estrellas fugaces, nubes, humo, pétalos, luciérnagas, pájaros y la viajera que parpadea. Respeta el movimiento reducido. *(en curso)*
2. «Continuar aventura» si hay partida guardada en `localStorage`.
3. Música 8 bits cute con licencia libre, desactivada por defecto y con control visible.
4. Creador de personaje al elegir «Nueva aventura»: nombre y personalización completa al estilo Stardew (sección 6). *(después de los tres puntos anteriores)*

### Selección sugerida de diálogos para la primera versión

Bienvenida, ayuda, entrada a casa, Atreus, Khalessi, impresora, telescopio básico, PC y acceso directo a proyectos y contacto. Después el recorrido laboral y académico, y por último las escenas complementarias. Construir primero un recorrido pequeño y completo.

---

## 16. Decisiones pendientes

Antes de implementar nuevas funcionalidades extensas, definir:

1. Distribución definitiva del mapa, y cómo se reparten las dos capas: ¿la Taberna del Debug, la Biblioteca y el Taller conviven con el Mihrab, la casa y las escuelas, o los lugares autobiográficos asumen esas funciones?
2. ~~Escala de tiles y sprites~~ — decidida: 16 × 16 y viajera de 16 × 28.
3. Estilo final de los edificios.
4. Diseño definitivo del modo clásico.
5. Comportamiento de los interiores.
6. Apariencia de NPC (incluida Lupe) y de las mascotas del visitante, y dimensiones de los retratos y sprites (leer antes `DESIGN.md`; las dimensiones esperan a la aprobación de la base visual del avatar). Detalle y propuestas abiertas de las mascotas en 6.4.
7. Qué mecánicas entran en la primera versión pública.
8. Primer edificio completo: Taller del Código (visión inicial) o casa (propuesta del 9 de noviembre).
9. Seudónimos definitivos y cuánto detalle de cada profesión se publica.
10. Fechas y denominaciones oficiales (centros, título del máster, estado de estudios), URLs sociales, CV, contacto, proyectos y fotografías a mostrar.
11. Duración del ciclo día/noche, frecuencia de lluvia y persistencia local.
12. Si el lore llegará al CMS y con qué contrato de publicación.
13. Revisar lore y diálogos antes de que el repositorio o el sitio pasen a público (sección 13).
14. Verificar el pendiente documentado de `/clasico` en el sitemap; no asumir que sigue abierto.

No tomar automáticamente las propuestas de este documento como requisitos cerrados.

---

## 17. Criterios para evaluar cada cambio

Antes de incorporar una funcionalidad, comprobar:

- ¿Ayuda a descubrir información profesional?
- ¿Encaja con el estilo visual del valle?
- ¿Mantiene la navegación sencilla?
- ¿Funciona correctamente en móvil y con teclado?
- ¿Tiene una alternativa accesible y se entiende sin sonido?
- ¿Reutiliza los sistemas existentes?
- ¿Aporta algo propio en lugar de copiar una referencia?
- ¿Respeta la privacidad de terceros y la distinción entre hechos y ficción?
- ¿Es mantenible sin complicar innecesariamente el proyecto?

Si una funcionalidad añade complejidad sin mejorar la experiencia, posponerla.

**Pruebas específicas del juego:** navegación por teclado y móvil; diálogo sin movimientos involuntarios; lectura sin sonido; enlaces alternativos a redes; coherencia del clima; acceso directo al clásico; misma información profesional en ambos modos; ausencia de nombres reales de terceros y de material no aprobado en los recursos públicos.

---

## 18. Instrucciones para Claude Code

Este archivo representa la visión de producto y las propuestas de diseño. No implica implementar todas las funcionalidades descritas.

Antes de realizar cambios:

1. Leer `CLAUDE.md` y la documentación técnica vigente.
2. Consultar `docs/ESTADO.md`.
3. Si la tarea toca un lugar, personaje, objeto o conversación, leer también `LORE_Y_MUNDO.md` y `DIALOGOS.md`.
4. Identificar qué funcionalidades ya existen y compararlas con esta visión.
5. Conservar la arquitectura actual.
6. Implementar en bloques pequeños y comprobables, sin rediseños globales no solicitados.
7. No publicar texto de lore o diálogos marcado como borrador ni datos identificativos de terceros.
8. Actualizar la documentación correspondiente.
