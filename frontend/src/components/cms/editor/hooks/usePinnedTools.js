// Herramientas que la persona fija en la barra desde el menú de insertar; se recuerdan entre sesiones.
import { useState } from 'react';
import { PINNED_TOOLS, savePinnedTools } from '../insertMenuConfig';

export function usePinnedTools() {
    const [pinnedTools, setPinnedTools] = useState(PINNED_TOOLS);

    function updatePinned(next) {
        setPinnedTools(next);
        savePinnedTools(next);
    }

    function handlePinTool(tool) {
        if (!pinnedTools.find(t => t.action === tool.action)) {
            updatePinned([...pinnedTools, tool]);
        }
    }

    function handleUnpinTool(action) {
        updatePinned(pinnedTools.filter(t => t.action !== action));
    }

    return { pinnedTools, handlePinTool, handleUnpinTool };
}
