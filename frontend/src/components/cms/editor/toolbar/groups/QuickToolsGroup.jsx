// Herramientas fijadas por quien escribe y selector de emojis.
import { Divider, ToolBtn } from '../ToolbarParts';
import EmojiPicker from '../../EmojiPicker';
import { PLUS_MENU_ITEMS } from '../../insertMenuConfig';

export default function QuickToolsGroup({
    editor,
    emojiToolRef,
    floatingMenuPosition,
    handleInsertAction,
    handleUnpinTool,
    menus,
    pinnedTools,
    updateFloatingMenuPosition,
}) {
    return (
        <>
            {/* Herramientas fijadas por el usuario */}
            {pinnedTools.length > 0 && (
                <>
                    {pinnedTools.map(tool => {
                        const toolItem = PLUS_MENU_ITEMS.find(item => item.action === tool.action);
                        if (!toolItem) return null;
                        return (
                            <div key={tool.action} className="relative group" onMouseDown={e => e.stopPropagation()}>
                                <ToolBtn 
                                    onClick={() => handleInsertAction(tool.action)} 
                                    title={`${toolItem.title} (fijado)`}
                                >
                                    <span className="text-[10px] font-semibold">{toolItem.icon}</span>
                                </ToolBtn>
                                <button
                                    type="button"
                                    onClick={() => handleUnpinTool(tool.action)}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    title="Quitar de barra"
                                >
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        );
                    })}
                    <Divider />
                </>
            )}

            {/* Emoji */}
            <div ref={emojiToolRef} className="relative" onMouseDown={e => e.stopPropagation()}>
                <ToolBtn onClick={() => {
                    if (!menus.isOpen('emoji')) updateFloatingMenuPosition('emoji', emojiToolRef.current, 320);
                    menus.toggle('emoji');
                }} title="Insertar emoji">
                    <span className="text-sm">😀</span>
                </ToolBtn>
                {menus.isOpen('emoji') && (
                    <EmojiPicker
                        onSelect={emoji => editor?.chain().focus().insertContent(emoji).run()}
                        onClose={() => menus.close('emoji')}
                        className="fixed z-[220] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-[320px] overflow-hidden"
                        style={{ top: `${floatingMenuPosition.emoji.top}px`, left: `${floatingMenuPosition.emoji.left}px` }}
                    />
                )}
            </div>
        </>
    );
}
