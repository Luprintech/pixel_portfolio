import { useState } from 'react';

// Estilos de las variantes predefinidas del botón CTA
export const VARIANT_STYLES = {
    primary:   'bg-blue-600 text-white shadow-lg shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25',
    fuchsia:   'bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25',
    outline:   'border-2 border-blue-500 text-blue-400',
    dark:      'bg-zinc-900 text-white shadow-lg shadow-zinc-900/25',
};

const DEFAULT_CTA_COLORS = [
    { label: 'Fuchsia',  bg: '#c026d3', text: '#ffffff' },
    { label: 'Cyan',     bg: '#0891b2', text: '#ffffff' },
    { label: 'Azul',     bg: '#2563eb', text: '#ffffff' },
    { label: 'Verde',    bg: '#16a34a', text: '#ffffff' },
    { label: 'Naranja',  bg: '#ea580c', text: '#ffffff' },
    { label: 'Rojo',     bg: '#dc2626', text: '#ffffff' },
    { label: 'Negro',    bg: '#18181b', text: '#ffffff' },
    { label: 'Blanco',   bg: '#ffffff', text: '#18181b' },
];

const CTA_PRESETS_KEY = 'cta_custom_presets';
const CTA_BUTTON_CONFIGS_KEY = 'cta_button_configs';

function loadCustomPresets() {
    try {
        return JSON.parse(localStorage.getItem(CTA_PRESETS_KEY)) || [];
    } catch { return []; }
}

function saveCustomPresets(presets) {
    localStorage.setItem(CTA_PRESETS_KEY, JSON.stringify(presets));
}

function loadButtonConfigs() {
    try {
        return JSON.parse(localStorage.getItem(CTA_BUTTON_CONFIGS_KEY)) || [];
    } catch { return []; }
}

function saveButtonConfigs(configs) {
    localStorage.setItem(CTA_BUTTON_CONFIGS_KEY, JSON.stringify(configs));
}

// Colores y configuraciones propias de quien edita: viven en localStorage del navegador
export function useCtaPresets() {
    const [customPresets, setCustomPresets] = useState(loadCustomPresets);
    const [savedConfigs, setSavedConfigs] = useState(loadButtonConfigs);

    function saveColorPreset(attrs) {
        if (!attrs.bgColor || customPresets.some(p => p.bg === attrs.bgColor)) return;
        const updated = [
            ...customPresets,
            { label: `Custom ${customPresets.length + 1}`, bg: attrs.bgColor, text: attrs.textColor || '#ffffff', custom: true },
        ];
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function deleteColorPreset(bg) {
        const updated = customPresets.filter(p => p.bg !== bg);
        setCustomPresets(updated);
        saveCustomPresets(updated);
    }

    function saveConfig(name, attrs) {
        const config = {
            name: name.trim() || `Preset ${savedConfigs.length + 1}`,
            bgColor: attrs.bgColor,
            textColor: attrs.textColor,
            variant: attrs.variant,
            bold: attrs.bold,
            italic: attrs.italic,
            underline: attrs.underline,
            uppercase: attrs.uppercase,
            fontSize: attrs.fontSize,
            rounded: attrs.rounded,
        };
        const updated = [...savedConfigs, config];
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
    }

    function deleteConfig(index) {
        const updated = savedConfigs.filter((_, i) => i !== index);
        setSavedConfigs(updated);
        saveButtonConfigs(updated);
    }

    return {
        allColorPresets: [...DEFAULT_CTA_COLORS, ...customPresets],
        savedConfigs,
        saveColorPreset,
        deleteColorPreset,
        saveConfig,
        deleteConfig,
    };
}
