import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({request});
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return response;
  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) {
        items.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({request});
        items.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      }
    }
  });
  await client.auth.getUser();
  return response;
}
export const config = { matcher: ['/dashboard/:path*','/admin/:path*','/projects/:path*','/auth/callback'] };
