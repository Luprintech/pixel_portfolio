// Textos del juego retro de la consola (mensajes, el sabio y la interfaz), por idioma. Las claves son las que emite
// `game/retro/logic.js`. El juego es una pequeña aventura propia: nada de aquí es contenido profesional.

export const RETRO_COPY = {
  es: {
    ui: {
      title: 'Consola retro',
      close: 'Salir de la consola',
      hint: 'Flechas o WASD para moverte · E o Espacio para actuar · Esc para salir',
      touchHint: 'Mueve la cruz y pulsa A',
      action: 'A',
      restart: 'Volver a empezar',
      next: 'Seguir',
      dead: 'Has caído en la mazmorra.',
      won: '¡Has completado la aventura!',
      canvas: 'Pantalla del juego retro',
      pad: { up: 'Arriba', down: 'Abajo', left: 'Izquierda', right: 'Derecha' },
    },
    lines: {
      sageHello1: 'Viajera, el bosque se ha llenado de limos. Dicen que en la cueva hay una espada antigua.',
      sageHello2: 'Búscala, abre sus cofres y trae de vuelta el Cristal del Bucle. ¡Buena suerte!',
      sageSword: 'Ya llevas la espada. El jefe de la cueva guarda el Cristal del Bucle: vence y ábrelo.',
      sageWon: '¡Lo lograste! El valle vuelve a brillar.',
      gotSword: 'Has encontrado la espada. Pulsa A para blandirla.',
      gotKey: 'Has encontrado una llave pequeña.',
      gotCrystal: 'Has conseguido el Cristal del Bucle.',
      locked: 'La puerta está cerrada con llave.',
      needSword: 'Aún no tienes con qué defenderte.',
      doorOpened: 'La llave gira y la puerta se abre.',
    },
  },
  en: {
    ui: {
      title: 'Retro console',
      close: 'Leave the console',
      hint: 'Arrows or WASD to move · E or Space to act · Esc to leave',
      touchHint: 'Move the pad and press A',
      action: 'A',
      restart: 'Start again',
      next: 'Continue',
      dead: 'You have fallen in the dungeon.',
      won: 'You completed the adventure!',
      canvas: 'Retro game screen',
      pad: { up: 'Up', down: 'Down', left: 'Left', right: 'Right' },
    },
    lines: {
      sageHello1: 'Traveller, the forest is full of slimes. They say an ancient sword lies in the cave.',
      sageHello2: 'Find it, open its chests and bring back the Loop Crystal. Good luck!',
      sageSword: 'You carry the sword now. The cave boss guards the Loop Crystal: defeat it and open the chest.',
      sageWon: 'You did it! The valley shines again.',
      gotSword: 'You found the sword. Press A to swing it.',
      gotKey: 'You found a small key.',
      gotCrystal: 'You got the Loop Crystal.',
      locked: 'The door is locked.',
      needSword: 'You have nothing to defend yourself with yet.',
      doorOpened: 'The key turns and the door opens.',
    },
  },
}

export const retroText = (lang, key) => (RETRO_COPY[lang] ?? RETRO_COPY.es).lines[key] ?? RETRO_COPY.es.lines[key] ?? ''
export const retroUi = (lang) => (RETRO_COPY[lang] ?? RETRO_COPY.es).ui

// Claves de texto de cada idioma, para comprobar que no falta ninguna.
export const retroCopyKeys = () => ({ es: Object.keys(RETRO_COPY.es.lines), en: Object.keys(RETRO_COPY.en.lines) })
