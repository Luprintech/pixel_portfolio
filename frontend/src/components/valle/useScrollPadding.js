import { useEffect, useRef } from 'react'

// Lo que se queda fijo sobre el contenido tapa lo que recibe el foco al tabular: en móvil las
// escenas por arriba y la barra de acciones por abajo, y en pantalla ancha las pestañas. Hay que
// decirle al navegador cuánto mide cada franja para que, al llevar el foco a un control, lo deje a la
// vista y no debajo de ellas (WCAG 2.4.11). Devuelve las referencias que hay que poner en cada franja.
const AIR = 16

const stuck = (element, ...positions) => (element && positions.includes(getComputedStyle(element).position) ? element.getBoundingClientRect().height : 0)

export function useScrollPadding() {
  const stageRef = useRef(null)
  const tabsRef = useRef(null)
  const barRef = useRef(null)
  const columnRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const column = columnRef.current
    const apply = () => {
      root.style.scrollPaddingTop = `${Math.max(stuck(stageRef.current, 'sticky'), stuck(tabsRef.current, 'sticky')) + AIR}px`
      root.style.scrollPaddingBottom = `${stuck(barRef.current, 'fixed') + AIR}px`
      // En pantalla ancha la columna izquierda se desplaza por su cuenta y la barra queda fija abajo.
      if (column) column.style.scrollPaddingBottom = `${stuck(barRef.current, 'sticky') + AIR}px`
    }
    apply()
    const observer = new ResizeObserver(apply)
    ;[stageRef, tabsRef, barRef].forEach((ref) => ref.current && observer.observe(ref.current))
    window.addEventListener('resize', apply)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', apply)
      root.style.scrollPaddingTop = ''
      root.style.scrollPaddingBottom = ''
    }
  }, [])

  return { stageRef, tabsRef, barRef, columnRef }
}
