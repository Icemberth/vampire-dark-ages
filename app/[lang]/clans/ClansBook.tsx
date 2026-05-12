"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState, useSyncExternalStore } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import {
  normalizeClanAssetKey,
  resolveClanPanelArtUrl,
} from "@/lib/clanAssetKey";

export type ClanBookRow = {
  id: string;
  name: string;
  emblemSrc: string;
  subName: string | null;
  nickname: string | null;
  isBloodline: boolean;
  weakness: string;
  description: string | null;
  disciplines: {
    key: string;
    displayName: string;
    description: string | null;
  }[];
};

type Props = {
  copy: Dictionary["clansPage"];
  nav: Pick<Dictionary["nav"], "disciplines" | "characters">;
  locale: Locale;
  clans: ClanBookRow[];
};

/** Papyrus texture for spreads (toolbar, backs, empty state, portrait wash). */
const PAGE_STYLE = {
  backgroundColor: "#d8c4a4",
  backgroundImage: "url(/img/papyrus.png)",
  backgroundSize: "cover",
  backgroundPosition: "44% 50%",
  backgroundRepeat: "no-repeat",
} satisfies CSSProperties;

function LeftPagePapyrus({ children }: { children: React.ReactNode }) {
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
        {/* StPageFlip uses 3D transforms; CSS background-image on the page root often fails to paint — use a real layer. */}
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
          {children}
        </div>
      </div>
    </div>
  );
}

function ClanPanelArtBg({ clanName }: { clanName: string }) {
  const src = useMemo(() => resolveClanPanelArtUrl(normalizeClanAssetKey(clanName)), [clanName]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- programmatic probe */}
      <img
        src={src}
        alt=""
        role="presentation"
        decoding="async"
        className="h-full w-full object-cover object-right"
      />
    </>
  );
}

function ClanEmblemImg({ emblemSrc }: { emblemSrc: string }) {
  const [broken, setBroken] = useState(false);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="h-auto w-[clamp(4.25rem,10vw,5.75rem)] object-contain drop-shadow-sm"
        alt=""
        role="presentation"
        decoding="async"
        loading="lazy"
        src={broken ? "/icons/clans/darkAges.svg" : emblemSrc}
        onError={() => setBroken(true)}
      />
    </>
  );
}

const bookDimsCache = { current: { w: 360, h: 520 } };

function readBookDimsSnapshot(): { w: number; h: number } {
  if (typeof window === "undefined") return bookDimsCache.current;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const horizSlack = 24;
  const maxSpread = Math.max(320, vw - horizSlack);
  const pageW = Math.min(640, Math.max(280, Math.floor(maxSpread / 2) - 10));
  const pageH = Math.round(pageW * 1.36);
  const nextH = Math.min(pageH, Math.max(420, Math.floor(vh * 0.86)));
  if (bookDimsCache.current.w !== pageW || bookDimsCache.current.h !== nextH) {
    bookDimsCache.current = { w: pageW, h: nextH };
  }
  return bookDimsCache.current;
}

function subscribeBookDims(onStoreChange: () => void): () => void {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function useBookDims() {
  return useSyncExternalStore(
    subscribeBookDims,
    readBookDimsSnapshot,
    () => ({ w: 360, h: 520 }),
  );
}

export function ClansBook({ copy, nav, locale, clans }: Props) {
  const dims = useBookDims();

  const flipBookKey = `${dims.w}x${dims.h}`;

  const flipProps = useMemo(
    () => ({
      startPage: 0,
      size: "stretch" as const,
      width: dims.w,
      height: dims.h,
      minWidth: 280,
      maxWidth: 680,
      minHeight: 400,
      maxHeight: 980,
      drawShadow: true,
      flippingTime: 650,
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0.62,
      showCover: true,
      mobileScrollSupport: true,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 30,
      showPageCorners: true,
      disableFlipByClick: false,
    }),
    [dims.w, dims.h],
  );

  if (!clans.length) {
    return (
      <div
        className="mx-auto max-w-xl rounded-sm p-10 text-[#341f14] shadow-xl"
        style={PAGE_STYLE}
      >
        <p className="text-center font-sans text-[0.98rem]">{copy.empty}</p>
        <nav className="mt-8 flex justify-center gap-6 font-sans text-sm font-semibold uppercase tracking-wide text-[#541018] underline decoration-[rgba(92,36,40,0.45)] underline-offset-[3px]">
          <Link href={withLocale(locale, "/disciplines")}>{nav.disciplines}</Link>
          <Link href={withLocale(locale, "/characters")}>{nav.characters}</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      {/* Padding gives 3D-flipped pages + drop-shadow room so we can clip without scrollbars. */}
      <div className="w-full overflow-hidden px-3 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        {/* react-pageflip’s published typings expect all `IFlipSetting` keys via intersection; runtime matches this object. */}
        <HTMLFlipBook
          key={flipBookKey}
          className="mx-auto max-w-full [--st-shadow-op:0.45] [&_.stf__wrapper]:outline-none"
          style={{ filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.55))" }}
          {...flipProps}
        >
          <div data-density="hard" className="h-full overflow-hidden bg-[#0f0b0c]">
            {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed cover asset */}
            <img
              src="/img/cover.png"
              alt=""
              aria-label={copy.coverAria}
              className="pointer-events-none h-full w-full object-cover"
              draggable={false}
            />
          </div>

          {clans.flatMap((c, index) => [
            <div key={`${c.id}-l`} className="h-full">
              <LeftPagePapyrus>
                <div className="flex min-h-full w-full flex-col gap-3">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.28em] text-[rgba(37,26,18,0.45)]">
                  {copy.lineageBadge
                    .replace("{n}", String(index + 1))
                    .replace("{total}", String(clans.length))}
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="shrink-0">
                    <ClanEmblemImg emblemSrc={c.emblemSrc} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl font-bold uppercase tracking-[0.1em] sm:text-[1.35rem]">
                        {c.name}
                      </h2>
                      {c.isBloodline ? (
                        <span className="rounded-md bg-[rgba(107,31,40,0.15)] px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-[#4e1018] ring-1 ring-[rgba(80,26,34,0.28)]">
                          {copy.bloodline}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-sans text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[rgba(37,26,18,0.85)]">
                      {[c.subName, c.nickname].filter(Boolean).join(" · ") ||
                        copy.defaultTagline}
                    </p>
                    <div className="my-3 flex items-center gap-2">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(62,44,32,0.35)] to-transparent" />
                      <span className="text-[10px] text-[rgba(62,44,32,0.55)]">❖</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(62,44,32,0.35)] to-transparent" />
                    </div>

                    <div className="space-y-5 font-serif text-[0.9rem] leading-relaxed md:text-[0.93rem]">
                      {c.description ? (
                        <section>
                          <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                            <span aria-hidden>❖</span>
                            {copy.record}
                          </h3>
                          <p className="font-sans whitespace-pre-wrap">{c.description}</p>
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
                          {c.weakness?.trim() ? c.weakness : "—"}
                        </p>
                      </section>

                      {c.nickname ? (
                        <section>
                          <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                            <span aria-hidden>❖</span>
                            {copy.motto}
                          </h3>
                          <blockquote className="font-sans italic">“{c.nickname}”</blockquote>
                        </section>
                      ) : null}

                      <section>
                        <h3 className="mb-1 flex gap-2 font-sans text-[0.72rem] font-bold uppercase tracking-[0.13em] text-[rgba(37,26,18,0.88)]">
                          <span aria-hidden>❖</span>
                          {copy.disciplines}
                        </h3>
                        <ul className="space-y-2.5">
                          {(c.disciplines?.length ? c.disciplines : []).map((d) => (
                            <li
                              key={d.key}
                              className="grid grid-cols-[auto,minmax(0,1fr)] gap-2.5 font-sans text-[0.82rem]"
                            >
                              <span
                                className="mt-1 size-8 shrink-0 rounded-md opacity-95 ring-1 ring-[rgba(62,44,32,0.22)]"
                                style={{
                                  backgroundColor:
                                    "color-mix(in srgb, var(--vda-blood, #a83232) 85%, transparent)",
                                }}
                                aria-hidden
                              />
                              <div className="min-w-0">
                                <p className="font-serif text-[0.72rem] font-bold uppercase tracking-[0.09em]">
                                  {d.displayName}
                                </p>
                                {d.description ? (
                                  <p className="mt-0.5 text-[rgba(37,26,18,0.88)]">{d.description}</p>
                                ) : (
                                  <p className="mt-0.5 text-[rgba(37,26,18,0.62)] italic">
                                    {copy.disciplineNoLore}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                          {!c.disciplines?.length ? (
                            <li className="italic text-[rgba(37,26,18,0.68)]">{copy.noDisciplines}</li>
                          ) : null}
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
                </div>
              </LeftPagePapyrus>
            </div>,

            <div
              key={`${c.id}-r`}
              className="relative box-border h-full overflow-hidden text-[#251a12]"
              style={PAGE_STYLE}
            >
              <div className="absolute inset-0 z-30 opacity-90 mix-blend-multiply" style={PAGE_STYLE} />
              <div className="relative z-20 h-full w-full mix-blend-multiply brightness-[0.97] saturate-[1.02]">
                <ClanPanelArtBg clanName={c.name} />
              </div>
            </div>,
          ])}

          <div
            data-density="hard"
            className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center text-[#251a12] shadow-inner"
            style={PAGE_STYLE}
          >
            <p className="font-serif text-lg font-semibold uppercase tracking-[0.22em] text-[#4a1419] sm:text-xl">
              {copy.bookBack}
            </p>
            <p className="max-w-[18rem] font-sans text-sm leading-snug text-[rgba(37,26,18,0.76)]">{copy.flipHint}</p>
            <nav className="flex flex-wrap justify-center gap-4 pt-4 font-sans text-xs font-bold uppercase tracking-wider underline decoration-[rgba(92,36,40,0.4)] underline-offset-[3px]">
              <Link href={withLocale(locale, "/disciplines")}>{nav.disciplines}</Link>
              <Link href={withLocale(locale, "/characters")}>{nav.characters}</Link>
            </nav>
          </div>
        </HTMLFlipBook>
      </div>
    </div>
  );
}
