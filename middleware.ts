import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { updateSession } from "@/lib/auth/supabase/middleware";
import { getAuthConfig } from "@/lib/auth/config";
import { analytics } from '@/lib/analytics';
import { getToken } from 'next-auth/jwt';

const PRIVATE_PATHS = ["/dashboard"];
const PUBLIC_PATHS = ["/auth/signin", "/auth/register"];

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);
const authMiddleware = auth(async (req) => {
  const response = await intlMiddleware(req as any);
  const url = new URL(response.headers.get("x-middleware-rewrite") || req.url);

  const locale = url.pathname.split("/")[1];
  const pathname = "/" + url.pathname.split("/").slice(2).join("/");

  const isAuthenticated = !!req.auth;
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (isPublicPage && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  if (!isAuthenticated && PRIVATE_PATHS.includes(pathname)) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(
        `/${locale}/auth/signin?callbackUrl=${encodeURIComponent(from)}`,
        req.url
      )
    );
  }

  return response;
});

export async function middleware(request: NextRequest) {
  // Handle analytics user identification first
  const token = await getToken({ req: request as any });
  if (token?.sub && token.email) {
    // Set user properties in analytics
    analytics.identify(token.sub, {
      email: token.email,
      name: token.name || undefined,
    });
  }

  // Handle authentication and internationalization
  const config = getAuthConfig();
  if (config.provider === "supabase") {
    const supabaseResponse = await updateSession(request);
    return intlMiddleware(supabaseResponse as any);
  } else if (config.provider === "next-auth") {
    const authPaths = PRIVATE_PATHS.flatMap((p) =>
      p === "/" ? ["", "/"] : p
    ).join("|");

    const authPathnameRegex = RegExp(
      `^(/(${routing.locales.join("|")}))?(${authPaths})/?$`,
      "i"
    );
    const isAuthPage = authPathnameRegex.test(request.nextUrl.pathname);

    if (isAuthPage) {
      return (authMiddleware as any)(request);
    }
  }
  
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};