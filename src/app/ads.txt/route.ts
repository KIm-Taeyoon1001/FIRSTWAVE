export const dynamic = 'force-dynamic';

export function GET() {
  const publisherId = process.env.ADSENSE_PUBLISHER_ID;
  if (!publisherId || !/^pub-\d{16}$/.test(publisherId)) {
    return new Response('Not configured\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
