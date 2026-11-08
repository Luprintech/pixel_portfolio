// Nodo de Tiptap para los diagramas Mermaid.
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';
import { MERMAID_TEMPLATES } from '../diagramConfig';
import { MermaidView } from './MermaidView';

export const MermaidNode = Node.create({
    name: 'mermaid',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            code: {
                default: MERMAID_TEMPLATES.flowchart,
                parseHTML: el => el.getAttribute('data-mermaid-code') || '',
                renderHTML: attrs => ({ 'data-mermaid-code': attrs.code }),
            },
            theme: {
                default: 'dark',
                parseHTML: el => el.getAttribute('data-mermaid-theme') || 'dark',
                renderHTML: attrs => ({ 'data-mermaid-theme': attrs.theme }),
            },
            bgColor: {
                default: '#0f172a',
                parseHTML: el => el.getAttribute('data-mermaid-bg') || '#0f172a',
                renderHTML: attrs => ({ 'data-mermaid-bg': attrs.bgColor }),
            },
            borderColor: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-border') || '',
                renderHTML: attrs => attrs.borderColor ? { 'data-mermaid-border': attrs.borderColor } : {},
            },
            title: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-title') || '',
                renderHTML: attrs => attrs.title ? { 'data-mermaid-title': attrs.title } : {},
            },
            caption: {
                default: '',
                parseHTML: el => el.getAttribute('data-mermaid-caption') || '',
                renderHTML: attrs => attrs.caption ? { 'data-mermaid-caption': attrs.caption } : {},
            },
            size: {
                default: 'standard',
                parseHTML: el => el.getAttribute('data-mermaid-size') || 'standard',
                renderHTML: attrs => ({ 'data-mermaid-size': attrs.size || 'standard' }),
            },
            padding: {
                default: 'md',
                parseHTML: el => el.getAttribute('data-mermaid-padding') || 'md',
                renderHTML: attrs => ({ 'data-mermaid-padding': attrs.padding || 'md' }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-mermaid-code]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { class: 'mermaid-block' })), 0];
    },
    addNodeView() { return ReactNodeViewRenderer(MermaidView); },
    addCommands() {
        return {
            insertMermaid: (code) => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs: { code } }),
        };
    },
});
