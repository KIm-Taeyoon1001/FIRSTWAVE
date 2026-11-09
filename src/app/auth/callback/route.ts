import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  if (!code || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.redirect(new URL('/login',request.url));
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) { items.forEach(({name,value,options}) => response.cookies.set(name,value,options)); }
    }
  });
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/login?message=Authentication+failed',request.url));
  return response;
}
