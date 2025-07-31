// -------------------------------------------------------
// Unified middleware that supports *either* Supabase Auth
// *or* Next-Auth (or both) while keeping locale handling
// -------------------------------------------------------

import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest, NextResponse } from "next/server";

import { getAuthConfig } from "@/lib/auth/config";
import { updateSession as supabaseUpdate } from "@/lib/auth/supabase/middleware";

import { auth } from "@/lib/auth";

const intl = createIntlMiddleware(routing);

const ADMIN_PREFIX = "/admin";
const ADMIN_SIGNIN = "/admin/auth/signin";

/* ────────────────────────────────── NextAuth guard ────────────────────────────────── */

// Use the same auth instance as the main app
const nextAuthGuard: any = (auth as any)(
  async (req: any) => {
    if (req.auth?.user?.isAdmin) {
      // Return locale-aware response
      return intl(req as any);
    }
    return NextResponse.redirect(new URL(ADMIN_SIGNIN, req.url));
  },
  { callbacks: { authorized: () => true } },
);

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

  // 1️⃣ Locale rewrite – runs for every request
  const intlResponse = await intl(req as any);

  // Extract path without locale for admin checks
  const segments = originalPathname.split("/").filter(Boolean); // remove leading ''
  const maybeLocale = segments[0];
  const hasLocale = routing.locales.includes(maybeLocale as any);
  const pathWithoutLocale = hasLocale ? `/${segments.slice(1).join("/")}` : originalPathname;

  // 2️⃣ Admin protection
  if (pathWithoutLocale.startsWith(ADMIN_PREFIX) && pathWithoutLocale !== ADMIN_SIGNIN) {
    
    if (cfg.provider === "supabase" || cfg.provider === "both") {
      return supabaseGuard(req, intlResponse);
    }
    if (cfg.provider === "next-auth" || cfg.provider === "both") {
      // Delegate to NextAuth guard (returns Response)
      return nextAuthGuard(req, {} as any);
    }
  }

  // 3️⃣ No special auth needed – return locale-handled response
  return intlResponse;
}

// Run on every non-static, non-api path
export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};