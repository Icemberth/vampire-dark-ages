import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { MAX_CHARACTERS_PER_USER } from "@/lib/character";
import { createDraftCharacter, getCharactersForUser } from "@/db/queries";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

export const dynamic = "force-dynamic";

export default async function CharacterBuilderNewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(withLocale(locale, "/characters"));
  }
  const existing = await getCharactersForUser(session.user.id);
  if (existing.length >= MAX_CHARACTERS_PER_USER) {
    redirect(withLocale(locale, "/characters"));
  }
  const id = await createDraftCharacter(session.user.id, locale);
  redirect(withLocale(locale, `/characters/character-builder/${id}`));
}
