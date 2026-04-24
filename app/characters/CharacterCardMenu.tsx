"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteCharacterAction } from "@/app/characters/actions";

type CharacterCardMenuProps = {
  characterId: string;
};

export function CharacterCardMenu({ characterId }: CharacterCardMenuProps) {
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
      const res = await deleteCharacterAction(characterId);
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
              className="border-b border-zinc-800/90 bg-linear-to-b from-zinc-900/80 to-zinc-950/40 px-5 py-4"
            >
              <h2
                id={titleId}
                className="text-lg font-semibold tracking-wide text-zinc-100 [font-family:var(--font-heading),serif]"
              >
                Delete this character?
              </h2>
            </div>
            <p id={descId} className="px-5 py-4 text-sm leading-relaxed text-zinc-400">
              This permanently removes the character from your chronicle. You
              can close this if you changed your mind.
            </p>
            {actionError ? (
              <p className="px-5 pb-2 text-sm text-red-300">{actionError}</p>
            ) : null}
            <div className="flex flex-col-reverse gap-2 border-t border-zinc-800/80 bg-black/20 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                className="rounded-lg border border-zinc-600 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60 disabled:opacity-50"
                disabled={pending}
                onClick={() => {
                  setConfirmOpen(false);
                  setActionError(null);
                }}
              >
                Cancel
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
                {pending ? "Deleting…" : "Delete forever"}
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
        aria-label="Character actions"
      >
        <span className="select-none" aria-hidden>
          ...
        </span>
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 top-full mt-0.5 min-w-36 rounded-md border border-zinc-700/90 bg-zinc-950/98 py-1 text-sm shadow-lg backdrop-blur-sm"
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-red-300 transition hover:bg-red-950/50 hover:text-red-200"
              disabled={pending}
              onClick={openDeleteModal}
            >
              Delete
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
