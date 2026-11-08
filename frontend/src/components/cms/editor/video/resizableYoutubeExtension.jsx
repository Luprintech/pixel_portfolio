// Extensión de YouTube de Tiptap que usa la vista redimensionable.
import { ReactNodeViewRenderer } from '@tiptap/react';
import Youtube from '@tiptap/extension-youtube';
import { createRichBlockTextAlignAttribute } from '../blockAlignment';
import { ResizableYoutubeView } from './ResizableYoutubeView';

export const ResizableYoutubeExtension = Youtube.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            textAlign: createRichBlockTextAlignAttribute(),
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableYoutubeView);
    },
});
