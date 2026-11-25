import type { MetadataRoute } from 'next';
import { db } from '@/lib/supabase';

const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://firstwave.kty10010.workers.dev';
const publicPaths = ['/', '/explore', '/developers', '/how-it-works', '/pricing'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = publicPaths.map(path => ({ url: new URL(path, site).toString() }));
  const client = await db();
  if (!client) return pages;
  const { data, error } = await client.from('projects').select('slug,updated_at').eq('status', 'published').order('updated_at', { ascending: false }).limit(1000);
  if (error || !data) return pages;
  return [...pages, ...data.map(project => ({ url: new URL(`/projects/${encodeURIComponent(project.slug)}`, site).toString(), lastModified: project.updated_at }))];
}
