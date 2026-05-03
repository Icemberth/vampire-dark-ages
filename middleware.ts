import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  type Locale,
  localeParamSchema,
} from "@/lib/i18n/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  const parsedLocale = localeParamSchema.safeParse(segments[0]);
  if (!parsedLocale.success) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}/${segments.join("/")}`;
    return NextResponse.redirect(url);
  }

  const locale: Locale = parsedLocale.data;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-next-locale", locale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
