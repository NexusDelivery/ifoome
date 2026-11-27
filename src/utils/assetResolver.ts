const BUNDLED_IMAGE_MODULES = import.meta.glob<string>(
  '../assets/images/*.{jpg,jpeg,png,webp,avif,svg}',
  { eager: true, import: 'default' }
);

interface AssetEntry {
  fileName: string;
  stem: string;
  url: string;
}

const ASSET_ENTRIES: AssetEntry[] = Object.entries(BUNDLED_IMAGE_MODULES)
  .map(([modulePath, resolvedUrl]) => {
    const fileName = (modulePath.split('/').pop() ?? '').toLowerCase();
    const dotIndex = fileName.lastIndexOf('.');
    const stem = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
    return {
      fileName,
      stem,
      url: resolvedUrl,
    };
  })
  .sort((a, b) => b.stem.length - a.stem.length);

const ASSET_BY_FILENAME = new Map<string, string>(
  ASSET_ENTRIES.map((entry) => [entry.fileName, entry.url])
);

function findBundledMatch(pathname: string): string | null {
  const cleanPath = pathname.split(/[?#]/)[0];
  const fileName = (cleanPath.split('/').pop() ?? '').toLowerCase();
  if (!fileName) return null;

  const exact = ASSET_BY_FILENAME.get(fileName);
  if (exact) return exact;

  const dotIndex = fileName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const stemMatch = ASSET_ENTRIES.find(
    (entry) => baseName === entry.stem || baseName.startsWith(`${entry.stem}-`)
  );
  return stemMatch ? stemMatch.url : null;
}

/**
 * Resolve caminhos de imagens padrão salvos no Firestore (como `/src/assets/images/...`
 * ou `/assets/...-<hash>.jpg` sem o subpath do GitHub Pages) para a URL exata gerada
 * pelo build atual do Vite (incluindo `VITE_BASE_PATH`).
 */
export function resolveBundledAssetUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (/^(javascript|vbscript|file):/i.test(trimmed)) {
    return '';
  }

  if (/^data:/i.test(trimmed)) {
    return /^data:image\/(png|jpe?g|webp|gif|avif);base64,/i.test(trimmed)
      ? trimmed
      : '';
  }

  if (/^blob:/i.test(trimmed)) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const isStorageUrl =
        parsed.hostname.includes('firebasestorage') ||
        parsed.hostname.includes('googleapis.com');
      if (!isStorageUrl && (parsed.pathname.includes('/src/assets/images/') || parsed.pathname.includes('/assets/'))) {
        const match = findBundledMatch(parsed.pathname);
        if (match) return match;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  const bundledMatch = findBundledMatch(trimmed);
  if (bundledMatch) {
    return bundledMatch;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    if (normalizedBase !== '/' && !trimmed.startsWith(normalizedBase)) {
      return `${normalizedBase}${trimmed.slice(1)}`;
    }
    return trimmed;
  }

  return trimmed;
}
