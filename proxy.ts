// -------------------------------------------------------
// Unified middleware that supports *either* Supabase Auth
// *or* NextAuth (or both) while keeping locale handling
// -------------------------------------------------------

import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest, NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import { updateSession as supabaseUpdate } from "@/lib/auth/supabase/middleware";
import { getToken } from 'next-auth/jwt';

const intl = createIntlMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const ADMIN_SIGNIN = "/admin/auth/signin";

/* ────────────────────────────── Locale helper ───────────────────────────────────── */

function resolveLocalePrefix(pathname: string): { prefix: string; hasLocale: boolean; locale?: string; pathWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = routing.locales.includes(maybeLocale as any);
  const pathWithoutLocale = hasLocale ? `/${segments.slice(1).join('/')}` : pathname;
  return {
    prefix: hasLocale ? `/${maybeLocale}` : "",
    hasLocale,
    locale: hasLocale ? maybeLocale : undefined,
    pathWithoutLocale
  };
}

/* ────────────────────────────────── NextAuth guard ────────────────────────────────── */

async function nextAuthGuard(req: NextRequest, baseRes: NextResponse): Promise<NextResponse> {
  try {
    // Use JWT token check (Edge-compatible)
    const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET });
    if (token?.isAdmin === true) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Admin access granted via token');
      }
      return baseRes;
    }
  } catch (error) {
    console.error(
      'NextAuth guard error',
      error instanceof Error ? { name: error.name, message: error.message } : undefined
    );
  }

  // Redirect non-admins or on error
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Access denied - redirecting to admin signin');
  }

  const url = req.nextUrl.clone();
  const { prefix: rootLocalePrefix } = resolveLocalePrefix(req.nextUrl.pathname);
  url.pathname = `${rootLocalePrefix}${ADMIN_SIGNIN}`;
  url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
  const redirectRes = NextResponse.redirect(url);
  baseRes.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
  return redirectRes;
}

/* ────────────────────────────── Supabase guard helper ────────────────────────────── */
async function supabaseGuard(req: NextRequest, baseRes: NextResponse): Promise<NextResponse> {
  // Refresh Supabase session & get proper cookies
  const supRes = await supabaseUpdate(req);

  // Merge any Set-Cookie headers from Supabase response into the base response
  supRes.cookies.getAll().forEach((cookie) => {
    baseRes.cookies.set(cookie);
  });

  // Get user from Supabase
  const { createServerClient } = await import('@supabase/ssr');
  const { data: { user } } = await createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => baseRes.cookies.set(cookie));
        },
      },
    }
  ).auth.getUser();

  // Check admin flag in user metadata
  const isAdmin = user?.user_metadata?.isAdmin === true || user?.user_metadata?.role === 'admin';
  if (!isAdmin) {
    const url = req.nextUrl.clone();
    const { prefix: rootLocalePrefix } = resolveLocalePrefix(req.nextUrl.pathname);
    url.pathname = `${rootLocalePrefix}${ADMIN_SIGNIN}`;
    url.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    const redirectRes = NextResponse.redirect(url);
    baseRes.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
    return redirectRes;
  }

  return baseRes;
}

/* ──────────────────────────────────── Main middleware ─────────────────────────────────── */

export default async function proxy(req: NextRequest) {
  const cfg = getAuthConfig();
  const originalPathname = req.nextUrl.pathname;

  const intlResponse = await intl(req as any);

  const { prefix: localePrefix, pathWithoutLocale } = resolveLocalePrefix(originalPathname);

  // Only redirect admins away from /client/* without DB calls.
  if (pathWithoutLocale === "/client" || pathWithoutLocale.startsWith("/client/")) {
    if (cfg.provider === "next-auth") {
      // For NextAuth, we'll skip admin redirect in Edge Runtime to avoid Node.js modules
      // Admin redirect will be handled by the client-side logic
    } else if (cfg.provider === "supabase") {
      // For Supabase, check user metadata for admin flag
      const { createServerClient } = await import('@supabase/ssr');
      const { data: { user } } = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return req.cookies.getAll(); },
            setAll(cookiesToSet) {
              cookiesToSet.forEach((cookie) => intlResponse.cookies.set(cookie));
            },
          },
        }
      ).auth.getUser();

      const isAdmin = user?.user_metadata?.isAdmin === true || user?.user_metadata?.role === 'admin';
      if (isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = `${localePrefix}/admin`;
        const redirectRes = NextResponse.redirect(url);
        intlResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
        return redirectRes;
      }
    } else if (cfg.provider === "both") {
      // Check NextAuth first; if it's allowed (admin), redirect to /admin without DB calls.
      // If it redirects (unauthorized or import failure), fallback to Supabase.
      const nextAuthRes = await nextAuthGuard(req, intlResponse);
      const isRedirect =
        nextAuthRes.redirected || (nextAuthRes.status >= 300 && nextAuthRes.status < 400);
      if (!isRedirect) {
        const url = req.nextUrl.clone();
        const { prefix: rootLocalePrefix } = resolveLocalePrefix(req.nextUrl.pathname);
        url.pathname = `${rootLocalePrefix}${ADMIN_PREFIX}`;
        const redirectRes = NextResponse.redirect(url);
        nextAuthRes.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
        return redirectRes;
      }
      // NextAuth denied or failed — try Supabase
      return supabaseGuard(req, intlResponse);
    }
    return intlResponse;
  }
  
  if (pathWithoutLocale.startsWith(ADMIN_PREFIX) && pathWithoutLocale !== ADMIN_SIGNIN) {
    
    if (cfg.provider === "supabase") {
      return supabaseGuard(req, intlResponse);
    } else if (cfg.provider === "next-auth") {
      return nextAuthGuard(req, intlResponse);
    } else if (cfg.provider === "both") {
      // Check NextAuth first; if it redirects, fallback to Supabase guard
      const nextAuthRes = await nextAuthGuard(req, intlResponse);
      const isRedirect =
        nextAuthRes.redirected || (nextAuthRes.status >= 300 && nextAuthRes.status < 400);
      if (!isRedirect) {
        return nextAuthRes;
      }
      // NextAuth denied or failed — try Supabase
      return supabaseGuard(req, intlResponse);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};