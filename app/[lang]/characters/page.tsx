import Image from "next/image";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/auth";
import { CharacterCardMenu } from "@/app/[lang]/characters/CharacterCardMenu";
import { MAX_CHARACTERS_PER_USER } from "@/lib/character";
import { getCharactersForUser } from "@/db/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

function normalizeClanIconKey(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export default async function CharactersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = localeParamSchema.parse(lang);
  const d = await getDictionary(locale);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="text-zinc-300">{d.characters.signInPrompt}</p>
        <Link
          href={withLocale(locale, "/")}
          className="mt-4 text-sm font-semibold text-[#c82434] hover:underline"
        >
          {d.characters.backHome}
        </Link>
      </div>
    );
  }

  const list = await getCharactersForUser(session.user.id);
  const canCreateCharacter = list.length < MAX_CHARACTERS_PER_USER;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col py-8 sm:py-10">
      <header className="mb-8 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 text-left">
          <h1 className="text-3xl font-bold tracking-wide text-[#c82434] sm:text-4xl">
            {d.characters.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {d.characters.slots
              .replace("{used}", String(list.length))
              .replace("{max}", String(MAX_CHARACTERS_PER_USER))}
          </p>
        </div>
        {canCreateCharacter ? (
          <Link
            href={withLocale(locale, "/characters/character-builder/new")}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-lg border border-black/25 px-5 py-3.5 text-base font-normal uppercase tracking-wide text-white [font-family:var(--font-heading),serif] shadow-md transition hover:brightness-110 active:brightness-95 sm:w-auto"
            style={{
              backgroundColor: "#c4171d",
              backgroundImage: "url(/icons/vtm-button-distress.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "multiply",
            }}
          >
            {d.characters.create}
          </Link>
        ) : (
          <span
            className="inline-flex w-full shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-black/25 px-5 py-3.5 text-base font-normal uppercase tracking-wide text-white [font-family:var(--font-heading),serif] shadow-md [text-shadow:0_1px_2px_rgba(0,0,0,0.45)] blur-[3px] backdrop-blur-sm motion-reduce:blur-none motion-reduce:backdrop-blur-none sm:w-auto"
            style={{
              /* Matches `.vda-wizard-cta--cancel` (#c4171d59) + same distress as primary CTA */
              backgroundColor: "#c4171d59",
              backgroundImage: "url(/icons/vtm-button-distress.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "multiply",
            }}
            title={d.characters.createDisabledHint}
          >
            {d.characters.create}
          </span>
        )}
      </header>

      <div className="characters-list-frame box-border flex min-h-0 flex-1 flex-col overflow-visible rounded-xl bg-black/30 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
        <div className="characters-list-frame-body flex min-h-0 flex-1 flex-col">
          {list.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-6 text-center text-base text-zinc-300 sm:py-8 sm:text-lg">
              {d.characters.empty}
            </p>
          ) : (
            <ul className="flex min-h-0 flex-1 flex-wrap content-start justify-start gap-4">
              {list.map((c) =>
                (() => {
                  const clanKey = c.clanName
                    ? normalizeClanIconKey(c.clanName)
                    : null;
                  const clanIconBg = clanKey
                    ? `url(/icons/clans/${clanKey}.svg), url(/icons/clans/darkAges.svg)`
                    : "url(/icons/clans/darkAges.svg)";

                  return (
                    <li
                      key={c.id}
                      className="group relative z-2 w-full max-w-md shrink-0 cursor-pointer overflow-visible rounded-xl border border-zinc-800/70 shadow-lg transition-transform duration-200 hover:-translate-y-px hover:border-zinc-700/80"
                    >
                      <div
                        aria-hidden
                        className="absolute inset-0 origin-center overflow-hidden rounded-xl bg-cover bg-center will-change-transform group-hover:animate-[vda-heartbeat_1.9s_ease-in-out_infinite] motion-reduce:group-hover:animate-none"
                        style={{
                          backgroundImage: "url(/icons/vtm-marble-red.jpg)",
                        }}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-1 rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-25"
                        style={{
                          backgroundImage: clanIconBg,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                          backgroundSize: "30%",
                          transform: "translateX(10px) scale(0.98)",
                        }}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-2 rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px color-mix(in srgb, var(--vda-blood) 22%, transparent)",
                        }}
                      />
                      <div className="relative z-10 p-4">
                        <div className="flex items-start gap-4">
                          <div
                            aria-hidden
                            className="relative mt-0.5 h-12 w-12 shrink-0 drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                          >
                            <div
                              className="absolute inset-[12%] z-0 rounded-full bg-black/20 opacity-100 transition-all duration-200 group-hover:opacity-0 motion-reduce:transition-none"
                              style={{
                                backgroundImage: "url(/icons/avatar.png)",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "top",
                                backgroundSize: "169% 190%",
                                top: "-10px",
                              }}
                            />
                            <div
                              className="absolute inset-[12%] z-0 rounded-full bg-black/20 opacity-0 transition-all duration-200 group-hover:translate-y-[-2px] group-hover:scale-[1.06] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100"
                              style={{
                                backgroundImage:
                                  "url(/icons/avataroutofframe.png)",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "top",
                                backgroundSize: "169% 190%",
                                top: "-10px",
                                zIndex: 999,
                              }}
                            />
                            <Image
                              src="/icons/vtm-portrait.png"
                              alt=""
                              fill
                              unoptimized
                              className="pointer-events-none z-10 object-contain"
                              sizes="48px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold text-zinc-100 drop-shadow-sm">
                              {c.name}
                            </h2>
                            {c.clanName != null || c.generation != null ? (
                              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm text-[#c82434] drop-shadow-sm">
                                {c.clanName ? <span>{c.clanName}</span> : null}
                                {c.generation != null ? (
                                  <span className="text-xs text-zinc-400">
                                    Gen {c.generation}
                                  </span>
                                ) : null}
                              </p>
                            ) : null}
                            {c.concept ? (
                              <p className="mt-2 line-clamp-2 text-sm text-zinc-300">
                                {c.concept}
                              </p>
                            ) : null}
                          </div>
                          <CharacterCardMenu
                            locale={locale}
                            characterId={c.id}
                            copy={d.characterCard}
                          />
                        </div>
                        {(c.nature || c.demeanor) && (
                          <p className="mt-3 text-xs text-zinc-400">
                            {c.nature && <span>Nature: {c.nature}</span>}
                            {c.nature && c.demeanor ? " · " : null}
                            {c.demeanor && <span>Demeanor: {c.demeanor}</span>}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })(),
              )}
            </ul>
          )}
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner left-[-11px] top-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-tl.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-top-left"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner right-[-11px] top-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-tr.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-top-right"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner bottom-[-11px] left-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-bl.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-bottom-left"
              sizes="96px"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="characters-list-frame-corner bottom-[-11px] right-[-11px]"
        >
          <div className="relative h-full w-full">
            <Image
              src="/icons/vtm-corner-br.png"
              alt=""
              fill
              unoptimized
              className="object-contain object-bottom-right"
              sizes="96px"
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center">
        <Link
          href={withLocale(locale, "/clans")}
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
        >
          {d.characters.browseClans}
        </Link>
      </p>
    </div>
  );
}
