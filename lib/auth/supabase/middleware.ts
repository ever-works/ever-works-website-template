import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Extract locale from URL (fr, en, etc.)
  const locale = request.nextUrl.pathname.split('/')[1] || 'en';
  
  // Extract path without locale
  const pathWithoutLocale = `/${request.nextUrl.pathname.split('/').slice(2).join('/')}`;
  
    // Public and private paths (without locale)
  const PUBLIC_PATHS = [
    '/auth/signin',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
  ];
  const PRIVATE_PATHS: string[] = []; // Remove dashboard from private paths

  const isPrivatePath = PRIVATE_PATHS.some(path => 
    pathWithoutLocale.startsWith(path) || 
    pathWithoutLocale === path
  );

  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );


  if (!user && isPrivatePath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/auth/signin`;
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse
}