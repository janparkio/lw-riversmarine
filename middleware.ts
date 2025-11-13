import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  getLocaleFromPath,
  isLocale,
  withLocalePath,
} from "./i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

const isBlockedPath = (pathname: string) => {
  const blocked = ["/pages", "/posts"];
  return blocked.some(
    (segment) =>
      pathname === segment || pathname.startsWith(`${segment}/`)
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname);

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);
  const pathnameWithoutLocale = localeFromPath
    ? pathname.replace(`/${localeFromPath}`, "") || "/"
    : pathname;

  if (process.env.NODE_ENV === "development" && isBlockedPath(pathnameWithoutLocale)) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  if (!localeFromPath) {
    const redirectUrl = new URL(request.url);
    redirectUrl.pathname = withLocalePath(defaultLocale, pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl, 301);
    redirectResponse.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
    });
    return redirectResponse;
  }

  const response = NextResponse.next();

  if (isLocale(localeFromPath) && response.cookies) {
    response.cookies.set("NEXT_LOCALE", localeFromPath, {
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
