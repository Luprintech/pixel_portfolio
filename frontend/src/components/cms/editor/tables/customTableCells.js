// Celdas y cabeceras de tabla con color de fondo y de borde editables.
import { TableCell, TableHeader } from '@tiptap/extension-table';

export const CustomTableCell = TableCell.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: el => el.style.backgroundColor || el.getAttribute('data-bg') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.backgroundColor ? { 'data-bg': attrs.backgroundColor } : {}),
                    };
                },
            },
            borderColor: {
                default: null,
                parseHTML: el => el.style.borderColor || el.getAttribute('data-border-color') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.borderColor ? { 'data-border-color': attrs.borderColor } : {}),
                    };
                },
            },
        };
    },
});

export const CustomTableHeader = TableHeader.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            backgroundColor: {
                default: null,
                parseHTML: el => el.style.backgroundColor || el.getAttribute('data-bg') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.backgroundColor ? { 'data-bg': attrs.backgroundColor } : {}),
                    };
                },
            },
            borderColor: {
                default: null,
                parseHTML: el => el.style.borderColor || el.getAttribute('data-border-color') || null,
                renderHTML: attrs => {
                    const style = [];
                    if (attrs.backgroundColor) style.push(`background-color: ${attrs.backgroundColor}`);
                    if (attrs.borderColor) style.push(`border-color: ${attrs.borderColor}`);
                    return {
                        ...(style.length ? { style: style.join(';') } : {}),
                        ...(attrs.borderColor ? { 'data-border-color': attrs.borderColor } : {}),
                    };
                },
            },
        };
    },
});
