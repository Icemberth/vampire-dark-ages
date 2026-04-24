"use client";

import * as React from "react";

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
  /** When in `embed` mode, syncs carousel position. Use `""` for “not chosen yet”. */
  selectedClanId?: string | null;
  /**
   * When in `embed` mode, called when a clan is chosen (swipe / select).
   * Not called on initial “browse at index 0” while `selectedClanId` is still empty
   * until the user interacts with the carousel.
   */
  onClanIdChange?: (id: string) => void;
};

function normalizeIconKey(input: string) {
  return (
    input
      // Case-insensitive matching
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "")
      .trim()
  );
}

const DEFAULT_CLAN_ICON_SRC = "/icons/clans/darkAges.svg";

// Key aliases to match filename conventions / common alternate names.
const ICON_KEY_ALIAS: Record<string, string> = {
  // "Children of Set" is commonly used for Setites
  childrenofset: "settites",
};

export function ClanCarousel({
  clans,
  mode = "page",
  selectedClanId = null,
  onClanIdChange,
}: ClanCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const userPickedClanRef = React.useRef(false);

  const clampIndex = React.useCallback(
    (n: number) => {
      if (!clans.length) return 0;
      return Math.max(0, Math.min(clans.length - 1, n));
    },
    [clans.length],
  );
  const safeIndex = clans.length ? Math.min(index, clans.length - 1) : 0;

  React.useEffect(() => {
    if (mode !== "embed" || !clans.length) return;
    if (selectedClanId == null || selectedClanId === "") {
      return;
    }
    const i = clans.findIndex((c) => c.id === selectedClanId);
    if (i < 0) return;
    queueMicrotask(() => {
      setIndex((prev) => (prev === i ? prev : i));
    });
  }, [mode, clans, selectedClanId]);

  React.useEffect(() => {
    if (mode !== "embed" || !onClanIdChange || !clans[safeIndex]) return;
    if (!userPickedClanRef.current) {
      if (selectedClanId == null || selectedClanId === "") {
        return;
      }
    }
    onClanIdChange(clans[safeIndex].id);
  }, [mode, onClanIdChange, clans, safeIndex, selectedClanId]);

  const markClanUser = React.useCallback(() => {
    userPickedClanRef.current = true;
  }, []);

  const isDraggingRef = React.useRef(false);
  const dragStartXRef = React.useRef(0);
  const dragDeltaXRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  const [dragX, setDragX] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [iconSrcByKey, setIconSrcByKey] = React.useState<
    Record<string, string>
  >({});

  const setDragXThrottled = React.useCallback((next: number) => {
    dragDeltaXRef.current = next;
    if (rafRef.current != null) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setDragX(dragDeltaXRef.current);
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setViewportWidth(el.clientWidth || 0);
    });
    ro.observe(el);
    setViewportWidth(el.clientWidth || 0);

    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    // Resolve icons by convention: /icons/clans/<normalized>.svg
    // If the file 404s/misses, fall back to darkAges.svg.
    const keys = Array.from(
      new Set(clans.map((c) => normalizeIconKey(c.name)).filter(Boolean)),
    );
    if (!keys.length) return;

    let cancelled = false;

    keys.forEach((key) => {
      // If already resolved, don't re-check.
      if (iconSrcByKey[key]) return;

      const candidateName = ICON_KEY_ALIAS[key] ?? key;
      const candidateSrc = `/icons/clans/${candidateName}.svg`;

      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setIconSrcByKey((prev) => ({
          ...prev,
          [key]: candidateSrc,
        }));
      };
      img.onerror = () => {
        if (cancelled) return;
        setIconSrcByKey((prev) => ({
          ...prev,
          [key]: DEFAULT_CLAN_ICON_SRC,
        }));
      };
      img.src = candidateSrc;
    });

    return () => {
      cancelled = true;
    };
  }, [clans, iconSrcByKey]);

  const getResolvedClanIconSrc = React.useCallback(
    (clanName: string) => {
      const key = normalizeIconKey(clanName);
      return iconSrcByKey[key] ?? DEFAULT_CLAN_ICON_SRC;
    },
    [iconSrcByKey],
  );

  const bloodRgb = "var(--vda-blood)";

  const goPrev = React.useCallback(() => {
    markClanUser();
    setIndex((i) => clampIndex(i - 1));
  }, [clampIndex, markClanUser]);
  const goNext = React.useCallback(() => {
    markClanUser();
    setIndex((i) => clampIndex(i + 1));
  }, [clampIndex, markClanUser]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Home") {
        markClanUser();
        setIndex(0);
      }
      if (e.key === "End") {
        markClanUser();
        setIndex(Math.max(0, clans.length - 1));
      }
    },
    [clans.length, goNext, goPrev, markClanUser],
  );

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    setDragX(0);
  }, []);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - dragStartXRef.current;
      setDragXThrottled(delta);
    },
    [setDragXThrottled],
  );

  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartXRef.current = t.clientX;
    setDragX(0);
  }, []);

  const onTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isDraggingRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const delta = t.clientX - dragStartXRef.current;
      setDragXThrottled(delta);
    },
    [setDragXThrottled],
  );

  const stepXMax = viewportWidth >= 1024 ? 280 : 240;
  const stepX = Math.max(140, Math.min(stepXMax, viewportWidth * 0.55 || 220));

  const endDrag = React.useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const threshold = Math.max(48, Math.min(96, viewportWidth * 0.18 || 70));
    const delta = dragDeltaXRef.current;
    dragDeltaXRef.current = 0;
    setDragX(0);

    if (Math.abs(delta) < threshold) return;

    // Allow multi-card jumps based on swipe distance.
    const effectiveStep = Math.max(120, Math.min(360, stepX || 220));
    const steps = Math.max(1, Math.round(Math.abs(delta) / effectiveStep));
    if (mode === "embed") {
      markClanUser();
    }
    if (delta > 0) setIndex((i) => clampIndex(i - steps));
    else setIndex((i) => clampIndex(i + steps));
  }, [clampIndex, markClanUser, mode, stepX, viewportWidth]);

  // Make left-swipe advance toward "next" during drag.
  const progress = -dragX / Math.max(240, stepX * 1.25);

  const isEmbed = mode === "embed";

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
        <header
          className={isEmbed ? "mb-2 sm:mb-3" : "mb-3 text-center sm:mb-5"}
        >
          {isEmbed ? (
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-[#c82434] [font-family:var(--font-heading),serif]">
                Clan
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Swipe to choose. Your selection applies to this character.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2 text-[#c82434] uppercase tracking-widest sm:text-4xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
                V20 Dark Ages Compendium
              </h1>
              <p className="text-zinc-300 italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Select your lineage. Swipe to browse.
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
              ref={viewportRef}
              className={[
                "relative flex-1 min-h-0 select-none touch-none",
                isEmbed
                  ? "min-h-60 sm:min-h-72 max-h-[min(70svh,34rem)]"
                  : "max-h-[min(46svh,420px)] sm:max-h-[min(50svh,460px)]",
                isDragging ? "cursor-grabbing" : "cursor-grab",
              ].join(" ")}
              style={{ perspective: "1200px" }}
              role="region"
              aria-label="Clan carousel"
              tabIndex={0}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={endDrag}
              onTouchCancel={endDrag}
            >
              {clans.map((clan, i) => {
                const offset = i - safeIndex;
                const x = (offset - progress) * stepX;
                const rotateYRaw = (offset - progress) * -28;
                const rotateY = Math.max(-55, Math.min(55, rotateYRaw));
                const z = -Math.abs(offset - progress) * 120;
                const scale =
                  1 - Math.min(0.18, Math.abs(offset - progress) * 0.08);
                const opacity =
                  1 - Math.min(0.8, Math.abs(offset - progress) * 0.22);
                const isActive = i === safeIndex;
                const iconSrc = getResolvedClanIconSrc(clan.name);

                return (
                  <div
                    key={clan.id}
                    className="absolute left-1/2 top-1/2 w-[min(92vw,420px)]"
                    style={{
                      transform: `translate(-50%, -50%) translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      transition: isDragging
                        ? "none"
                        : "transform 420ms cubic-bezier(0.2, 0.9, 0.2, 1), opacity 420ms ease",
                      zIndex: 1000 - Math.abs(offset),
                      transformOrigin: "center center",
                      backfaceVisibility: "hidden",
                    }}
                    aria-hidden={!isActive}
                  >
                    <div
                      className={[
                        "relative overflow-hidden rounded-2xl border bg-zinc-950",
                        isActive ? "border-[#c82434]/70" : "border-zinc-800/80",
                      ].join(" ")}
                      style={{
                        boxShadow: isActive
                          ? "0 28px 80px color-mix(in srgb, var(--vda-blood) 25%, transparent), 0 14px 34px rgba(0,0,0,0.55)"
                          : "0 18px 50px rgba(0,0,0,0.55)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {/* right-side emblem (tinted) */}
                      <div
                        className="pointer-events-none absolute -right-10 top-1/2 h-[140%] w-[78%] -translate-y-1/2 opacity-35 sm:opacity-40"
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

                      {/* subtle vignette to keep text readable */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(0,0,0,0.65),transparent_55%)]" />

                      <div className="relative z-10 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="min-w-0">
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <h2 className="truncate text-xl font-bold text-zinc-100 sm:text-2xl">
                                  {clan.name}
                                </h2>
                                {clan.subName ? (
                                  <span className="shrink-0 text-[#c82434] text-sm font-semibold">
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
                            <span className="text-[10px] bg-[#c82434]/20 text-[#c82434] px-2 py-1 rounded uppercase font-bold tracking-tighter">
                              Bloodline
                            </span>
                          ) : null}
                        </div>

                        {clan.description ? (
                          <p className="text-zinc-300/90 text-sm leading-relaxed mb-5 line-clamp-4">
                            {clan.description}
                          </p>
                        ) : (
                          <p className="text-zinc-500 text-sm mb-5 italic">
                            No description available.
                          </p>
                        )}

                        <div className="grid gap-4">
                          <div>
                            <h3 className="text-xs uppercase font-bold tracking-wide text-zinc-500 mb-2">
                              Disciplines
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {(clan.disciplines?.length
                                ? clan.disciplines
                                : ["—"]
                              ).map((d) => (
                                <span
                                  key={`${clan.id}:${d}`}
                                  className="text-xs bg-zinc-900/70 border border-zinc-800 px-2 py-1 rounded text-zinc-200"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-zinc-800/80">
                            <h3 className="text-xs uppercase font-bold tracking-wide text-[#c82434] mb-1">
                              Weakness
                            </h3>
                            <p className="text-xs text-zinc-300/80 italic leading-relaxed">
                              {clan.weakness || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots: wrap so every clan is visible; no clip / horizontal pan */}
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
                    onClick={() => {
                      markClanUser();
                      setIndex(i);
                    }}
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
                        WebkitMaskImage: `url(${getResolvedClanIconSrc(c.name)})`,
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
  );
}
