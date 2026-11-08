// Nodo de audio del editor y su vista.
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import RichBlockFrame from '../RichBlockFrame';
import { createRichBlockTextAlignAttribute, getRichBlockHtmlAttributes } from '../blockAlignment';

export const AudioNode = Node.create({
    name: 'audio',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            src:   { default: null },
            title: { default: null },
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    parseHTML() { return [{ tag: 'audio' }]; },
    renderHTML({ node, HTMLAttributes }) {
        return ['audio', mergeAttributes(getRichBlockHtmlAttributes(HTMLAttributes, node.attrs.textAlign, { controls: true, class: 'w-full my-4 rounded-lg' }))];
    },
    addNodeView() {
        return ReactNodeViewRenderer(AudioView);
    },
    addCommands() {
        return {
            insertAudio: attrs => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs }),
        };
    },
});

export function AudioView({ node, selected, deleteNode }) {
    return (
        <RichBlockFrame
            alignment={node.attrs.textAlign}
            selected={selected}
            onRemove={deleteNode}
            wrapperClassName="my-4"
            frameClassName="w-full"
        >
            <div className={`${selected ? 'rounded-xl ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-transparent' : ''}`}>
                <audio controls className="w-full rounded-lg" src={node.attrs.src || ''} />
                {node.attrs.title ? (
                    <p className="mt-1 text-center text-sm italic text-gray-500">{node.attrs.title}</p>
                ) : null}
            </div>
        </RichBlockFrame>
    );
}
