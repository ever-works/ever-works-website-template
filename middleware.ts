import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const PRIVATE_PATHS = ["/dashboard"];
const PUBLIC_PATHS = ["/auth/signin", "/auth/register"];

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

const authMiddleware = auth(async (req) => {
  const response = await intlMiddleware(req);
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

export default function middleware(req: NextRequest) {
  const authPaths = PRIVATE_PATHS.flatMap((p) =>
    p === "/" ? ["", "/"] : p
  ).join("|");

  const authPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${authPaths})/?$`,
    "i"
  );
  const isAuthPage = authPathnameRegex.test(req.nextUrl.pathname);

  if (isAuthPage) {
    return (authMiddleware as any)(req);
  } else {
    return intlMiddleware(req);
  }
}
export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
