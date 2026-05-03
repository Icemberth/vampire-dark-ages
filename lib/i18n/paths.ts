import type { Locale } from "./locale";

/** Prefix a path with `/[locale]` (path must start with `/`). */
export function withLocale(locale: Locale, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return `/${locale}`;
  return `/${locale}${p}`;
}
