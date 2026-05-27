export function toEmbeddableImageUrl(url: string): string {
  if (!url) return url;

  // Pattern 1: drive.google.com/file/d/{ID}/...
  const fileMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) {
    return `/api/drive-image?id=${fileMatch[1]}`;
  }

  // Pattern 2: drive.google.com/open?id={ID} or similar
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/[?&]id=([^&#]+)/);
    if (idMatch) {
      return `/api/drive-image?id=${idMatch[1]}`;
    }
  }

  return url;
}
