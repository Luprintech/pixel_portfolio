import { useCallback, useMemo, useState } from 'react';

// Menús flotantes de la barra del editor. Solo hay uno abierto a la vez, así que basta
// guardar el nombre del abierto en lugar de un booleano por menú.
export function useToolbarMenus() {
    const [openMenu, setOpenMenu] = useState(null);

    const open = useCallback(name => setOpenMenu(name), []);
    const toggle = useCallback(name => setOpenMenu(current => (current === name ? null : name)), []);
    // Sin nombre cierra el que esté abierto; con nombre solo si es ese, para no cerrar otro distinto
    const close = useCallback(name => setOpenMenu(current => (name === undefined || current === name ? null : current)), []);

    return useMemo(
        () => ({ openMenu, isOpen: name => openMenu === name, open, toggle, close }),
        [openMenu, open, toggle, close],
    );
}
