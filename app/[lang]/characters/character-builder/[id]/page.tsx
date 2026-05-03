import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { CharacterWizard } from "@/app/[lang]/characters/character-builder/CharacterWizard";
import { getAllClans, getCharacterByIdForUser } from "@/db/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

export default async function CharacterBuilderIdPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const locale = localeParamSchema.parse(lang);
  if (!isUuid(id)) {
    notFound();
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }
  const character = await getCharacterByIdForUser(id, session.user.id);
  if (!character) {
    notFound();
  }
  const clans = [...(await getAllClans(locale))].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const d = await getDictionary(locale);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col py-6 sm:py-8">
      <CharacterWizard
        character={character}
        clans={clans}
        locale={locale}
        wizardCopy={d.wizard}
      />
    </div>
  );
}
