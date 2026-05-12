"use client";

import * as React from "react";
import { clanEmblemSrc } from "@/app/[lang]/clans/clanEmblemSrc";
import { normalizeClanAssetKey } from "@/lib/clanAssetKey";

export type Clan = {
  id: string;
  name: string;
  subName: string | null;
  nickname: string | null;
  isBloodline: boolean | null;
  weakness: string | null;
  description: string | null;
  disciplines: string[];
};

type ClanCarouselMode = "page" | "embed";

export type ClanCarouselProps = {
  clans: Clan[];
  /** Default `page` is full-bleed (clans route). `embed` is for the character builder. */
  mode?: ClanCarouselMode;
  /** When in `embed` mode, syncs selection. Use `""` for “not chosen yet”. */
  selectedClanId?: string | null;
  /** When in `embed` mode, called when a clan is chosen (swipe, dots, or keys). */
  onClanIdChange?: (id: string) => void;
};

const DEFAULT_CLAN_ICON_SRC = "/icons/clans/darkAges.svg";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scrollIndexForEl(scroller: HTMLDivElement, slideCount: number) {
  const w = scroller.clientWidth;
  if (w <= 0) return 0;
  return clamp(
    Math.round(scroller.scrollLeft / w),
    0,
    Math.max(0, slideCount - 1),
  );
}

function scrollClanScrollerTo(
  scroller: HTMLDivElement | null,
  index: number,
  slideCount: number,
) {
  if (!scroller) return;
  const w = scroller.clientWidth;
  if (w <= 0) return;
  scroller.scrollTo({ left: clamp(index, 0, slideCount - 1) * w });
}

type EmblemSize = "embed" | "page";

function ClanCardContent({
  clan,
  isActive,
  isEmbed,
  emblemSize,
  getResolvedClanIconSrc,
  bloodRgb = "var(--vda-blood)",
}: {
  clan: Clan;
  isActive: boolean;
  isEmbed: boolean;
  emblemSize: EmblemSize;
  getResolvedClanIconSrc: (name: string) => string;
  bloodRgb?: string;
}) {
  const iconSrc = getResolvedClanIconSrc(clan.name);
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border bg-zinc-950",
        isActive ? "border-[#c82434]/70" : "border-zinc-800/80",
      ].join(" ")}
      style={{
        boxShadow: isActive
          ? "0 28px 80px color-mix(in srgb, var(--vda-blood) 25%, transparent), 0 14px 34px rgba(0,0,0,0.55)"
          : "0 18px 50px rgba(0,0,0,0.55)",
      }}
    >
      <div
        className={
          emblemSize === "embed"
            ? "pointer-events-none absolute -right-4 top-1/2 h-[115%] w-[62%] -translate-y-1/2 opacity-32 sm:-right-7 sm:h-[128%] sm:w-[70%] sm:opacity-36"
            : "pointer-events-none absolute -right-10 top-1/2 h-[140%] w-[78%] -translate-y-1/2 opacity-35 sm:opacity-40"
        }
        style={{
          backgroundColor: bloodRgb,
          WebkitMaskImage: `url(${iconSrc})`,
          maskImage: `url(${iconSrc})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "right center",
          maskPosition: "right center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.65),transparent_55%)]" />
      <div
        className={[
          "relative z-10",
          isEmbed ? "p-3.5 sm:p-5 md:p-6" : "p-5 sm:p-6",
        ].join(" ")}
      >
        <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-baseline gap-2">
                <h2
                  className={[
                    "min-w-0 max-w-full font-bold text-zinc-100",
                    isEmbed
                      ? "truncate text-lg sm:text-2xl"
                      : "truncate text-xl sm:text-2xl",
                  ].join(" ")}
                >
                  {clan.name}
                </h2>
                {clan.subName ? (
                  <span className="shrink-0 text-sm font-semibold text-[#c82434]">
                    ({clan.subName})
                  </span>
                ) : null}
              </div>
              {clan.nickname ? (
                <p className="truncate text-sm text-zinc-500 italic">
                  “{clan.nickname}”
                </p>
              ) : null}
            </div>
          </div>
          {clan.isBloodline ? (
            <span className="shrink-0 self-start rounded bg-[#c82434]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-[#c82434]">
              Bloodline
            </span>
          ) : null}
        </div>
        {clan.description ? (
          <p className="mb-5 line-clamp-4 text-sm leading-relaxed text-zinc-300/90">
            {clan.description}
          </p>
        ) : (
          <p className="mb-5 text-sm italic text-zinc-500">
            No description available.
          </p>
        )}
        <div className="grid min-w-0 gap-4">
          <div className="min-w-0">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              Disciplines
            </h3>
            <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
              {(clan.disciplines?.length ? clan.disciplines : ["—"]).map((d) => (
                <span
                  key={`${clan.id}:${d}`}
                  className="rounded border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-xs text-zinc-200"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-800/80 pt-4">
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#c82434]">
              Weakness
            </h3>
            <p className="text-xs italic leading-relaxed text-zinc-300/80">
              {clan.weakness || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClanCarousel({
  clans,
  mode = "page",
  selectedClanId = null,
  onClanIdChange,
}: ClanCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const userPickedClanRef = React.useRef(false);
  const clansRef = React.useRef(clans);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const programmaticScrollRef = React.useRef(false);
  const indexRef = React.useRef(0);
  const clearProgrammaticScrollAfterPaint = React.useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        programmaticScrollRef.current = false;
      });
    });
  }, []);
  const scrollRafRef = React.useRef<number | null>(null);
  const iconTestStartedRef = React.useRef<Set<string>>(new Set());
  const lastIconClansKeyRef = React.useRef<string>("");
  const [iconSrcByKey, setIconSrcByKey] = React.useState<
    Record<string, string>
  >({});

  const clampIndex = React.useCallback(
    (n: number) => {
      if (!clans.length) return 0;
      return Math.max(0, Math.min(clans.length - 1, n));
    },
    [clans.length],
  );

  const safeIndex = clans.length ? Math.min(index, clans.length - 1) : 0;
  const clansKey = clans.length ? clans.map((c) => c.id).join("|") : "";
  const isEmbed = mode === "embed";
  const bloodRgb = "var(--vda-blood)";

  React.useLayoutEffect(() => {
    clansRef.current = clans;
  }, [clans]);

  React.useLayoutEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Align `index` and scroll with `selectedClanId` in embed (e.g. edit character).
  React.useLayoutEffect(() => {
    const list = clansRef.current;
    if (mode !== "embed" || !list.length) return;
    if (selectedClanId == null || selectedClanId === "") return;
    const i = list.findIndex((c) => c.id === selectedClanId);
    if (i < 0) return;

    const apply = (el: HTMLDivElement) => {
      const w = el.clientWidth;
      if (w <= 0) return false;
      // Selection came from parent (form / search): do not treat scroll settle as user input.
      userPickedClanRef.current = false;
      programmaticScrollRef.current = true;
      setIndex((prev) => (prev === i ? prev : i));
      if (Math.abs(el.scrollLeft - i * w) > 0.5) {
        el.scrollTo({ left: i * w, behavior: "auto" });
      }
      clearProgrammaticScrollAfterPaint();
      return true;
    };

    const el = scrollerRef.current;
    if (!el) return;
    if (apply(el)) return;

    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        const el2 = scrollerRef.current;
        if (el2) apply(el2);
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [mode, clansKey, selectedClanId]);

  React.useEffect(() => {
    if (mode !== "embed" || !onClanIdChange || !clans[safeIndex]) return;
    if (!userPickedClanRef.current) return;
    const id = clans[safeIndex].id;
    if (id === selectedClanId) return;
    onClanIdChange(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clansKey replaces clans ref in deps
  }, [mode, onClanIdChange, clansKey, safeIndex, selectedClanId]);

  const markClanUser = React.useCallback(() => {
    userPickedClanRef.current = true;
  }, []);

  const onScrollerScroll = React.useCallback(() => {
    if (programmaticScrollRef.current) return;
    if (scrollRafRef.current != null) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = scrollerRef.current;
      if (!el) return;
      const i = scrollIndexForEl(el, clans.length);
      setIndex((prev) => {
        if (i === prev) return prev;
        if (!userPickedClanRef.current) {
          markClanUser();
        }
        return i;
      });
    });
  }, [clans.length, markClanUser]);

  React.useEffect(
    () => () => {
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const i = indexRef.current;
      programmaticScrollRef.current = true;
      scrollClanScrollerTo(el, i, clans.length);
      window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, 100);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [clans.length, clansKey]);

  React.useEffect(() => {
    if (clansKey !== lastIconClansKeyRef.current) {
      iconTestStartedRef.current.clear();
      lastIconClansKeyRef.current = clansKey;
    }
    const list = clansRef.current;
    if (!list.length) return;
    for (const c of list) {
      const key = normalizeClanAssetKey(c.name);
      if (!key || iconTestStartedRef.current.has(key)) continue;
      iconTestStartedRef.current.add(key);
      const candidateSrc = clanEmblemSrc(c.name);
      const img = new Image();
      img.onload = () => {
        setIconSrcByKey((prev) =>
          prev[key] ? prev : { ...prev, [key]: candidateSrc },
        );
      };
      img.onerror = () => {
        setIconSrcByKey((prev) =>
          prev[key] ? prev : { ...prev, [key]: DEFAULT_CLAN_ICON_SRC },
        );
      };
      img.src = candidateSrc;
    }
  }, [clansKey]);

  const getResolvedClanIconSrc = React.useCallback(
    (clanName: string) => {
      const key = normalizeClanAssetKey(clanName);
      return iconSrcByKey[key] ?? DEFAULT_CLAN_ICON_SRC;
    },
    [iconSrcByKey],
  );

  const goToSlide = React.useCallback(
    (i: number, markUser: boolean) => {
      if (markUser) {
        markClanUser();
      }
      const el = scrollerRef.current;
      if (!el) {
        setIndex(clampIndex(i));
        return;
      }
      const target = clampIndex(i);
      const w = el.clientWidth;
      if (w <= 0) {
        setIndex(target);
        return;
      }
      programmaticScrollRef.current = true;
      el.scrollTo({ left: target * w, behavior: "auto" });
      setIndex(target);
      clearProgrammaticScrollAfterPaint();
    },
    [clampIndex, markClanUser],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToSlide(safeIndex - 1, true);
      if (e.key === "ArrowRight") goToSlide(safeIndex + 1, true);
      if (e.key === "Home") goToSlide(0, true);
      if (e.key === "End") goToSlide(clans.length - 1, true);
    },
    [clans.length, goToSlide, safeIndex],
  );

  return (
    <div
      className={
        isEmbed
          ? "h-full w-full min-h-0 flex-1 text-zinc-100 overflow-x-hidden"
          : "h-svh text-zinc-100 overflow-x-hidden"
      }
      style={
        isEmbed
          ? undefined
          : {
              backgroundImage: "url(/icons/vda-background-img.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
      }
    >
      <div
        className={
          isEmbed
            ? "flex h-full min-h-0 w-full max-w-full flex-col px-0 py-0"
            : "flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 md:px-10"
        }
      >
        <header className={isEmbed ? "mb-2 sm:mb-3" : "mb-3 text-center sm:mb-5"}>
          {isEmbed ? (
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#c82434] [font-family:var(--font-heading),serif]">
                Clan
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Swipe or use the icons below. Your selection applies to this character.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="mb-2 text-3xl font-bold text-[#c82434] uppercase tracking-widest drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] sm:text-4xl">
                V20 Dark Ages Compendium
              </h1>
              <p className="text-zinc-300 italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Select your lineage. Swipe, or use the icons below, to browse.
              </p>
            </div>
          )}
        </header>

        <div
          className={
            isEmbed
              ? "relative min-h-0 flex-1 overflow-x-hidden overflow-y-visible"
              : "relative min-h-0 flex-1 overflow-hidden"
          }
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <div
              className={[
                "flex min-h-0 flex-1 flex-col",
                isEmbed ? "" : "max-h-full",
              ].join(" ")}
            >
              <div
                ref={scrollerRef}
                onScroll={onScrollerScroll}
                onKeyDown={onKeyDown}
                className={[
                  "w-full min-h-0 flex-1",
                  isEmbed
                    ? "min-h-60 sm:min-h-72 max-h-[min(70svh,34rem)]"
                    : "max-h-[min(46svh,420px)] sm:max-h-[min(50svh,460px)]",
                  "overflow-x-auto overflow-y-hidden overscroll-x-contain",
                  "snap-x snap-mandatory flex flex-nowrap",
                  "touch-pan-x cursor-grab active:cursor-grabbing",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                ].join(" ")}
                role="region"
                tabIndex={0}
                aria-label="Clan cards"
              >
                {clans.map((clan, i) => {
                  const isActive = i === safeIndex;
                  return (
                    <div
                      key={clan.id}
                      className="box-border flex h-full w-full min-w-0 max-w-full shrink-0 grow-0 basis-full snap-center snap-always items-center justify-center p-0"
                      aria-hidden={!isActive}
                    >
                      <div
                        className={[
                          isEmbed
                            ? "w-[min(100%,20rem)] min-w-0 sm:w-[min(100%,20rem)] md:w-[min(100%,26.25rem)]"
                            : "w-[min(92vw,420px)]",
                          "shrink-0",
                        ].join(" ")}
                      >
                        <ClanCardContent
                          clan={clan}
                          isActive={isActive}
                          isEmbed={isEmbed}
                          emblemSize={isEmbed ? "embed" : "page"}
                          getResolvedClanIconSrc={getResolvedClanIconSrc}
                          bloodRgb={bloodRgb}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {clans.length > 1 ? (
                <div
                  className="mt-4 flex w-full min-w-0 max-w-full flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-1.5 sm:gap-y-2.5"
                  role="tablist"
                  aria-label="Clans"
                >
                  {clans.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToSlide(i, true)}
                      className={[
                        "group relative grid shrink-0 place-items-center rounded-full border transition",
                        "aspect-square h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10",
                        i === safeIndex
                          ? "border-[#c82434]/80 bg-zinc-950"
                          : "border-zinc-800 bg-zinc-950 hover:border-[#c82434]/60",
                        "cursor-pointer",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c82434]/60",
                      ].join(" ")}
                      aria-label={`Go to ${c.name}`}
                      title={c.name}
                      role="tab"
                      aria-selected={i === safeIndex}
                    >
                      <span
                        className={[
                          "block aspect-square h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8",
                          i === safeIndex
                            ? "opacity-90"
                            : "opacity-65 group-hover:opacity-80",
                        ].join(" ")}
                        style={{
                          backgroundColor: bloodRgb,
                          WebkitMaskImage: `url(${getResolvedClanIconSrc(
                            c.name,
                          )})`,
                          maskImage: `url(${getResolvedClanIconSrc(c.name)})`,
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

