import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const destination = url.searchParams.get('next') === '/reset-password' ? '/reset-password' : '/dashboard';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publishableKey) return NextResponse.redirect(new URL('/login?message=Authentication+is+not+configured', request.url));

  let response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set('Cache-Control', 'private, no-store');
  const client = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) { items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
    },
  });

  let error: Error | null = null;
  if (code) ({ error } = await client.auth.exchangeCodeForSession(code));
  else if (tokenHash && (type === 'email' || type === 'recovery')) {
    ({ error } = await client.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else error = new Error('Missing confirmation code');

  if (error) {
    response = NextResponse.redirect(new URL('/login?message=Confirmation+link+is+invalid+or+expired', request.url));
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) {
    response = NextResponse.redirect(new URL('/login?message=Authentication+failed', request.url));
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  const { data: account } = await client.from('users').select('is_suspended').eq('id', auth.user.id).maybeSingle();
  if (account?.is_suspended) {
    response = NextResponse.redirect(new URL('/login?message=This+account+is+unavailable', request.url));
    response.headers.set('Cache-Control', 'private, no-store');
    await client.auth.signOut({ scope: 'local' });
  }
  return response;
}
