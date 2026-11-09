import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function db() {
  if (!configured) return null;
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(items) { try { items.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Server Components cannot set cookies. */ } },
    },
  });
}

export async function currentUser() {
  const client = await db();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}
