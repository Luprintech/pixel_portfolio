// Guiones de la visita guiada por dentro de la casa (C2), parada a parada, tal como están en `docs/DIALOGOS.md` (sección 4b). Aquí solo
// está la estructura; los textos van por idioma en `lib/tourCopy.js` con la clave de cada página.
//
// Todas las paradas acaban en tres salidas, y es la opción elegida la que decide qué pasa con la visita (`npc/homeTour.js`):
//  tour-next / tour-finish  sigue la visita (la parada cuenta como hecha)
//  tour-linger              la viajera quiere mirar con calma: Lupe espera (la parada cuenta como hecha)
//  tour-leave               la viajera sigue por su cuenta: la visita queda pendiente (la parada cuenta como hecha)
// Cerrar con Esc no es ninguna de ellas: la parada no cuenta y Lupe sigue esperando donde estaba.
import { lines, option } from './builders.js'

const page = (who, id, n) => ({ who, text: `${id}.${n}` })

// Salidas comunes de cada parada, tras sus preguntas opcionales.
const exits = [
  option('seguir', 'tour.opt.seguir', { action: 'tour-next' }),
  option('calma', 'tour.opt.calma', { action: 'tour-linger' }),
  option('cuenta', 'tour.opt.cuenta', { action: 'tour-leave' }),
]

const PRINTERS_MENU = [
  option('imprimir', 'tour.opt.imprimir', { to: 'tour.impresoras_imprimir' }),
  option('vitrina', 'tour.opt.vitrina', { to: 'tour.impresoras_vitrina' }),
  ...exits,
]

const ATREUS_MENU = [option('consolas', 'tour.opt.consolas', { to: 'tour.atreus_consolas' }), ...exits]

// Mientras el ordenador se explica, también se puede abrir: eso deja a Lupe esperando (la parada cuenta como hecha).
const PC_MENU = [
  option('escritorio', 'tour.opt.escritorio', { to: 'tour.pc_escritorio' }),
  option('abrir', 'tour.opt.abrirpc', { action: 'tour-pc' }),
  ...exits,
]

export const TOUR_SCRIPTS = {
  'tour.entrada': { pages: lines('lupe', 'tour.entrada', 4), options: exits },

  'tour.impresoras': { pages: lines('lupe', 'tour.impresoras', 4), options: PRINTERS_MENU },
  'tour.impresoras_imprimir': { pages: lines('lupe', 'tour.impresoras_imprimir', 3), options: PRINTERS_MENU },
  'tour.impresoras_vitrina': { pages: lines('lupe', 'tour.impresoras_vitrina', 2), options: PRINTERS_MENU },

  'tour.atreus': {
    pages: [page('lupe', 'tour.atreus', 1), page('atreus', 'tour.atreus', 2)],
    options: ATREUS_MENU,
  },
  'tour.atreus_consolas': { pages: lines('lupe', 'tour.atreus_consolas', 2), options: ATREUS_MENU },

  'tour.pc': { pages: lines('lupe', 'tour.pc', 3), options: PC_MENU },
  'tour.pc_escritorio': { pages: lines('lupe', 'tour.pc_escritorio', 4), options: PC_MENU },

  'tour.khalessi': {
    pages: [page('lupe', 'tour.khalessi', 1), { ...page('khalessi', 'tour.khalessi', 2), sfx: 'meow' }, page('lupe', 'tour.khalessi', 3)],
    options: exits,
  },

  'tour.cierre': { pages: lines('lupe', 'tour.cierre', 5), options: [option('gracias', 'tour.opt.gracias', { action: 'tour-finish' })] },

  // Hablar con Lupe a mitad de visita (andando, parada por la viajera) y después de terminarla.
  'tour.pausa': {
    pages: lines('lupe', 'tour.pausa', 1),
    options: [
      option('seguir', 'tour.opt.seguir', { action: 'tour-resume' }),
      option('calma', 'tour.opt.calma', { action: 'tour-linger' }),
      option('dejar', 'tour.opt.dejar', { action: 'tour-leave' }),
    ],
  },
  // Hablar con Lupe en su casa cuando aún no se ha empezado la visita (entró sola o la rechazó): se la puede pedir.
  'tour.ofrecer': {
    pages: lines('lupe', 'tour.ofrecer', 1),
    options: [option('seguir', 'tour.opt.seguir', { action: 'tour-resume' }), option('cuenta', 'tour.opt.cuenta', { action: 'tour-leave' })],
  },
  'tour.despues': { pages: lines('lupe', 'tour.despues', 2) },
}
