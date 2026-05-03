import { z } from "zod";

export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const localeParamSchema = z.enum(LOCALES);

export function isLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

export function parseLocaleParam(lang: string): Locale {
  const r = localeParamSchema.safeParse(lang);
  return r.success ? r.data : DEFAULT_LOCALE;
}
