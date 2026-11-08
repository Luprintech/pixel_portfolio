// Lista de extensiones de Tiptap con las que se construye el editor de posts.
import StarterKit from '@tiptap/starter-kit';
import { createTechnicalCodeBlockExtension } from './technicalCodeBlockExtension';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import { TooltipMark } from './extensions/tooltipMark';
import TextAlign from '@tiptap/extension-text-align';
import { ResizableImageExtension } from './image/resizableImageExtension';
import { ResizableYoutubeExtension } from './video/resizableYoutubeExtension';
import { AudioNode } from './audio/audioNode';
import { Table, TableRow } from '@tiptap/extension-table';
import { CustomTableHeader, CustomTableCell } from './tables/customTableCells';
import { CalloutExtension } from './callout/calloutNode';
import { MermaidNode } from './mermaid/mermaidNode';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { LineHeight, AccordionExtension, ContentButtonExtension, DocumentAttachmentExtension, ImageGridExtension, VideoGalleryExtension, GifExtension, QuoteCardExtension, StatsCounterExtension, TimelineExtension, ComparisonSliderExtension, CountdownTimerExtension, ProgressBarsExtension, SpotifyEmbedExtension, SocialShareExtension, TabsExtension, ToggleExtension, QuizExtension, PollExtension } from './extensions';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

export function buildEditorExtensions(lowlight) {
    return [
        // StarterKit ya incluye link y underline: se configuran aquí en vez de registrarlos aparte,
        // porque un segundo registro con el mismo nombre hace que Tiptap avise de extensiones duplicadas.
        StarterKit.configure({
            codeBlock: false,
            link: {
                openOnClick: false,
                HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
            },
        }),
        createTechnicalCodeBlockExtension(lowlight),
        TextStyle,
        Color,
        FontFamily.configure({ types: ['textStyle'] }),
        Highlight.configure({ multicolor: true }),
        TooltipMark,
        TextAlign.configure({ types: ['heading', 'paragraph', 'image', 'youtube', 'audio', 'callout', 'mermaid', 'accordion', 'contentButton', 'documentAttachment', 'imageGrid'] }),
        ResizableImageExtension.configure({ allowBase64: false }),
        ResizableYoutubeExtension,
        AudioNode,
        Table.configure({ resizable: true }),
        TableRow,
        CustomTableHeader,
        CustomTableCell,
        CalloutExtension,
        MermaidNode,
        Superscript,
        Subscript,
        LineHeight,
        AccordionExtension,
        ContentButtonExtension,
        DocumentAttachmentExtension,
        ImageGridExtension,
        VideoGalleryExtension,
        GifExtension,
        QuoteCardExtension,
        StatsCounterExtension,
        TimelineExtension,
        ComparisonSliderExtension,
        CountdownTimerExtension,
        ProgressBarsExtension,
        SpotifyEmbedExtension,
        SocialShareExtension,
        TabsExtension,
        ToggleExtension,
        QuizExtension,
        PollExtension,
        Placeholder.configure({
            showOnlyCurrent: false,
            placeholder: ({ node }) => {
                if (node.type.name === 'heading') return 'Título…';
                if (node.type.name === 'paragraph') return 'Escribe aquí… Usa "/" para insertar bloques';
                return '';
            },
        }),
        CharacterCount,
    ];
}
