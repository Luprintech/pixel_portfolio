import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

// Accordion: bloques colapsables
function AccordionView({ node, updateAttributes, selected, deleteNode }) {
    const [open, setOpen] = useState(node.attrs.open !== false);
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden my-4">
                <div
                    className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-elevated)] cursor-pointer select-none"
                    contentEditable={false}
                    onClick={() => { setOpen(!open); updateAttributes({ open: !open }); }}
                >
                    <span className={`transition-transform duration-200 text-xs text-[var(--text-muted)] ${open ? 'rotate-90' : ''}`}>▶</span>
                    <input
                        value={node.attrs.summary}
                        onChange={e => updateAttributes({ summary: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => e.stopPropagation()}
                        className="bg-transparent flex-1 outline-none font-semibold text-[var(--text-primary)] text-sm"
                        placeholder="Título del acordeón…"
                    />
                </div>
                {open && (
                    <div className="px-4 py-3 border-t border-[var(--border-color)]">
                        <NodeViewContent />
                    </div>
                )}
            </div>
        </RichBlockFrame>
    );
}

export const AccordionExtension = Node.create({
    name: 'accordion',
    group: 'block',
    content: 'block+',
    defining: true,
    addAttributes() {
        return {
            summary: {
                default: 'Haz clic para expandir',
                parseHTML: el => el.getAttribute('data-summary') || 'Haz clic para expandir',
                renderHTML: attrs => ({ 'data-summary': attrs.summary }),
            },
            open: {
                default: true,
                parseHTML: el => el.getAttribute('data-open') !== 'false',
                renderHTML: attrs => ({ 'data-open': String(attrs.open) }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-accordion]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-accordion': '' })), 0];
    },
    addNodeView() { return ReactNodeViewRenderer(AccordionView); },
    addCommands() {
        return {
            insertAccordion: () => ({ commands }) => commands.insertContent({
                type: this.name,
                attrs: { summary: 'Haz clic para expandir' },
                content: [{ type: 'paragraph' }],
            }),
        };
    },
});
