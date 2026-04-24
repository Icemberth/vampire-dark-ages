"use client";

import * as React from "react";

type Clan = {
  id: string;
  name: string;
  subName: string | null;
  nickname: string | null;
  isBloodline: boolean | null;
  weakness: string | null;
  description: string | null;
  disciplines: string[];
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

export function ClanCarousel({ clans }: { clans: Clan[] }) {
  const [index, setIndex] = React.useState(0);
  const clampIndex = React.useCallback(
    (n: number) => {
      if (!clans.length) return 0;
      return Math.max(0, Math.min(clans.length - 1, n));
    },
    [clans.length],
  );
  const safeIndex = clans.length ? Math.min(index, clans.length - 1) : 0;

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

  const bloodRgb = "rgb(200 36 52)";

  const goPrev = React.useCallback(
    () => setIndex((i) => clampIndex(i - 1)),
    [clampIndex],
  );
  const goNext = React.useCallback(
    () => setIndex((i) => clampIndex(i + 1)),
    [clampIndex],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Home") setIndex(0);
      if (e.key === "End") setIndex(Math.max(0, clans.length - 1));
    },
    [clans.length, goNext, goPrev],
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

    if (delta > 0) setIndex((i) => clampIndex(i - steps));
    else setIndex((i) => clampIndex(i + steps));
  }, [clampIndex, stepX, viewportWidth]);

  // Make left-swipe advance toward "next" during drag.
  const progress = -dragX / Math.max(240, stepX * 1.25);

  return (
    <div
      className="h-svh text-zinc-100 overflow-x-hidden"
      style={{
        backgroundImage: "url(/icons/vda-background-img.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex h-full flex-col px-4 py-4 sm:px-6 sm:py-6 md:px-10">
        <header className="mb-3 text-center sm:mb-5">
          <h1 className="text-3xl font-bold mb-2 text-[rgb(200,36,52)] uppercase tracking-widest sm:text-4xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]">
            V20 Dark Ages Compendium
          </h1>
          <p className="text-zinc-300 italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            Select your lineage. Swipe to browse.
          </p>
        </header>

        <div className="relative flex-1 min-h-0 overflow-hidden">
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-xs text-zinc-500">
                {clans.length ? (
                  <span>
                    {safeIndex + 1} / {clans.length}
                  </span>
                ) : (
                  <span>0 / 0</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={safeIndex <= 0}
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 hover:border-[rgb(200,36,52)]/60 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(200,36,52)]/60"
                  aria-label="Previous clan"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={safeIndex >= clans.length - 1}
                  className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 hover:border-[rgb(200,36,52)]/60 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(200,36,52)]/60"
                  aria-label="Next clan"
                >
                  Next
                </button>
              </div>
            </div>

            <div
              ref={viewportRef}
              className={[
                "relative flex-1 min-h-0 max-h-[min(46svh,420px)] sm:max-h-[min(50svh,460px)] select-none touch-none",
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
              {/* Drag hint */}
              <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-[11px] tracking-wide text-zinc-500">
                Drag / swipe • ← →
              </div>

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
                        isActive
                          ? "border-[rgb(200,36,52)]/70"
                          : "border-zinc-800/80",
                      ].join(" ")}
                      style={{
                        boxShadow: isActive
                          ? "0 28px 80px rgba(200,36,52,0.25), 0 14px 34px rgba(0,0,0,0.55)"
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
                                  <span className="shrink-0 text-[rgb(200,36,52)] text-sm font-semibold">
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
                            <span className="text-[10px] bg-[rgb(200,36,52)]/20 text-[rgb(200,36,52)] px-2 py-1 rounded uppercase font-bold tracking-tighter">
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
                            <h3 className="text-xs uppercase font-bold tracking-wide text-[rgb(200,36,52)] mb-1">
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

            {/* Dots */}
            {clans.length > 1 ? (
              <div
                className="mt-4 grid grid-cols-8 place-content-center justify-items-center gap-1 sm:flex sm:items-center sm:justify-center sm:gap-2"
                role="tablist"
                aria-label="Clans"
              >
                {clans.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={[
                      "group relative grid place-items-center rounded-full border transition",
                      "flex-none shrink-0 aspect-square h-6 w-6 sm:h-8 sm:w-8 lg:h-11 lg:w-11",
                      i === safeIndex
                        ? "border-[rgb(200,36,52)]/80 bg-zinc-950"
                        : "border-zinc-800 bg-zinc-950 hover:border-[rgb(200,36,52)]/60",
                      "cursor-pointer",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(200,36,52)]/60",
                    ].join(" ")}
                    aria-label={`Go to ${c.name}`}
                    title={c.name}
                    role="tab"
                    aria-selected={i === safeIndex}
                  >
                    <span
                      className={[
                        "block aspect-square h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7",
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
