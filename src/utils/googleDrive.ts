/**
 * Utilitário completo para integração, leitura de pastas e conversão de Mídias do Google Drive.
 */

export function parseGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;

  if (url.includes('lh3.googleusercontent.com/d/')) {
    return url;
  }

  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  const fileId = matchD ? matchD[1] : (matchId ? matchId[1] : null);

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
}

export function isGoogleDriveUrl(url: string): boolean {
  return typeof url === 'string' && (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com'));
}

/**
 * Extrai todos os IDs e Links do Google Drive a partir de um texto ou bloco de links colados pelo usuário.
 */
export function extractGoogleDriveLinks(text: string): { originalUrl: string; fileId: string; directUrl: string; filenameSuggestion: string }[] {
  if (!text) return [];

  const driveRegex = /(https?:\/\/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|lh3\.googleusercontent\.com\/d\/)[a-zA-Z0-9_-]+[^\s]*)/g;
  const matches = text.match(driveRegex) || [];

  const results: { originalUrl: string; fileId: string; directUrl: string; filenameSuggestion: string }[] = [];
  const seenIds = new Set<string>();

  matches.forEach((url, idx) => {
    const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const matchDirect = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);

    const fileId = matchD ? matchD[1] : (matchId ? matchId[1] : (matchDirect ? matchDirect[1] : null));

    if (fileId && !seenIds.has(fileId)) {
      seenIds.add(fileId);
      results.push({
        originalUrl: url,
        fileId,
        directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
        filenameSuggestion: `Produto Google Drive ${idx + 1}`,
      });
    }
  });

  return results;
}

/**
 * Tenta extrair o ID da pasta do Google Drive
 */
export function extractGoogleDriveFolderId(url: string): string | null {
  const matchFolder = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return matchFolder ? matchFolder[1] : null;
}
