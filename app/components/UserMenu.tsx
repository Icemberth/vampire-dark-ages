"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

type AccountCopy = {
  menu: string;
  signedInAs: string;
  characters: string;
  browseClans: string;
  signOut: string;
};

type UserMenuProps = {
  locale: Locale;
  copy: AccountCopy;
  userInitial: string;
  displayName: string;
};

export function UserMenu({
  locale,
  copy,
  userInitial,
  displayName,
}: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const signOutNow = () => {
    setOpen(false);
    startTransition(async () => {
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: withLocale(locale, "/") });
      router.refresh();
    });
  };

  return (
    <div
      ref={wrapRef}
      className="relative shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="relative grid h-14 w-14 shrink-0 place-items-center overflow-visible text-base font-bold leading-none text-white no-underline drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:h-18 sm:w-18 sm:text-lg"
        title={displayName}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-18%] rounded-full sm:inset-[-14%]"
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            backgroundImage: "url(/icons/vtm-blood-stats.png)",
            backgroundSize: "contain",
            backgroundPosition: "50% 44%",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span className="relative z-1 pt-2">{userInitial}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-72 overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950/96 shadow-[0_24px_70px_rgba(0,0,0,0.72)] backdrop-blur-sm"
        >
          <div
            className="border-b border-black/35 px-4 py-3"
            style={{
              backgroundColor: "#6f0d12",
              backgroundImage: "url(/icons/vtm-button-distress.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "multiply",
            }}
          >
            <p className="text-sm text-zinc-100/95 [font-family:var(--font-heading),serif]">
              {copy.menu}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-100/75">
              {copy.signedInAs}{" "}
              <span className="text-zinc-100/90">{displayName}</span>
            </p>
          </div>

          <div className="py-2">
            <Link
              href={withLocale(locale, "/characters")}
              role="menuitem"
              className="mx-2 block rounded-lg px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/5 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c82434]/50"
              onClick={() => setOpen(false)}
            >
              {copy.characters}
            </Link>
            <button
              type="button"
              role="menuitem"
              className="mx-2 block w-[calc(100%-1rem)] rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/5 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c82434]/50 disabled:opacity-50"
              onClick={() => {
                setOpen(false);
                router.push(withLocale(locale, "/clans"));
              }}
              disabled={pending}
            >
              {copy.browseClans}
            </button>

            <div className="my-2 border-t border-zinc-800/80" />

            <button
              type="button"
              role="menuitem"
              className="mx-2 block w-[calc(100%-1rem)] rounded-lg px-3 py-2.5 text-left text-sm text-red-200 transition hover:bg-red-950/35 hover:text-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:opacity-50"
              onClick={signOutNow}
              disabled={pending}
            >
              {copy.signOut}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
