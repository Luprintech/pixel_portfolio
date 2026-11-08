// Opciones de tamaño, interlineado, tipografía y lenguajes de código del editor.

export const FONT_SIZES = ['12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];
export const LINE_HEIGHTS = ['1', '1.2', '1.5', '1.8', '2'];
export const FONT_FAMILIES = [
    { label: 'Por defecto', value: null },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Monospace', value: 'monospace' },
];
export const CODE_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash / Terminal' },
    { value: 'json', label: 'JSON' },
    { value: 'python', label: 'Python' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'docker', label: 'Dockerfile' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'xml', label: 'XML' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
];

export const CODE_VARIANTS = [
    { value: 'plain', label: 'Snippet' },
    { value: 'terminal', label: 'Terminal' },
];
