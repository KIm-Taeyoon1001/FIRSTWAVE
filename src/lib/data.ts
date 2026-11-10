import { db } from './supabase';
import type { Project } from './types';

export async function publicProjects(filters: { q?: string; category?: string; platform?: string; recruitment?: string; sort?: string; page?: number } = {}) {
  const client = await db();
  if (!client) return { projects: [] as Project[], count: 0, unavailable: true };
  const requestedPage = filters.page ?? 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  let query = client.from('project_discovery').select('*', { count: 'exact' });
  if (filters.sort === 'popular') query = query.order('application_count',{ascending:false}).order('created_at',{ascending:false});
  else query = query.order('created_at', { ascending: false });
  if (filters.q) {
    const safe = filters.q.trim().slice(0, 120).replace(/[,()%]/g, '');
    query = query.or(`name.ilike.%${safe}%,tagline.ilike.%${safe}%`);
  }
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.platform) query = query.eq('platform', filters.platform);
  const today = new Date().toISOString().slice(0,10);
  if (filters.recruitment === 'open') query = query.or(`deadline.is.null,deadline.gte.${today}`).gt('available_positions',0);
  if (filters.recruitment === 'closed') query = query.or(`deadline.lt.${today},available_positions.eq.0`);
  const { data, count, error } = await query.range((page - 1) * 12, page * 12 - 1);
  return { projects: (data || []) as Project[], count: count || 0, unavailable: Boolean(error) };
}

export async function recommendedProjects(userId: string, interests: string[] = []) {
  const client = await db();
  if (!client) return [] as Project[];
  const today = new Date().toISOString().slice(0,10);
  async function get(categoryFilter: string[]) {
    let query = client!.from('project_discovery').select('*').neq('maker_id',userId)
      .gt('available_positions',0).or(`deadline.is.null,deadline.gte.${today}`)
      .order('created_at',{ascending:false}).limit(6);
    if (categoryFilter.length) query = query.in('category',categoryFilter);
    const { data } = await query;
    return (data || []) as Project[];
  }
  const matched = await get(interests);
  return matched.length ? matched : get([]);
}

export async function projectBySlug(slug: string) {
  const client = await db();
  if (!client) return null;
  const { data } = await client.from('projects').select('*').eq('slug', slug).maybeSingle();
  return data as Project | null;
}
