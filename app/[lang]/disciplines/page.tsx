import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

export default async function DisciplinesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const d = await getDictionary(locale);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold tracking-wide text-[#c82434] sm:text-4xl">
        {d.disciplinesPage.title}
      </h1>
      <p className="mt-4 text-sm text-zinc-400 sm:text-base">
        {d.disciplinesPage.body}
      </p>
      <p className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link
          href={withLocale(locale, "/clans")}
          className="font-medium text-[#c82434] hover:underline"
        >
          {d.nav.clans}
        </Link>
        <Link
          href={withLocale(locale, "/characters")}
          className="font-medium text-zinc-400 hover:text-zinc-200"
        >
          {d.nav.characters}
        </Link>
        <Link
          href={withLocale(locale, "/")}
          className="font-medium text-zinc-400 hover:text-zinc-200"
        >
          {d.brand}
        </Link>
      </p>
    </div>
  );
}
