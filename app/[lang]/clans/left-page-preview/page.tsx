import { LeftPagePapyrus } from "@/app/[lang]/clans/LeftPagePapyrus";
import { clanEmblemSrc } from "@/app/[lang]/clans/clanEmblemSrc";
import type { ClanBookRow } from "@/app/[lang]/clans/clanBookTypes";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";

const MOCK_CLAN: ClanBookRow = {
  id: "preview-ahrimanes",
  name: "Ahrimanes",
  emblemSrc: clanEmblemSrc("Ahrimanes"),
  subName: "Shamanic Gangrel",
  nickname: "Cats",
  isBloodline: true,
  weakness: "Inability to Embrace",
  description:
    "An all-female bloodline that renounces their clan to bond with animal spirits.",
  disciplines: [
    {
      key: "animalism",
      displayName: "Animalism",
      description: "Mastery over the animal world and the Beast within.",
    },
    {
      key: "presence",
      displayName: "Presence",
      description: "Supernatural allure and emotional command.",
    },
    {
      key: "spiritus",
      displayName: "Spiritus",
      description: "Communion with spirits and the shadowed veil.",
    },
  ],
};

export default async function LeftPagePapyrusPreviewPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const d = await getDictionary(locale);

  return (
    <div className="min-h-svh bg-zinc-950 px-4 py-8 sm:px-8">
      <p className="mx-auto mb-4 max-w-md text-center font-sans text-xs text-zinc-500">
        Preview: <code className="text-zinc-400">LeftPagePapyrus</code> —{" "}
        <code className="text-zinc-400">/{locale}/clans/left-page-preview</code>
      </p>
      <div className="mx-auto h-[min(88svh,52rem)] max-w-[min(100%,28rem)] overflow-hidden rounded-sm border border-zinc-800 shadow-2xl">
        <LeftPagePapyrus
          clan={MOCK_CLAN}
          copy={d.clansPage}
          lineageIndex={0}
          lineageTotal={30}
        />
      </div>
    </div>
  );
}
