import { redirect } from "next/navigation";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

export const dynamic = "force-dynamic";

export default async function LegacyNewCharacterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  redirect(withLocale(locale, "/characters/character-builder/new"));
}
