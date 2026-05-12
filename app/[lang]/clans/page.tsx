import { ClansBookDynamic } from "@/app/[lang]/clans/ClansBookDynamic";
import { clanEmblemSrc } from "@/app/[lang]/clans/clanEmblemSrc";
import type { ClanBookRow } from "@/app/[lang]/clans/ClansBook";
import { getAllClans, getCodexDisciplineMap } from "@/db/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";

export default async function ClansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const d = await getDictionary(locale);
  const clanList = [...(await getAllClans(locale))].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const disciplineKeys = [...new Set(clanList.flatMap((c) => c.disciplines))];
  const discMap = await getCodexDisciplineMap(locale, disciplineKeys);

  const dto: ClanBookRow[] = clanList.map((c) => ({
    id: c.id,
    name: c.name,
    emblemSrc: clanEmblemSrc(c.name),
    subName: c.subName,
    nickname: c.nickname,
    isBloodline: Boolean(c.isBloodline),
    weakness: c.weakness ?? "",
    description: c.description,
    disciplines: c.disciplines.map((key) => {
      const row = discMap.get(key);
      return {
        key,
        displayName: row?.displayName ?? key,
        description: row?.description ?? null,
      };
    }),
  }));

  return (
    <div className="mx-auto w-full max-w-[min(100%,100vw)] px-2 py-4 sm:px-4 sm:py-6">
      <ClansBookDynamic copy={d.clansPage} nav={d.nav} locale={locale} clans={dto} />
    </div>
  );
}
