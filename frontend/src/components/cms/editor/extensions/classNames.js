// Une clases CSS ignorando los valores vacíos o falsos
export function joinClassNames(...values) {
    return values.filter(Boolean).join(' ');
}
