"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import type { ClanBookRow } from "./clanBookTypes";
import { LeftPagePapyrus } from "./LeftPagePapyrus";
import { CLAN_BOOK_PAGE_STYLE, RightPagePapyrus } from "./RightPagePapyrus";

export type { ClanBookRow } from "./clanBookTypes";

type Props = {
  copy: Dictionary["clansPage"];
  nav: Pick<Dictionary["nav"], "disciplines" | "characters">;
  locale: Locale;
  clans: ClanBookRow[];
};

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
        style={CLAN_BOOK_PAGE_STYLE}
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
      <div className="w-full overflow-hidden px-3 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <HTMLFlipBook
          key={flipBookKey}
          className="mx-auto max-w-full shadow-[0_24px_48px_rgba(0,0,0,0.55)] [--st-shadow-op:0.45] [&_.stf__wrapper]:outline-none"
          style={{}}
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
              <LeftPagePapyrus
                clan={c}
                copy={copy}
                lineageIndex={index}
                lineageTotal={clans.length}
              />
            </div>,

            <div key={`${c.id}-r`} className="h-full">
              <RightPagePapyrus clanName={c.name} />
            </div>,
          ])}

          <div
            data-density="hard"
            className="flex h-full flex-col items-center justify-center gap-4 px-10 text-center text-[#251a12] shadow-inner"
            style={CLAN_BOOK_PAGE_STYLE}
          >
            <p className="font-serif text-lg font-semibold uppercase tracking-[0.22em] text-[#4a1419] sm:text-xl">
              {copy.bookBack}
            </p>
            <p className="max-w-[18rem] font-sans text-sm leading-snug text-[rgba(37,26,18,0.76)]">
              {copy.flipHint}
            </p>
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
