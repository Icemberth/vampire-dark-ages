"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCharacterAction } from "@/lib/actions/delete-character";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

type CardCopy = {
  actions: string;
  options: string;
  edit: string;
  delete: string;
  deleteTitle: string;
  deleteBody: string;
  cancel: string;
  deleteForever: string;
  deleting: string;
};

type CharacterCardMenuProps = {
  locale: Locale;
  characterId: string;
  copy: CardCopy;
};

export function CharacterCardMenu({
  locale,
  characterId,
  copy,
}: CharacterCardMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

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
    const li = wrapRef.current?.closest("li");
    if (!li) return;
    if (open) {
      li.style.setProperty("z-index", "50");
    } else {
      li.style.removeProperty("z-index");
    }
    return () => {
      li.style.removeProperty("z-index");
    };
  }, [open]);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setConfirmOpen(false);
        setActionError(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [confirmOpen]);

  const openDeleteModal = () => {
    setOpen(false);
    setActionError(null);
    setConfirmOpen(true);
  };

  const runDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await deleteCharacterAction(characterId, locale);
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
      } else {
        setActionError(res.error);
      }
    });
  };

  const modal = confirmOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-200 flex items-center justify-center p-4"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
            aria-hidden
            onClick={() => {
              if (!pending) {
                setConfirmOpen(false);
                setActionError(null);
              }
            }}
          />
          <div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950/98 shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="border-b border-black/35 px-5 py-4"
              style={{
                backgroundColor: "#6f0d12",
                backgroundImage: "url(/icons/vtm-button-distress.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundBlendMode: "multiply",
              }}
            >
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-wide text-zinc-100 [font-family:var(--font-heading),serif]"
              >
                {copy.deleteTitle}
              </h2>
            </div>
            <p
              id={descId}
              className="px-5 py-4 text-sm leading-relaxed text-zinc-300/80"
            >
              {copy.deleteBody}
            </p>
            {actionError ? (
              <p className="px-5 pb-2 text-sm text-red-300">{actionError}</p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 border-t border-zinc-800/80 bg-black/20 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pending}
                onClick={() => {
                  setConfirmOpen(false);
                  setActionError(null);
                }}
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                className="rounded-lg border border-black/30 px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-white shadow-md transition [font-family:var(--font-heading),serif] hover:brightness-110 active:brightness-95 disabled:opacity-50"
                style={{
                  backgroundColor: "#7f1d1d",
                  backgroundImage: "url(/icons/vtm-button-distress.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundBlendMode: "multiply",
                }}
                disabled={pending}
                onClick={runDelete}
              >
                {pending ? copy.deleting : copy.deleteForever}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div
      ref={wrapRef}
      className="relative z-20 shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {modal}
      <button
        type="button"
        className="rounded-md px-1.5 py-0.5 text-lg leading-none text-zinc-400 transition hover:bg-black/30 hover:text-zinc-200 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={pending}
        onClick={() => setOpen((o) => !o)}
        aria-label={copy.actions}
      >
        <span className="select-none" aria-hidden>
          ...
        </span>
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-56 overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950/96 text-sm shadow-[0_24px_70px_rgba(0,0,0,0.72)] backdrop-blur-sm"
        >
          <li role="none">
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
                {copy.options}
              </p>
            </div>
          </li>
          <li role="none">
            <Link
              href={withLocale(
                locale,
                `/characters/character-builder/${characterId}`,
              )}
              role="menuitem"
              className="m-2 block w-[calc(100%-1rem)] cursor-pointer rounded-lg px-3 py-2.5 text-left text-zinc-200 transition hover:bg-zinc-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c82434]/40"
              onClick={() => setOpen(false)}
            >
              {copy.edit}
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="m-2 w-[calc(100%-1rem)] cursor-pointer rounded-lg px-3 py-2.5 text-left text-red-200 transition hover:bg-red-950/35 hover:text-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pending}
              onClick={openDeleteModal}
            >
              {copy.delete}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
