import type { MetadataRoute } from 'next';
import { db } from '@/lib/supabase';
import { siteUrl } from '@/lib/site-url';

const publicPaths = ['/', '/explore', '/developers', '/how-it-works', '/pricing'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = publicPaths.map(path => ({ url: new URL(path, siteUrl()).toString() }));
  const client = await db();
  if (!client) return pages;
  const { data, error } = await client.from('projects').select('slug,updated_at').eq('status', 'published').order('updated_at', { ascending: false }).limit(1000);
  if (error || !data) return pages;
  return [...pages, ...data.map(project => ({ url: new URL(`/projects/${encodeURIComponent(project.slug)}`, siteUrl()).toString(), lastModified: project.updated_at }))];
}
