import { ClanCarousel } from "@/app/components/ClanCarousel";
import { getAllClans } from "@/db/queries";
import { localeParamSchema } from "@/lib/i18n/locale";

export default async function ClansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const allClans = await getAllClans(locale);

  return <ClanCarousel clans={allClans} />;
}
