import { Extension } from '@tiptap/core';

// LineHeight: control de interlineado
export const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return { types: ['heading', 'paragraph'], defaultLineHeight: null };
    },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                lineHeight: {
                    default: this.options.defaultLineHeight,
                    parseHTML: el => el.style.lineHeight || null,
                    renderHTML: attrs => {
                        if (!attrs.lineHeight) return {};
                        return { style: `line-height: ${attrs.lineHeight}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight) => ({ commands }) =>
                this.options.types.every(type => commands.updateAttributes(type, { lineHeight })),
            unsetLineHeight: () => ({ commands }) =>
                this.options.types.every(type => commands.resetAttributes(type, 'lineHeight')),
        };
    },
});
