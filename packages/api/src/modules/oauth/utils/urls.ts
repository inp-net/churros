import _normalizeUrl from 'normalize-url';

export function normalizeUrl(url: string): string {
  const result = new URL(_normalizeUrl(url));
  if (result.hostname === '127.0.0.1') result.hostname = 'localhost';
  return result.toString();
}
