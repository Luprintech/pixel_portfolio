// Constantes y funciones de apoyo para las imágenes del editor: sombras, esquinas, hover y anotaciones.

export const IMAGE_ANNOTATION_COLORS = ['#000000', '#ff4d4f', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6'];
export const IMAGE_SHADOW_OPTIONS = [
    { value: 'none', label: 'Sin sombra' },
    { value: 'soft', label: 'Suave' },
    { value: 'medium', label: 'Media' },
    { value: 'strong', label: 'Fuerte' },
];
export const IMAGE_HOVER_OPTIONS = [
    { value: 'none', label: 'Sin hover' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'lift', label: 'Elevar' },
];

export function getTextAnnotationPixelSize(fontSize) {
    return Math.max(16, Math.round((Number(fontSize) || 5) * 4.8));
}

export function normalizeImageCornerRadius(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(48, parsed)) : 0;
}

export function normalizeImageBorderWidth(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(12, parsed)) : 0;
}

export function normalizeImageShadow(value) {
    return ['none', 'soft', 'medium', 'strong'].includes(value) ? value : 'none';
}

export function normalizeImageHover(value) {
    return ['none', 'zoom', 'lift'].includes(value) ? value : 'none';
}

export function getImageShadowValue(shadowStyle) {
    switch (normalizeImageShadow(shadowStyle)) {
        case 'soft':
            return '0 12px 30px rgba(15, 23, 42, 0.14)';
        case 'medium':
            return '0 18px 42px rgba(15, 23, 42, 0.18)';
        case 'strong':
            return '0 24px 60px rgba(15, 23, 42, 0.24)';
        default:
            return 'none';
    }
}

export function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}

export function parseImageAnnotations(value) {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function createAnnotationId() {
    return `annotation-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeAnnotationShape(shape) {
    if (!shape || typeof shape !== 'object') return null;

    const type = ['rect', 'circle', 'arrow', 'text'].includes(shape.type) ? shape.type : 'rect';
    const color = typeof shape.color === 'string' && shape.color ? shape.color : '#ff4d4f';
    const strokeWidth = Number(shape.strokeWidth);

    if (type === 'text') {
        const fontSize = Number(shape.fontSize);
        const text = typeof shape.text === 'string' ? shape.text.trim() : '';
        if (!text) return null;

        return {
            id: shape.id || createAnnotationId(),
            type,
            color,
            text,
            fontSize: Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 5,
            fontWeight: shape.fontWeight === '400' || shape.fontWeight === 'normal' ? '400' : '700',
            fontStyle: shape.fontStyle === 'italic' ? 'italic' : 'normal',
            textDecoration: shape.textDecoration === 'underline' ? 'underline' : 'none',
            x: clamp01(Number(shape.x) || 0),
            y: clamp01(Number(shape.y) || 0),
        };
    }

    if (type === 'arrow') {
        return {
            id: shape.id || createAnnotationId(),
            type,
            color,
            strokeWidth: Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 3,
            x: clamp01(Number(shape.x) || 0),
            y: clamp01(Number(shape.y) || 0),
            x2: clamp01(Number(shape.x2) || 0),
            y2: clamp01(Number(shape.y2) || 0),
        };
    }

    return {
        id: shape.id || createAnnotationId(),
        type,
        color,
        strokeWidth: Number.isFinite(strokeWidth) && strokeWidth > 0 ? strokeWidth : 3,
        x: clamp01(Number(shape.x) || 0),
        y: clamp01(Number(shape.y) || 0),
        width: clamp01(Number(shape.width) || 0),
        height: clamp01(Number(shape.height) || 0),
    };
}
