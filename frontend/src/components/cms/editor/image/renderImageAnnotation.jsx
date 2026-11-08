// Dibuja una anotación (flecha, rectángulo, texto...) sobre una imagen.
export function renderImageAnnotation(shape, keyPrefix = 'annotation', options = {}) {
    if (!shape) return null;
    const { selected = false, onSelect = null, interactive = false } = options;
    const strokeWidth = Math.max(2, Number(shape.strokeWidth) || 3);
    const common = {
        key: `${keyPrefix}-${shape.id}`,
        stroke: shape.color || '#ff4d4f',
        strokeWidth,
        fill: 'transparent',
        vectorEffect: 'non-scaling-stroke',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
    };
    const selectionStroke = '#22d3ee';
    const interactionProps = interactive && typeof onSelect === 'function'
        ? {
            onPointerDown: (event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(event, shape);
            },
            style: { cursor: 'pointer' },
        }
        : {};

    if (shape.type === 'text') {
        return (
            <g key={`${keyPrefix}-${shape.id}`} {...interactionProps}>
                <text
                    x={(shape.x || 0) * 100}
                    y={(shape.y || 0) * 100}
                    fill={shape.color || '#000000'}
                    fontSize={Number(shape.fontSize) || 5}
                    fontWeight={shape.fontWeight || '700'}
                    fontStyle={shape.fontStyle || 'normal'}
                    textDecoration={shape.textDecoration || 'none'}
                    paintOrder="stroke"
                    stroke={selected ? selectionStroke : 'rgba(255,255,255,0.92)'}
                    strokeWidth={selected ? '1.8' : '1.1'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dominantBaseline="hanging"
                >
                    {shape.text || ''}
                </text>
            </g>
        );
    }

    if (shape.type === 'arrow') {
        const x1 = shape.x * 100;
        const y1 = shape.y * 100;
        const x2 = shape.x2 * 100;
        const y2 = shape.y2 * 100;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 3.8;
        const headAngle = Math.PI / 7;
        const arrowLeftX = x2 - headLength * Math.cos(angle - headAngle);
        const arrowLeftY = y2 - headLength * Math.sin(angle - headAngle);
        const arrowRightX = x2 - headLength * Math.cos(angle + headAngle);
        const arrowRightY = y2 - headLength * Math.sin(angle + headAngle);

        return (
            <g key={`${keyPrefix}-${shape.id}`} {...interactionProps}>
                {selected ? <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={selectionStroke} strokeWidth={strokeWidth + 3} fill="transparent" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" /> : null}
                <line {...common} x1={x1} y1={y1} x2={x2} y2={y2} />
                <polygon
                    points={`${x2},${y2} ${arrowLeftX},${arrowLeftY} ${arrowRightX},${arrowRightY}`}
                    fill={shape.color || '#ff4d4f'}
                    stroke="none"
                />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={Math.max(12, strokeWidth + 8)} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            </g>
        );
    }

    if (shape.type === 'circle') {
        return (
            <g key={`${keyPrefix}-${shape.id}`} {...interactionProps}>
                {selected ? (
                    <ellipse
                        cx={(shape.x + (shape.width || 0) / 2) * 100}
                        cy={(shape.y + (shape.height || 0) / 2) * 100}
                        rx={((shape.width || 0) / 2) * 100}
                        ry={((shape.height || 0) / 2) * 100}
                        stroke={selectionStroke}
                        strokeWidth={strokeWidth + 3}
                        fill="transparent"
                        vectorEffect="non-scaling-stroke"
                    />
                ) : null}
                <ellipse
                    {...common}
                    cx={(shape.x + (shape.width || 0) / 2) * 100}
                    cy={(shape.y + (shape.height || 0) / 2) * 100}
                    rx={((shape.width || 0) / 2) * 100}
                    ry={((shape.height || 0) / 2) * 100}
                />
                <ellipse
                    cx={(shape.x + (shape.width || 0) / 2) * 100}
                    cy={(shape.y + (shape.height || 0) / 2) * 100}
                    rx={((shape.width || 0) / 2) * 100}
                    ry={((shape.height || 0) / 2) * 100}
                    stroke="transparent"
                    strokeWidth={Math.max(12, strokeWidth + 8)}
                    fill="transparent"
                    vectorEffect="non-scaling-stroke"
                />
            </g>
        );
    }

    return (
        <g key={`${keyPrefix}-${shape.id}`} {...interactionProps}>
            {selected ? <rect x={shape.x * 100} y={shape.y * 100} width={(shape.width || 0) * 100} height={(shape.height || 0) * 100} rx="1.2" ry="1.2" stroke={selectionStroke} strokeWidth={strokeWidth + 3} fill="transparent" vectorEffect="non-scaling-stroke" /> : null}
            <rect {...common} x={shape.x * 100} y={shape.y * 100} width={(shape.width || 0) * 100} height={(shape.height || 0) * 100} rx="1.2" ry="1.2" />
            <rect x={shape.x * 100} y={shape.y * 100} width={(shape.width || 0) * 100} height={(shape.height || 0) * 100} rx="1.2" ry="1.2" stroke="transparent" strokeWidth={Math.max(12, strokeWidth + 8)} fill="transparent" vectorEffect="non-scaling-stroke" />
        </g>
    );
}
