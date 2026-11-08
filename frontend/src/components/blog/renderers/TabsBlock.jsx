import { useState, useMemo } from 'react';

const TAB_STYLES = {
  underline: 'underline',
  pills: 'pills',
  boxed: 'boxed',
  minimal: 'minimal',
};

export default function TabsBlock({ tabs = [], style = 'underline', alignment = 'left' }) {
  const validTabs = useMemo(() => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return [{ id: 'default-1', title: 'Tab 1', icon: '', content: 'Contenido no disponible' }];
    }
    return tabs;
  }, [tabs]);

  const [activeTabId, setActiveTabId] = useState(validTabs[0]?.id || null);

  const activeTab = validTabs.find(t => t.id === activeTabId) || validTabs[0];

  const getTabButtonClass = (isActive) => {
    const base = 'px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap';
    
    if (style === 'underline') {
      return `${base} border-b-2 ${isActive 
        ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' 
        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'}`;
    }
    
    if (style === 'pills') {
      return `${base} rounded-full ${isActive 
        ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/50' 
        : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'}`;
    }
    
    if (style === 'boxed') {
      return `${base} rounded-t-lg border-x border-t ${isActive 
        ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary-dim)] text-[var(--accent-primary)] -mb-px border-b border-b-[var(--bg-primary)]' 
        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`;
    }
    
    // minimal
    return `${base} ${isActive 
      ? 'text-[var(--accent-primary)] font-semibold' 
      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`;
  };

  const getAlignmentClass = () => {
    if (alignment === 'center') return 'justify-center';
    if (alignment === 'right') return 'justify-end';
    return 'justify-start';
  };

  const getContainerClass = () => {
    if (style === 'boxed') {
      return 'rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)]/30 p-4 min-h-[120px]';
    }
    return 'rounded-lg p-4 min-h-[120px]';
  };

  return (
    <div className="my-8 w-full" data-tabs="" data-style={style} data-alignment={alignment}>
      {/* Tab Headers */}
      <div
        className={`flex gap-1 ${getAlignmentClass()} ${
 style === 'boxed' ? 'border-b border-[var(--border-color)]' : ''
 } mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent`}
        role="tablist"
      >
        {validTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab?.id === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTabId(tab.id)}
            className={getTabButtonClass(activeTab?.id === tab.id)}
          >
            {tab.icon && <span className="mr-1.5" aria-hidden="true">{tab.icon}</span>}
            {tab.title || 'Sin título'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        id={`tabpanel-${activeTab?.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab?.id}`}
        className={getContainerClass()}
      >
        <div className="prose prose-invert max-w-none transition-opacity duration-300 ease-in-out">
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
            {activeTab?.content || 'Sin contenido'}
          </p>
        </div>
      </div>
    </div>
  );
}
