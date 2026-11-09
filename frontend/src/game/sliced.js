// Trabajo pesado en porciones. Las operaciones que recorren un lienzo entero (pintar el suelo, repintar por
// tono, suavizar) se escriben como generadores que ceden el control cada pocos milisegundos (`yield`): así
// se pueden repartir entre fotogramas, sin congelar la pantalla en un móvil, o terminar de golpe con `drain`
// cuando el resultado hace falta ya. Sin dependencias de Phaser ni de React.

// Ejecuta un generador hasta el final y devuelve su resultado.
export function drain(generator) {
  let step
  do {
    step = generator.next()
  } while (!step.done)
  return step.value
}

// Un trabajo que se puede avanzar poco a poco (`step`), esperar con `yield*` desde otro generador (`steps`) o
// terminar al momento (`get`). Se calcula una sola vez, lo avance quien lo avance.
export class Job {
  constructor(make) {
    this.make = make
    this.generator = null
    this.done = false
    this.value = undefined
  }

  // Avanza una porción; devuelve true cuando ya ha terminado.
  step() {
    if (this.done) return true
    this.generator ??= this.make()
    const result = this.generator.next()
    if (result.done) {
      this.done = true
      this.value = result.value
    }
    return this.done
  }

  *steps() {
    while (!this.step()) yield
    return this.value
  }

  get() {
    while (!this.step());
    return this.value
  }
}

// Avanza una lista de trabajos durante `budgetMs` por turno y deja libre el resto del fotograma: la pantalla
// sigue fluida mientras tanto. Devuelve una promesa que se cumple al terminar todos.
export function runSliced(jobs, { budgetMs = 6, gapMs = 14 } = {}) {
  return new Promise((resolve) => {
    let next = 0
    const turn = () => {
      const start = performance.now()
      while (next < jobs.length && performance.now() - start < budgetMs) {
        if (jobs[next].step()) next += 1
      }
      if (next >= jobs.length) resolve()
      else setTimeout(turn, gapMs)
    }
    setTimeout(turn, gapMs)
  })
}
