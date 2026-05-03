import type { Locale } from "./locale";

export type Dictionary = typeof import("@/i18n/en.json");

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/en.json").then((m) => m.default),
  es: () => import("@/i18n/es.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
