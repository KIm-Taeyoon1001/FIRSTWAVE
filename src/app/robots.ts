import type { MetadataRoute } from 'next';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://firstwave.kty10010.workers.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard/', '/admin/', '/auth/', '/login', '/signup', '/forgot-password', '/reset-password', '/resend-confirmation', '/suspended'] },
    sitemap: new URL('/sitemap.xml', site).toString(),
  };
}
