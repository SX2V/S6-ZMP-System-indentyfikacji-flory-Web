export const photoUrl = (url: string): string | null => {
    if (!url) return null;
    const lower = url.toLowerCase().trimStart();
    if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
    )
        return null;
    if (url.startsWith('http')) return url;
    const filename = url.startsWith('/photos/') ? url.slice(8) : url;
    const base = import.meta.env.DEV ? '/api' : 'https://ezielnik-production.up.railway.app';
    return `${base}/photos/${filename}`;
};
