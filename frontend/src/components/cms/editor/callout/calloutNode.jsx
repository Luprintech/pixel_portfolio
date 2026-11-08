// Avisos del editor (consejo, nota, advertencia e información).
import { ReactNodeViewRenderer, NodeViewContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import { CALLOUT_CONFIG } from './calloutConfig';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

function CalloutView({ node, updateAttributes, selected, deleteNode }) {
    const cfg = CALLOUT_CONFIG[node.attrs.type] || CALLOUT_CONFIG.tip;
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            frameClassName="w-full"
        >
            <div style={{
                borderLeft: `4px solid ${cfg.border}`,
                background: cfg.bg,
                borderRadius: '0 8px 8px 0',
                padding: '10px 16px',
                margin: '16px 0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{cfg.icon}</span>
                    <select
                        value={node.attrs.type}
                        onChange={e => updateAttributes({ type: e.target.value })}
                        style={{
                            background: 'transparent', border: 'none', fontWeight: 700,
                            color: cfg.border, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em',
                        }}
                    >
                        {Object.entries(CALLOUT_CONFIG).map(([k, v]) => (
                            <option key={k} value={k} style={{ background: '#1a1a2e', color: '#e2e8f0' }}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <NodeViewContent style={{ margin: 0 }} />
            </div>
        </RichBlockFrame>
    );
}

export const CalloutExtension = Node.create({
    name: 'callout',
    group: 'block',
    content: 'block+',
    defining: true,
    addAttributes() {
        return {
            type: {
                default: 'tip',
                parseHTML: el => el.getAttribute('data-callout-type') || 'tip',
                renderHTML: attrs => ({ 'data-callout-type': attrs.type }),
            },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'div[data-callout]' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['div', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { 'data-callout': '' })), 0];
    },
    addNodeView() {
        return ReactNodeViewRenderer(CalloutView);
    },
    addCommands() {
        return {
            insertCallout: (type = 'tip') => ({ commands }) =>
                commands.insertContent({
                    type: this.name,
                    attrs: { type },
                    content: [{ type: 'paragraph' }],
                }),
        };
    },
});
