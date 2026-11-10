import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured = Boolean(supabaseUrl && publishableKey);

export async function db() {
  if (!configured) return null;
  const jar = await cookies();
  return createServerClient(supabaseUrl!, publishableKey!, {
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
