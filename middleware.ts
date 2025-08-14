// -------------------------------------------------------
// Unified middleware that supports *either* Supabase Auth
// *or* NextAuth (or both) while keeping locale handling
// -------------------------------------------------------

import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest, NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import { updateSession as supabaseUpdate } from "@/lib/auth/supabase/middleware";

const intl = createIntlMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const ADMIN_SIGNIN = "/admin/auth/signin";

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
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        },
      },
    }
  ).auth.getUser();

  // Check admin flag in user metadata
  const isAdmin = user?.user_metadata?.isAdmin === true || user?.user_metadata?.role === 'admin';
  if (!isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/auth/signin";
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return baseRes;
}

/* ──────────────────────────────────── Main middleware ─────────────────────────────────── */

export default async function middleware(req: NextRequest) {
  const cfg = getAuthConfig();
  const originalPathname = req.nextUrl.pathname;

  const intlResponse = await intl(req as any);

  const segments = originalPathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = routing.locales.includes(maybeLocale as any);
  const pathWithoutLocale = hasLocale ? `/${segments.slice(1).join("/")}` : originalPathname;

  // Only redirect admins away from /client/* without DB calls.
  if (pathWithoutLocale.startsWith("/client/")) {
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
              cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            },
          },
        }
      ).auth.getUser();

      const isAdmin = user?.user_metadata?.isAdmin === true || user?.user_metadata?.role === 'admin';
      if (isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    } else if (cfg.provider === "both") {
      // For 'both' provider, skip NextAuth check in Edge Runtime, only check Supabase

      // Fallback to Supabase check
      const { createServerClient } = await import('@supabase/ssr');
      const { data: { user } } = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return req.cookies.getAll(); },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            },
          },
        }
      ).auth.getUser();

      const isAdmin = user?.user_metadata?.isAdmin === true || user?.user_metadata?.role === 'admin';
      if (isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }
    return intlResponse;
  }
  
  if (pathWithoutLocale.startsWith(ADMIN_PREFIX) && pathWithoutLocale !== ADMIN_SIGNIN) {
    if (cfg.provider === "supabase") {
      return supabaseGuard(req, intlResponse);
    } else if (cfg.provider === "next-auth") {
      // Skip NextAuth guard in Edge Runtime to avoid Node.js modules
      // Admin access will be handled by client-side logic
      return intlResponse;
    } else if (cfg.provider === "both") {
      // For 'both' provider, only use Supabase guard in Edge Runtime
      return supabaseGuard(req, intlResponse);
    }
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};