import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const authPages = ["/dashboard"];

const intlMiddleware = createMiddleware(routing);

const { auth } = NextAuth(authConfig);

const authMiddleware = auth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  (req) => intlMiddleware(req)
);

export default function middleware(req: NextRequest) {
  const authPathnameRegex = RegExp(
    `^(/(${routing.locales.join("|")}))?(${authPages
      .flatMap((p) => (p === "/" ? ["", "/"] : p))
      .join("|")})/?$`,
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
