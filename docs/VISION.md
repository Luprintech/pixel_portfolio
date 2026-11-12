# Valle del Bucle — Visión de producto y dirección de diseño

**Proyecto:** Portfolio interactivo de Guadalupe Cano (Luprintech)  
**Estado:** Diseño y desarrollo en curso  
**Última sincronización:** 11 de noviembre de 2026 (biografía, mapa previsto, NPC, bienvenida, Ylonem y estado real de implementación)
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

Portada pixel art viva (hecha y aprobada el 2026-11-09): paisaje con ciclo de día y noche, tiempo (despejado, nublado, lluvia, tormenta y nieve), tres biomas (primavera, otoño e invierno), Lupe que habla en bocadillos y Khalessi, su gata, que juega, se asea, se asusta con los truenos y, en invierno, tirita pegada a Lupe. Permite empezar una aventura nueva (con el creador de personaje), continuar la guardada, abrir las opciones y utilizar el modo clásico. La música suena en la portada y el creador (`Welcome Valle del Bucle`) y, dentro del valle, `Valle Exploration`.

### Propuesta de mejora

Transformar la portada en una pantalla de título de videojuego con paisaje animado.

**Composición:**

- Nombre "Valle del Bucle" como elemento principal.
- Referencia a Luprintech: "Luprintech presenta · Valle del Bucle · El portfolio de Guadalupe Cano".
- Paisaje pixel art con profundidad visual, la viajera y Khalessi visibles.
- Menú reconocible, sin ocupar excesivamente el escenario.

**Opciones de navegación propuestas:** Nueva aventura · Continuar explorando (si hay progreso guardado) · Personalizar personaje · Explorar portfolio clásico · Opciones. No es necesario que todas aparezcan desde la primera versión. Variante de rotulado propuesta: "Entrar al valle", "Ver portfolio clásico", "Personalizar viajera".

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
| Biblioteca de los Logs | **Retirada decidida, aún presente en el código y mapa actuales.** No ampliar; conservar el registro técnico hasta la fase específica que retire o redirija blog, rutas, CMS y contenido |
| Taberna del Debug | Tecnologías, herramientas y experiencia. Puede incluir NPC con diálogos breves. No sustituye la información estructurada y accesible |
| Oficina de Correos | Contacto: reutiliza el sistema de envío y validación existente |

El buzón sigue siendo una propuesta funcional. La biblioteca/blog se retirará, pero no se borra desde esta sincronización documental: sus rutas, CMS, contenido y edificio todavía existen y requieren una fase técnica propia. **No sustituir ni renombrar automáticamente los lugares autobiográficos ya decididos**.

**Capa autobiográfica (detalle en `LORE_Y_MUNDO.md`, sección 7):**

```text
NORTE   Dionisio Ortiz ── Universidad de Burgos ── IES Gran Capitán
                                │                         │
OESTE   Piscina Santuario ── Plaza/entrada   ESTE
          │                       │                  │
        Mihrab ── Copos       Parada de bus     Ayuntamiento*
          │                       │                  │
SUR     Casa de Lupe ── RACE / asistencia ── Punto de encuentro
          └─ azotea                               de amigos

* Decidido para una fase posterior; todavía no existe en el mapa implementado.
```

El dibujo expresa conexiones, no coordenadas ni tamaño. El mapa actual todavía conserva Cervantes y la biblioteca/blog y aún no incorpora el Ayuntamiento. Esta visión define el destino editorial; no autoriza a modificar el mapa fuera de su fase.

| Lugar | Qué representa | Qué permite descubrir |
| --- | --- | --- |
| Casa y cuarto gaming | Aficiones y hogar compartido | Impresora (3D), PC retro (redes), consolas, TV, Khalessi, azotea con telescopio |
| Mihrab | Empleo en el bar | Caja registradora: investigar un problema y configurar una solución |
| Copos | Un verano aproximadamente a los 18, antes del Bachillerato | Etapa anterior al desarrollo web |
| Piscina Santuario | Quiosco de helados con Hylia y regreso posterior al bar de la piscina | Dos recuerdos laborales diferentes en el mismo recinto |
| Dionisio Ortiz | Bachillerato de Artes | Centro que se mantiene; Cervantes se retira del recorrido previsto |
| Universidad de Burgos | Pedagogía, Erasmus en Messina, SICUE en Granada, prácticas, TFG y VocaAcción | Messina y Granada como recuerdos o espacios dependientes del nodo universitario |
| IES Gran Capitán | DAW, comienzo a distancia en Trassierra, proyecto Vocacción y amistad con Ylonem | NPC opcional de compañero de DAW; el caso de Ahi Está la Película se descubre mediante una ficha o panel profesional, separado de Vocacción |
| Ayuntamiento de Córdoba | Prácticas de DAW | Incorporación futura decidida; marca y recursos pendientes de revisión |
| RACE / asistencia | Etapa 2015–2024 compartida con Marnie | Funciones confirmadas de atención, SOS, geolocalización, formación, análisis y coordinación; la grúa es un símbolo |
| Laboratorio | Formación posterior en ciberseguridad | Denominación y estado a verificar; no atribuir experiencia profesional de seguridad |
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

### 6.1 Estado actual (comprobado en el código y en `ESTADO.md` el 2026-11-11)

- **Viajera:** creador por capas, nombre, vista previa animada, personalización y mascota opcional. El generador común de `game/avatar/` alimenta creador, NPC y juego. La partida local está versionada; la versión 5 guarda aspecto, mascota, mundo e historia y migra versiones anteriores.
- **Mascota del visitante:** perro, gato o ninguna, con razas y colores cosméticos, nombre separado y seguimiento durante la exploración. No comparte identidad ni comportamiento narrativo con Khalessi y espera fuera de los interiores actuales.
- **Lupe:** existe en portada, valle y retrato de diálogo. En una partida nueva espera en la entrada; tiene estados `idle`, `talking`, `guiding`, `waiting` y `routine`, pasea por rutas válidas y solo acompaña al aceptarse una visita. No persigue permanentemente a la viajera. La bienvenida y la visita exterior hasta la casa están implementadas; sus textos nuevos siguen siendo borradores editoriales.
- **Khalessi:** aparece en portada, casa y exterior. En el exterior acompaña a Lupe, no a la viajera; en la casa conserva su comportamiento doméstico independiente.
- **Atreus:** existe como NPC de la casa con sprite, retrato, conversación e interacción propias.
- **Grace:** implementada el 2026-11-11 como NPC opcional de Gran Capitán (sprite propio con melena de tirabuzones, retrato y conversación sobre cómo animó a Lupe durante DAW y la llevó a estudiar Ciberseguridad). Aspecto y texto son borrador pendiente de aprobación.
- **Ylonem:** implementado el 2026-11-11 como NPC opcional de Gran Capitán (sprite calvo, de negro, con barba corta y cámara de fotos; conversaciones y enlace a su estudio). Es el seudónimo autorizado de un antiguo compañero de DAW y buen amigo actual de Lupe. Es fotógrafo y videógrafo profesional de bodas. Su presencia prevista es opcional en Gran Capitán y conecta con el caso profesional de la aplicación creada por Lupe para Ahi Está la Película (`ahiestalapelicula.com`).
- **Dexter, Naviky y Tina:** nombres editoriales actuales para la casa de juegos de mesa; sustituyen a los nombres provisionales Link, Zelda, Ana, Paco, Pepe y Vicky. Dexter y Naviky son pareja; Tina es su perrita negra, mezcla de salchicha y schnauzer. Los tres siguen pendientes de sprites y comportamiento.
- **Memoria narrativa:** el estado de bienvenida, visita, conversaciones escuchadas y preguntas explicadas vive en la partida. Una exclamación indica contenido nuevo; las conversaciones completadas no se repiten íntegramente.

### 6.2 Decisiones de producto aprobadas (2026-11-09)

- **La viajera o el viajero** es el personaje personalizable de quien visita el portfolio, independiente de Lupe: un avatar sin historia personal asignada. Ambas aparecen en pantalla, pero son personajes distintos.
- **Lupe** es la anfitriona y guía del pueblo. Recibe al personaje visitante y ofrece orientación **sin imponer un recorrido**.
- **Orden de visita propuesto (2026-11-12, pendiente de aprobar; sigue sin imponerse):** Lupe lo ofrece y la viajera puede ir por su cuenta en cada parada. Plaza y bienvenida, casa de Lupe (quién es), Taller del Código (qué hace: proyectos), IES Gran Capitán (de dónde viene y con quién: formación, Ylonem y Grace), Oficina de Correos (cómo contactar) y cierre con `/clasico` y despedida. Corresponde a las rutas `ruta.trabajos`, `ruta.formacion`, `ruta.contacto`, `ruta.clasico` y `ruta.despedida` de `DIALOGOS.md`, que se activarán con la fase I (señales y diario). Hoy el IES ya tiene su propia llegada de Lupe (`gran.llegada`).
- **Khalessi** es la gata de Lupe y su pareja. Acompaña a Lupe en la bienvenida y puede aparecer junto a ella en el mundo. Dice "meaw!"; puede acompañarse de un maullido original de timbre 8 bit, solo con sonido activado. Sus animaciones y apariciones son propuestas, sin traducir sus maullidos a testimonios humanos.
- **Khalessi no es la mascota personalizable del visitante.** Las mascotas del visitante no sustituyen a Khalessi ni adquieren su nombre, historia o diálogos.
- Sin cuentas de usuario para guardar preferencias.

### 6.3 Mejoras de animación (propuestas)

- Completar animaciones de frente, espalda y laterales; caminar e inactividad; transiciones entre direcciones.
- Mantener las opciones de personalización y conservarlas al navegar por el mundo.

### 6.4 Mascota del visitante (implementada; ampliaciones opcionales)

La elección entre perro, gato o ninguna mascota, el nombre independiente, las variaciones cosméticas, la previsualización, el seguimiento exterior y la persistencia local ya están implementados. Las razas tienen dimensiones propias y los gatos del visitante evitan el aspecto siamés de Khalessi. La lista siguiente conserva el diseño original para poder comparar decisiones; `ESTADO.md` es la fuente de verdad sobre su implementación.

**Diseño original, ya implementado en su parte principal**

- Elección opcional: sin mascota, perro o gato.
- Nombre personalizable, independiente del nombre del avatar.
- Apariencias por estilos de pelaje originales y reconocibles (colores, manchas y patrones). Las variaciones son **solo cosméticas**: ninguna apariencia da personalidad ni habilidades distintas.
- Estilo cute pixel art, escala coherente con el avatar y siluetas claramente distintas entre perro y gato.
- Previsualización junto al avatar antes de entrar.
- Acompañamiento opcional durante la exploración, con animaciones de reposo y marcha.
- Poder cambiar nombre, apariencia o desactivar el acompañamiento después.

**Ampliaciones y decisiones que deben contrastarse con lo ya implementado**

- *Nombre:* de 1 a 16 caracteres, con los mismos caracteres admitidos que el nombre de la viajera (`sanitizeName`: letras, números, espacio, guion y apóstrofo). Valor predeterminado si queda vacío: "Perro" o "Gato" según la especie, traducido por i18n. No puede ser "Khalessi" (comparación sin mayúsculas ni acentos), para no confundirla con la gata de Lupe.
- *Selección inicial de apariencias* (pequeña, y cada una con nombre accesible además de verse):
  - Perro: canela, negro con pecho claro, blanco con manchas marrones, gris moteado.
  - Gato: naranja atigrado, negro, blanco y negro (bicolor), gris atigrado.
  - Se evita la combinación siamesa crema con máscara marrón en los gatos del visitante, para que Khalessi siga siendo reconocible.
- *Seguimiento:* distancia de seguimiento corta, con retraso suave; si queda más lejos de un umbral (por ejemplo, ocho teselas) o fuera de pantalla, reaparece junto a la viajera. La Khalessi actual sirve de referencia técnica, sin reutilizar su sprite.
- *Interiores:* actualmente la mascota espera fuera. Que entre y se coloque junto a la puerta es una ampliación futura, no una función existente.
- *Diálogos:* durante una conversación se queda quieta y en reposo; no habla ni interviene.
- *Viaje rápido:* aparece junto a la viajera en el destino, sin recorrer el trayecto.
- *Sin bloqueos:* no tiene colisión con la viajera ni con puertas, objetos interactivos o NPC; puede atravesar lo que la viajera ocupa, y nunca impide una interacción.
- *Accesibilidad:* la elección y el nombre se manejan con teclado y en móvil; el acompañamiento se puede desactivar. Por decidir: si con `prefers-reduced-motion` activado la mascota se queda quieta junto a la viajera o no acompaña.
- *Persistencia:* ya vive en la partida local, sin cuenta. El guardado está en la versión 5 y también incluye mundo e historia. **No toca el CMS, la API ni la base de datos.**
- *Dimensiones de los sprites:* ya están definidas por raza; cualquier ampliación debe conservar esas proporciones.

### 6.5 Otras mejoras del editor

- Guardar y recuperar la personalización: **implementado**.
- Vista previa en cuatro direcciones, en reposo y caminando: **implementado**.
- Aleatorizar categorías individuales y bloquear las que se quieran conservar: ampliación opcional; hoy «Al azar» cambia el avatar seleccionado.
- Restablecer una categoría sin borrar toda la apariencia: ampliación opcional.
- Accesibilidad por teclado y emulación táctil: implementada y probada mediante scripts/emulación; pendiente una prueba con lector de pantalla y dispositivo táctil reales.

### 6.6 Orden de trabajo

1. ~~Aprobar y consolidar la base visual del avatar (cuerpo, cabeza, escala, contorno).~~ Hecho el 2026-11-09.
2. ~~Adaptar las opciones actuales (pelo, ropa, complementos) a esa base.~~ Hecho el 2026-11-09.
3. ~~Mejorar guardado y previsualización.~~ Hecho; aleatorización por categorías queda como ampliación opcional.
4. ~~Diseñar e implementar las mascotas del visitante.~~ Hecho; ver ampliaciones opcionales en 6.4.

No se fijan dimensiones nuevas de sprites hasta cerrar el paso 1.

### 6.7 Creación de personaje (primera versión hecha el 2026-11-09; ver `docs/ESTADO.md` para lo que falta)

Decisión de Lupe (2026-11-09): al elegir «Nueva aventura» el juego abre un creador de personaje al estilo de Stardew Valley, con el nombre de la viajera. Los apartados siguientes conservan la propuesta original; lo implementado y lo pendiente está en `docs/ESTADO.md`. Khalessi ya no aparece como mascota del creador: la vista previa usa la mascota independiente del visitante.

**Estado:** pantalla de inicio, «Continuar aventura», creador y mascota están implementados. Las opciones de abajo sirven como especificación histórica y lista de posibles ampliaciones, no como trabajo íntegramente pendiente.

**Flujo propuesto:**

1. Nombre de la viajera (campo de texto con límite de longitud y validación; sin datos personales).
2. Creador con vista previa en vivo, que reutiliza el sprite del juego y la mascota del visitante.
3. Confirmar y entrar al valle. Si ya hay partida guardada, avisar de que "Nueva aventura" la sustituye.

**Opciones a ofrecer:**

- Cuerpo: dos o tres constituciones o siluetas, sin etiquetar por género.
- Cara: varias formas y expresiones.
- Pelo: estilos largos, cortos, recogidos y rizados, cada uno con su color.
- Vello facial: con barba, sin barba, bigote y patillas, para quien lo quiera.
- Complementos: gafas, aros, pendientes, gorros, lazos, flores en el pelo.
- Ropa: vestido, camiseta, chaqueta, mono, con varios colores y un ribete.
- Colores: paletas por categoría, con una gama amplia de tonos de piel.
- Botones "Aleatoria" y "Restablecer".

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

**Estado y prioridad:** la casa de Lupe es el primer edificio completo y reutilizable; incluye interior recorrible, cuarto gaming, impresoras, telescopio, PC, Atreus, Khalessi y diálogos. El IES Gran Capitán (nodo de DAW, antes el laboratorio `daw`) es el segundo interior propio (Fase D, 2026-11-11); el resto sigue pendiente. La visita guiada exterior hasta la casa y la presentación guiada de impresoras, Atreus, el ordenador y Khalessi dentro de ella (C2) están implementadas.

La casa es una habitación compacta y recorrible: dos escritorios (el de Atreus con dos pantallas, cascos y torre blanca), cama doble, TV, estantería de consolas, rincón de impresión 3D y acceso a la azotea.

---

## 8. Controles y mecánicas de aventura

### Controles (decidido)

| Acción | Control |
| --- | --- |
| Moverse | WASD o flechas |
| Entrar, hablar, examinar | E al estar cerca del objetivo |
| Leer un diálogo | Panel inferior con retrato del hablante a la derecha |

### Contrato de interacción (implementado en la base; ampliable)

- Mostrar un único objetivo contextual: "E · Hablar", "E · Entrar" o "E · Examinar". Resolver por distancia y orientación; no activar dos conversaciones a la vez.
- E revela de golpe el texto en curso; la siguiente pulsación avanza. Enter como alternativa accesible. Esc cierra o vuelve atrás.
- Evitar que la misma pulsación abra y salte la primera página; al cerrar, exigir una nueva pulsación antes de reactivar.
- Detener el movimiento mientras haya diálogo o panel. No capturar los controles cuando un formulario tenga el foco.
- Móvil: joystick y botón de acción con etiqueta, con las mismas reglas. Incluir una alternativa accesible fuera del canvas.
- Texto de aparición progresiva con opción de mostrarlo al instante. Sin sonido obligatorio por letra.
- Nombre del hablante siempre en texto; el retrato no es la única identificación.
- Restaurar el foco al cerrar paneles. Menú accesible con controles, volumen y modo clásico.
- La bienvenida se reproduce una vez por partida o hasta completarla; después se puede repetir voluntariamente.

### Mecánicas (estado mixto, progresivas)

- **NPC:** Lupe, Khalessi exterior y Atreus están implementados. Los futuros NPC tendrán explicaciones breves, memoria, exclamación solo ante contenido nuevo y diálogos opcionales y omitibles. No convertir a cada personaje en una recomendación profesional artificial.
- **Diario de aventuras:** mapa del pueblo, proyectos descubiertos, lugares visitados y accesos directos.
- **Viaje rápido:** desplazarse directamente a edificios o zonas, sin obligar a recorrer el mapa repetidamente.
- **Misiones opcionales:** concepto pendiente. Si se incorporan, no incluirán «visitar la biblioteca» porque el blog se retirará y nunca bloquearán una sección.
- **Guardado:** preferencias, aspecto, mascota, mundo y memoria narrativa en `localStorage`, versión 5. Sin autenticación ni tablas nuevas.
- **Cofres y secretos:** opcionales; nunca esconden información profesional importante.

---

## 9. Diálogos y contenido profesional

La bienvenida interactiva presenta a Lupe y a Khalessi y después permite explorar o aceptar una visita exterior opcional a la casa. Las preguntas ya contestadas no se repiten y la visita puede abandonarse. La estructura está implementada y verificada; los textos nuevos siguen marcados como borradores pendientes de aprobación en [DIALOGOS.md](DIALOGOS.md).

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
| Formación posterior en ciberseguridad | Atención a la seguridad desde el desarrollo; denominación y estado exactos pendientes de verificar |

---

## 10. Tiempo, clima y cielo

### Decidido

- Ciclo de día y noche y lluvia aleatoria para dar vida al entorno.
- Telescopio en la azotea: de día, cielo con nubes y pájaros; de noche, estrellas, un planeta reconocible por sus anillos y alguna estrella fugaz.

### Propuesto

- Tiempo de juego independiente de la hora real; duración configurable, sin fijar aún minutos exactos.
- Transiciones suaves, accesos y objetivos siempre legibles.
- Lluvia ambiental moderada, con pausas y opción de desactivarla.
- Hecho en la portada (2026-11-09): el tiempo incluye nieve y un bioma de invierno propio (nieve en cumbres, tejados y copas, montones de nieve, charcos helados y un muñeco), con copos, campanitas de escarcha y el guion de invierno de Lupe. Khalessi es friolera: con nieve se pega a Lupe y tirita. Pendiente para el valle: llevar los biomas y el tiempo al juego.
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
- **Blog:** retirada decidida. Mientras sigan existiendo sus rutas, contenido y CMS, se trata como legado técnico pendiente de retirada, no como una zona futura que ampliar.
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
- **Decidido (2026-11-09):** los lugares donde Lupe ha trabajado o estudiado aparecen con su nombre real, como en su currículum (por ejemplo, "bar Mihrab"). No se nombran empresas ni cargos concretos de familiares o amistades. Los compañeros del bar son personajes ficticios; el jefe puede reflejar lo que Lupe cuenta (que se alegró de que arreglara la caja) para mostrar su iniciativa, sin presentarlo como cita real.
- Estos documentos son material de trabajo, **no una autorización de publicación**. El repositorio es privado por ahora; si pasa a público, mover lore y diálogos fuera o repasarlos antes. No incluir material privado en el frontend público, en el CMS exportado ni en los assets. Las conversaciones y los personajes se irán modelando sobre la marcha.
- Fotos reales de la habitación: condicionadas a selección y aprobación; revisar personas, pantallas y elementos identificativos.
- PC retro: evocar una interfaz de principios de los 2000 con sistema ficticio propio (propuesta "Pradera"), con nombre, paisaje, iconos y audio originales. No incorporar el sonido de inicio, el wallpaper ni los assets de Windows XP. Pixelar un recurso ajeno no acredita permiso de uso.
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
| 3 · Primer edificio completo | Casa de Lupe con interior, entrada, salida, objetos, NPC y contenido real | **Implementada**; quedan revisiones y ampliaciones registradas en `ESTADO.md` |
| 4 · Expansión del pueblo | Resto de edificios funcionales y autobiográficos, correos y señalización; sin ampliar la biblioteca/blog | Todas las secciones principales accesibles desde el mapa |
| 5 · Conversación y biografía | **C1 exterior implementada:** panel, bienvenida, Lupe y acompañamiento hasta la casa. **C2 implementada:** visita interior. Después: Mihrab, Copos, piscina, formación, RACE y DAW | Cada lugar muestra hechos aprobados, recuerda lo completado y ofrece salida rápida |
| 6 · Entorno personal | Personajes con seudónimos y escenas cotidianas; Ylonem como compañero de DAW y colaborador profesional | Relaciones coherentes, autorización de Ylonem registrada y revisión de identidad completada |
| 7 · Experiencia de aventura | Base de NPC, Khalessi y mascota implementada; mapa futuro, viaje rápido, diario y posibles misiones opcionales pendientes | Exploración agradable sin obstaculizar la navegación |
| 8 · Ambiente | Día/noche, lluvia, telescopio y audio opcional | Variantes coherentes, con control de movimiento y de sonido |
| 9 · Evolución editorial | Evaluar CMS de diálogos | Fuente única, borradores protegidos y ningún dato privado en la API pública |
| 10 · Pulido y publicación | Rendimiento, accesibilidad, móvil, pruebas de navegación y SEO | Experiencia estable para visitantes reales |

### Fase 1b — Pantalla de inicio viva y creador de personaje

Se hace después de cerrar la identidad visual de la fase 1.

1. Pantalla de inicio viva: Khalessi se mueve, estrellas fugaces, nubes, humo, pétalos, luciérnagas, pájaros, Lupe que habla y parpadea, tiempo y tres biomas (primavera, otoño e invierno). Respeta el movimiento reducido. *(hecho y aprobado el 2026-11-09)*
2. "Continuar aventura" si hay partida guardada en `localStorage`. *(hecho)*
3. Música 8 bits cute con licencia libre y control visible: portada, creador y valle, con dos pistas. *(hecho; el sonido real en Android e iPhone está probado)*
4. Creador de personaje al elegir "Nueva aventura": nombre y personalización completa al estilo Stardew (sección 6). *(hecho; ver `docs/ESTADO.md` para sus ampliaciones opcionales)*

### Selección sugerida de diálogos para la primera versión

Bienvenida, ayuda, entrada a casa, Atreus, Khalessi, impresora, telescopio básico, PC y acceso directo a proyectos y contacto. Después el recorrido laboral y académico, y por último las escenas complementarias. Construir primero un recorrido pequeño y completo.

---

## 16. Decisiones pendientes

Antes de implementar nuevas funcionalidades extensas, definir:

1. Distribución definitiva del mapa con Cervantes y biblioteca/blog retirados, Gran Capitán como nodo de DAW, Ayuntamiento incorporado y recuerdos de Messina, Granada y Trassierra sin edificios innecesarios.
2. ~~Escala de tiles y sprites~~ — decidida: 16 × 16 y viajera de 16 × 28.
3. Estilo final de los edificios.
4. Diseño definitivo del modo clásico.
5. Comportamiento de los interiores restantes (la visita guiada interior de la casa, C2, ya está implementada y puede servir de modelo).
6. Apariencia, privacidad, nombres públicos y rutinas de los futuros NPC. Lupe, Khalessi, Atreus y las mascotas del visitante ya tienen una base implementada; Ylonem y Grace ya tienen sprite, retrato y conversaciones en Gran Capitán; su rutina de movimiento sigue pendiente (hoy están quietos y se vuelven hacia quien se acerca).
7. Qué mecánicas entran en la primera versión pública.
8. ~~Primer edificio completo.~~ Decidido e implementado: casa de Lupe.
9. Seudónimos definitivos y cuánto detalle de cada profesión se publica.
10. Denominaciones oficiales (mención de Pedagogía y formación de ciberseguridad), ubicación del centro de empleo, alcance de VocaAcción, estado técnico de Vocacción, identidad del Ayuntamiento, URLs sociales, CV, contacto, proyectos y fotografías.
11. Duración del ciclo día/noche y frecuencia de lluvia. La persistencia local básica ya está implementada.
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
