// Mueve un elemento de posición sin mutar el array original
export function moveImageGridItem(items, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return items;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}
