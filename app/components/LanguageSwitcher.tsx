"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

/** Deep maroon border — matches WoD-style reference */
const FRAME = "border-[#4a0408]";
const FRAME_SOFT = "border-[#4a0408]/85";

export type LocaleSwitcherCopy = {
  ariaLabel: string;
  en: string;
  es: string;
};

function localeHref(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}`;
  segments[0] = target;
  return `/${segments.join("/")}`;
}

type LanguageSwitcherProps = {
  locale: Locale;
  copy: LocaleSwitcherCopy;
  /** Landing: fixed top-right. Shell: sits inline in header row. */
  variant?: "landing" | "header";
};

export function LanguageSwitcher({
  locale,
  copy,
  variant = "landing",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const code = locale.toUpperCase();

  const shellClass =
    variant === "landing"
      ? "pointer-events-auto fixed right-4 top-4 z-[60] sm:right-6 sm:top-6"
      : "relative shrink-0";

  return (
    <div ref={wrapRef} className={shellClass}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={copy.ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2.5 rounded-md ${FRAME} bg-black px-3.5 py-2 shadow-[0_6px_28px_rgba(0,0,0,0.65)] transition hover:bg-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c82434]/45 [font-family:var(--font-body),Georgia,serif]`}
      >
        <span className="text-zinc-100" aria-hidden>
          <svg
            width={17}
            height={17}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.35" />
            <ellipse cx="12" cy="12" rx="4.25" ry="9.25" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 12h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path
              d="M6.5 8c3 1 8 1 11 0M6.5 16c3-1 8-1 11 0"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity={0.88}
            />
          </svg>
        </span>
        <span className="min-w-[2.25rem] text-left text-[13px] font-semibold tracking-[0.14em] text-zinc-100">
          {code}
        </span>
        <span className="text-[#7a1518]" aria-hidden>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={copy.ariaLabel}
          className={`absolute left-0 top-[calc(100%+6px)] z-[70] min-w-full overflow-hidden rounded-md ${FRAME} bg-black py-1 shadow-[0_18px_50px_rgba(0,0,0,0.82)] [font-family:var(--font-body),Georgia,serif]`}
        >
          {LOCALES.map((loc, idx) => {
            const active = loc === locale;
            const label = loc === "en" ? copy.en : copy.es;
            const href = localeHref(pathname, loc);
            return (
              <li
                key={loc}
                role="none"
                className={idx > 0 ? `border-t ${FRAME_SOFT}` : undefined}
              >
                <Link
                  href={href}
                  role="option"
                  aria-selected={active}
                  prefetch
                  className={`flex items-center gap-2 px-3 py-2.5 text-[13px] transition ${
                    active
                      ? "bg-[#1a0a0c] text-zinc-50"
                      : "text-zinc-100 hover:bg-white/[0.06]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span
                    className={`inline-flex min-h-[1.5rem] min-w-[2.25rem] items-center justify-center rounded-sm px-1.5 text-[11px] font-bold tracking-[0.14em] ${
                      active
                        ? "border border-[#4a0408]/70 bg-black/80 text-zinc-100 shadow-inner"
                        : "border border-transparent text-zinc-100"
                    }`}
                  >
                    {loc.toUpperCase()}
                  </span>
                  <span className="text-[13px] font-normal tracking-normal text-zinc-100">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
