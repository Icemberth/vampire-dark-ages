"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { disciplineIconCandidates } from "@/lib/disciplineIconSrc";
import type { ClanBookRow, ClanCodexLeftCopy } from "./clanBookTypes";

export type LeftPagePapyrusProps = {
  clan: ClanBookRow;
  copy: ClanCodexLeftCopy;
  lineageIndex: number;
  lineageTotal: number;
};

/** Clan ring asset is 1536×1024; pb aspect lock + background (avoids img compositing quirks in flip pages). */
function ClanEmblemFramed({ emblemSrc }: { emblemSrc: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="relative w-[clamp(4.85rem,12vw,7.25rem)] shrink-0">
      <div
        aria-hidden
        className="pointer-events-none block h-0 w-full bg-contain bg-center bg-no-repeat pb-[66.6667%] filter-[drop-shadow(0_0_0.75px_rgba(37,26,18,0.65))]"
        style={{ backgroundImage: "url(/icons/papyrus-top-clan-decorator.png)" }}
      />
      <div className="absolute inset-0 z-10 flex translate-y-[-4%] items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="max-h-[58%] max-w-[58%] object-contain drop-shadow-sm"
          alt=""
          role="presentation"
          decoding="async"
          loading="lazy"
          src={broken ? "/icons/clans/darkAges.svg" : emblemSrc}
          onError={() => setBroken(true)}
        />
      </div>
    </div>
  );
}

function DisciplineIcon({ disciplineKey }: { disciplineKey: string }) {
  const candidates = useMemo(
    () => disciplineIconCandidates(disciplineKey),
    [disciplineKey],
  );
  const [i, setI] = useState(0);

  if (i >= candidates.length) {
    return (
      <span
        className="mt-1 size-8 shrink-0 rounded-md opacity-95 ring-1 ring-[rgba(62,44,32,0.22)]"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--vda-blood, #a83232) 85%, transparent)",
        }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- public discipline / fallback chain
    <img
      src={candidates[i]}
      alt=""
      role="presentation"
      decoding="async"
      className="mt-1 size-8 shrink-0 rounded-md object-contain opacity-95 ring-1 ring-[rgba(62,44,32,0.22)]"
      onError={() =>
        setI((x) => (x + 1 < candidates.length ? x + 1 : candidates.length))
      }
    />
  );
}

/** Left codex spread: scrollable parchment, texture, and clan codex copy. */
export function LeftPagePapyrus({
  clan,
  copy,
  lineageIndex,
  lineageTotal,
}: LeftPagePapyrusProps) {
  const lineageLabel = copy.lineageBadge
    .replace("{n}", String(lineageIndex + 1))
    .replace("{total}", String(lineageTotal));

  const tagline =
    [clan.subName, clan.nickname].filter(Boolean).join(" · ") ||
    copy.defaultTagline;

  return (
    <div
      className="h-full overflow-y-auto"
      style={
        {
          scrollbarColor: "#daaf6c #00000059",
          scrollbarWidth: "thin",
          overflow: "hidden auto",
        } as unknown as CSSProperties
      }
    >
      <div className="relative min-h-full w-full bg-[#d8c4a4]">
        {/* eslint-disable-next-line @next/next/no-img-element -- texture fill for flip page */}
        <img
          src="/img/papyrus.png"
          alt=""
          role="presentation"
          decoding="async"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full min-h-full w-full object-cover object-[38%_center]"
        />
        <div className="relative z-10 px-4 py-5 text-[#251a12] [&_blockquote]:text-[#2a1f15] [&_h2]:text-[#251a12] [&_h3]:text-[rgba(37,26,18,0.9)] [&_li]:text-[#2a1f15] [&_p]:text-[#2a1f15]">
          <div className="flex min-h-full w-full flex-col gap-3">
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-[rgba(37,26,18,0.45)]">
              {lineageLabel}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="shrink-0">
                <ClanEmblemFramed emblemSrc={clan.emblemSrc} />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="-mx-4 mb-0.5 flex h-[clamp(2.25rem,5.2vw,3.35rem)] w-[calc(100%+2rem)] shrink-0 justify-center overflow-hidden sm:h-[clamp(2.5rem,4.8vw,3.5rem)]"
                  aria-hidden
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- wide decorative PNG; crop vertical letterboxing */}
                  <img
                    src="/icons/papyrus-top-decorator.png"
                    alt=""
                    role="presentation"
                    decoding="async"
                    draggable={false}
                    className="pointer-events-none h-full w-full object-cover object-center select-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl font-bold uppercase tracking-[0.1em] sm:text-[1.35rem]">
                    {clan.name}
                  </h2>
                  {clan.isBloodline ? (
                    <span className="rounded-md bg-[rgba(107,31,40,0.15)] px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-[#4e1018] ring-1 ring-[rgba(80,26,34,0.28)]">
                      {copy.bloodline}
                    </span>
                  ) : null}
                </div>
                <p className="font-sans text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[rgba(37,26,18,0.85)]">
                  {tagline}
                </p>
                <div className="my-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(62,44,32,0.35)] to-transparent" />
                  <span className="text-[10px] text-[rgba(62,44,32,0.55)]">
                    ❖
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(62,44,32,0.35)] to-transparent" />
                </div>

                <div className="space-y-5 font-serif text-[0.9rem] leading-relaxed md:text-[0.93rem]">
                  {clan.description ? (
                    <section>
                      <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                        <span aria-hidden>❖</span>
                        {copy.record}
                      </h3>
                      <p className="font-sans whitespace-pre-wrap">
                        {clan.description}
                      </p>
                    </section>
                  ) : (
                    <p className="font-sans text-[rgba(37,26,18,0.78)] italic">
                      {copy.recordFallback}
                    </p>
                  )}

                  <section>
                    <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                      <span aria-hidden>❖</span>
                      {copy.weakness}
                    </h3>
                    <p className="font-sans whitespace-pre-wrap">
                      {clan.weakness?.trim() ? clan.weakness : "—"}
                    </p>
                  </section>

                  {clan.nickname ? (
                    <section>
                      <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                        <span aria-hidden>❖</span>
                        {copy.motto}
                      </h3>
                      <blockquote className="font-sans italic">
                        “{clan.nickname}”
                      </blockquote>
                    </section>
                  ) : null}

                  <section>
                    <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                      <span aria-hidden>❖</span>
                      {copy.disciplines}
                    </h3>
                    <ul className="space-y-2.5">
                      {(clan.disciplines?.length ? clan.disciplines : []).map(
                        (d) => (
                          <li
                            key={d.key}
                            className="grid grid-cols-[auto,minmax(0,1fr)] gap-2.5 font-sans text-[0.82rem]"
                          >
                            <DisciplineIcon disciplineKey={d.key} />
                            <div className="min-w-0">
                              <p className="font-serif text-[0.72rem] font-bold uppercase tracking-[0.09em]">
                                {d.displayName}
                              </p>
                              {d.description ? (
                                <p className="mt-0.5 text-[rgba(37,26,18,0.88)]">
                                  {d.description}
                                </p>
                              ) : (
                                <p className="mt-0.5 text-[rgba(37,26,18,0.62)] italic">
                                  {copy.disciplineNoLore}
                                </p>
                              )}
                            </div>
                          </li>
                        ),
                      )}
                      {!clan.disciplines?.length ? (
                        <li className="italic text-[rgba(37,26,18,0.68)]">
                          {copy.noDisciplines}
                        </li>
                      ) : null}
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
