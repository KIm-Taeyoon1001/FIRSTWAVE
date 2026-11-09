import { db } from './supabase';
import type { Project } from './types';

export async function publicProjects(filters: { q?: string; category?: string; platform?: string; recruitment?: string; page?: number } = {}) {
  const client = await db();
  if (!client) return { projects: [] as Project[], count: 0 };
  const page = Math.max(1, filters.page || 1);
  let query = client.from('project_discovery').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (filters.q) {
    const safe = filters.q.replace(/[,()%]/g, '');
    query = query.or(`name.ilike.%${safe}%,tagline.ilike.%${safe}%`);
  }
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.platform) query = query.eq('platform', filters.platform);
  const today = new Date().toISOString().slice(0,10);
  if (filters.recruitment === 'open') query = query.or(`deadline.is.null,deadline.gte.${today}`).gt('available_positions',0);
  if (filters.recruitment === 'closed') query = query.or(`deadline.lt.${today},available_positions.eq.0`);
  const { data, count } = await query.range((page - 1) * 12, page * 12 - 1);
  return { projects: (data || []) as Project[], count: count || 0 };
}

export async function projectBySlug(slug: string) {
  const client = await db();
  if (!client) return null;
  const { data } = await client.from('projects').select('*').eq('slug', slug).maybeSingle();
  return data as Project | null;
}
