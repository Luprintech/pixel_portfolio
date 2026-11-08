import { createPortal } from 'react-dom';
import { IMAGE_ANNOTATION_COLORS, IMAGE_SHADOW_OPTIONS, IMAGE_HOVER_OPTIONS } from './imageHelpers';

// Barra flotante de la imagen seleccionada: herramientas de anotación y apariencia
export function ImageToolbar({ style, annotations, appearance, updateAttributes }) {
    const {
        annotationMode, setAnnotationMode, setDraftAnnotation, setSelectedAnnotationId,
        annotationTool, setAnnotationTool, annotationColor, setAnnotationColor,
        selectedAnnotation, updateAnnotationById, removeLastAnnotation, clearAnnotations,
    } = annotations;
    const { imageCornerRadius, imageBorderWidth, imageBorderColor, imageShadow, imageHover } = appearance;

    return createPortal(
        <div
            contentEditable={false}
            className="z-[110] flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/95 px-2 py-1.5 text-[10px] text-slate-200 shadow-2xl backdrop-blur"
            style={style}
            onMouseDown={e => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={() => {
                    setAnnotationMode(current => !current);
                    setDraftAnnotation(null);
                    setSelectedAnnotationId(null);
                }}
                className={`rounded-md px-2 py-1 font-semibold transition-colors ${annotationMode ? 'bg-fuchsia-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
            >
                {annotationMode ? 'Cerrar anotación' : 'Anotar'}
            </button>
            <div className="h-4 w-px bg-white/10" />
            {['rect', 'circle', 'arrow', 'text'].map(tool => (
                <button
                    key={tool}
                    type="button"
                    onClick={() => { setAnnotationTool(tool); setAnnotationMode(true); }}
                    className={`rounded-md px-2 py-1 uppercase tracking-wide transition-colors ${annotationTool === tool ? 'bg-cyan-500/20 text-cyan-200' : 'bg-white/5 hover:bg-white/10'}`}
                >
                    {tool === 'rect' ? 'Rect' : tool === 'circle' ? 'Círculo' : tool === 'arrow' ? 'Flecha' : 'Texto'}
                </button>
            ))}
            <div className="flex items-center gap-1">
                {IMAGE_ANNOTATION_COLORS.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => {
                            setAnnotationColor(color);
                            if (selectedAnnotation) {
                                updateAnnotationById(selectedAnnotation.id, { color });
                            }
                        }}
                        className={`h-4 w-4 rounded-full border ${annotationColor === color ? 'scale-110 border-white' : 'border-white/25'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Seleccionar color ${color}`}
                    />
                ))}
            </div>
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span className="uppercase tracking-wide text-slate-300">Color</span>
                <input
                    type="color"
                    value={annotationColor}
                    onChange={(event) => {
                        const color = event.target.value;
                        setAnnotationColor(color);
                        if (selectedAnnotation) {
                            updateAnnotationById(selectedAnnotation.id, { color });
                        }
                    }}
                    className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    aria-label="Seleccionar cualquier color para la anotación"
                />
            </label>
            <button type="button" onClick={removeLastAnnotation} className="rounded-md px-2 py-1 bg-white/5 hover:bg-white/10">Deshacer</button>
            <button type="button" onClick={clearAnnotations} className="rounded-md px-2 py-1 bg-white/5 hover:bg-white/10">Limpiar</button>
            <div className="h-4 w-px bg-white/10" />
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span>Radio</span>
                <input type="range" min="0" max="48" step="2" value={imageCornerRadius} onChange={e => updateAttributes({ cornerRadius: Number(e.target.value) })} className="w-20" />
                <span className="font-mono">{imageCornerRadius}px</span>
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span>Borde</span>
                <input type="range" min="0" max="12" step="1" value={imageBorderWidth} onChange={e => updateAttributes({ borderWidth: Number(e.target.value) })} className="w-16" />
                <span className="font-mono">{imageBorderWidth}px</span>
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span>Color borde</span>
                <input type="color" value={imageBorderColor} onChange={e => updateAttributes({ borderColor: e.target.value, borderWidth: imageBorderWidth || 1 })} className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span>Sombra</span>
                <select value={imageShadow} onChange={e => updateAttributes({ shadowStyle: e.target.value })} className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none">
                    {IMAGE_SHADOW_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1 text-[11px]">
                <span>Hover</span>
                <select value={imageHover} onChange={e => updateAttributes({ hoverEffect: e.target.value })} className="rounded-md border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 outline-none">
                    {IMAGE_HOVER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
        </div>,
        document.body,
    );
}
