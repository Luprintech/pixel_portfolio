// Extrae el tipo y el id de una URL de Spotify
export function parseSpotifyUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    // Acepta tanto open.spotify.com como spotify.com
    const urlObj = new URL(url.trim());
    
    if (!urlObj.hostname.includes('spotify.com')) return null;

    // Extract path: /track/ID, /album/ID, /playlist/ID, /episode/ID
    const pathMatch = urlObj.pathname.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]{22})/);
    
    if (!pathMatch) return null;

    const [, type, id] = pathMatch;
    
    // Los ids de Spotify son alfanuméricos de 22 caracteres
    if (!/^[a-zA-Z0-9]{22}$/.test(id)) return null;

    return { type, id };
  } catch {
    return null;
  }
}

// Generate Spotify embed URL
export function getSpotifyEmbedUrl(type, id, theme = 'dark') {
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${theme}`;
}

// Altura por defecto según el tipo de contenido
export function getDefaultHeight(type) {
  if (type === 'playlist' || type === 'album') return 352;
  return 152; // track, episode
}

// Ancho máximo del contenedor según el tipo de contenido
export function getMaxWidth(type) {
  if (type === 'playlist' || type === 'album') return '800px';
  return '600px';
}
