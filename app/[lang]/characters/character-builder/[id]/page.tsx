import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { CharacterWizard } from "@/app/[lang]/characters/character-builder/CharacterWizard";
import { getAllClans, getCharacterByIdForUser, getCodexArchetypes, getCodexCreationMeta } from "@/db/queries";
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
  const creationMeta = await getCodexCreationMeta(locale);
  const archetypes = await getCodexArchetypes(locale);

  const codexEntries = d.wizard.codexEntries;
  const mergedWizardCopy = {
    ...d.wizard,
    codexEntries: {
      ...codexEntries,
      name: creationMeta.character_name
        ? {
            title: creationMeta.character_name.displayName,
            body:
              creationMeta.character_name.longDescription ??
              creationMeta.character_name.description,
          }
        : codexEntries.name,
      concept: creationMeta.character_concept
        ? {
            title: creationMeta.character_concept.displayName,
            body:
              creationMeta.character_concept.longDescription ??
              creationMeta.character_concept.description,
          }
        : codexEntries.concept,
      nature: creationMeta.nature
        ? {
            title: creationMeta.nature.displayName,
            body: creationMeta.nature.longDescription ?? creationMeta.nature.description,
          }
        : codexEntries.nature,
      demeanor: creationMeta.demeanor
        ? {
            title: creationMeta.demeanor.displayName,
            body:
              creationMeta.demeanor.longDescription ?? creationMeta.demeanor.description,
          }
        : codexEntries.demeanor,
      findClan: creationMeta.clan
        ? {
            title: creationMeta.clan.displayName,
            body: creationMeta.clan.longDescription ?? creationMeta.clan.description,
          }
        : codexEntries.findClan,
    },
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col py-6 sm:py-8">
      <CharacterWizard
        character={character}
        clans={clans}
        archetypes={archetypes}
        locale={locale}
        wizardCopy={mergedWizardCopy}
      />
    </div>
  );
}
