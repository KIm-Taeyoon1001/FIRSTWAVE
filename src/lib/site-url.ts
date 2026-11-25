const fallback = 'https://firstwave.kty10010.workers.dev';

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return fallback;
  try {
    const url = new URL(configured);
    if (process.env.NODE_ENV === 'production' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return fallback;
    if (!['http:', 'https:'].includes(url.protocol)) return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}
