// Tipografía, alineación y listas.
import { Divider, ToolBtn } from '../ToolbarParts';
import { FONT_FAMILIES } from '../textOptions';

export default function ParagraphGroup({
    editor,
    justifyEnabled,
    richBlockAlignmentActive,
}) {
    return (
        <>
            {/* Selector de familia tipográfica */}
            <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <select
                    value={editor.getAttributes('textStyle').fontFamily || ''}
                    onChange={e => {
                        const val = e.target.value;
                        if (!val) editor.chain().focus().unsetFontFamily().run();
                        else editor.chain().focus().setFontFamily(val).run();
                    }}
                    className="text-xs h-8 px-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] 
                               text-[var(--text-secondary)] hover:border-fuchsia-500/50 cursor-pointer outline-none
                               focus:border-fuchsia-500/60 w-[96px] shrink-0"
                    title="Familia tipográfica"
                >
                    {FONT_FAMILIES.map(f => (
                        <option key={f.label} value={f.value || ''}>{f.label}</option>
                    ))}
                </select>
            </div>

            <Divider />

            {/* Alineación */}
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}    active={editor.isActive({ textAlign: 'left' })}    title="Izquierda"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}  active={editor.isActive({ textAlign: 'center' })}  title="Centrar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}   active={editor.isActive({ textAlign: 'right' })}   title="Derecha"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={!richBlockAlignmentActive && editor.isActive({ textAlign: 'justify' })} disabled={!justifyEnabled} title={justifyEnabled ? 'Justificar' : 'Justificar solo para párrafos y títulos'}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></ToolBtn>

            <Divider />

            {/* Listas */}
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Lista viñetas"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="1" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text><text x="1" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text><text x="1" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text></svg></ToolBtn>

            <Divider />
        </>
    );
}
