"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DRAFT_CHARACTER_NAME,
  type CharacterRow,
} from "@/lib/character";
import {
  completeCharacterWizard,
  saveCharacterWizard,
} from "@/app/characters/character-builder/actions";

const STEPS = [
  { label: "Identity", description: "Name and concept" },
  { label: "Persona", description: "Nature and demeanor" },
  { label: "Blood", description: "Clan and generation" },
] as const;

type ClanOption = { id: string; name: string };

type CharacterWizardProps = {
  character: CharacterRow;
  clans: ClanOption[];
};

export function CharacterWizard({ character, clans }: CharacterWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(character.name);
  const [concept, setConcept] = useState(character.concept ?? "");
  const [nature, setNature] = useState(character.nature ?? "");
  const [demeanor, setDemeanor] = useState(character.demeanor ?? "");
  const [clanId, setClanId] = useState(character.clanId ?? "");
  const [generation, setGeneration] = useState(
    String(character.generation ?? 12),
  );

  const goNext = () => {
    if (step === 0) {
      startTransition(async () => {
        setError(null);
        const trimmed = name.trim() || DRAFT_CHARACTER_NAME;
        setName(trimmed);
        const res = await saveCharacterWizard(character.id, {
          name: trimmed,
          concept: concept.trim() || null,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.refresh();
        setStep(1);
      });
      return;
    }
    if (step === 1) {
      startTransition(async () => {
        setError(null);
        const res = await saveCharacterWizard(character.id, {
          nature: nature.trim() || null,
          demeanor: demeanor.trim() || null,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.refresh();
        setStep(2);
      });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const finish = () => {
    let gen: number = parseInt(generation, 10);
    if (Number.isNaN(gen) || gen < 1) {
      gen = 12;
    }
    if (gen > 15) {
      gen = 15;
    }
    const clan: string | null = clanId === "" ? null : clanId;

    startTransition(async () => {
      setError(null);
      const save = await saveCharacterWizard(character.id, {
        generation: gen,
        clanId: clan,
      });
      if (!save.ok) {
        setError(save.error);
        return;
      }
      await completeCharacterWizard(character.id);
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="text-xs text-zinc-500">
        Character id (saved as you go):{" "}
        <span className="font-mono text-zinc-400">{character.id}</span>
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-wide text-[rgb(200,36,52)] [font-family:var(--font-heading),serif] sm:text-3xl">
        New character
      </h1>
      <p className="mt-1 text-sm text-zinc-400">
        Progress is written to the database on each step so the list can update
        while you work.
      </p>

      <ol className="mt-6 flex gap-2">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={s.label}
              className="flex min-w-0 flex-1 flex-col rounded-lg border px-2 py-2 text-center sm:px-3"
              style={{
                borderColor: active
                  ? "rgba(200, 36, 52, 0.5)"
                  : "rgba(63, 63, 70, 0.6)",
                background: active
                  ? "rgba(200, 36, 52, 0.08)"
                  : done
                    ? "rgba(39, 39, 42, 0.5)"
                    : "rgba(0,0,0,0.2)",
              }}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider sm:text-xs ${
                  active ? "text-[rgb(200,36,52)]" : "text-zinc-500"
                }`}
              >
                {i + 1}. {s.label}
              </span>
              <span className="hidden text-[10px] text-zinc-500 sm:block">
                {s.description}
              </span>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p className="mt-4 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-zinc-800/80 bg-black/30 p-4 sm:p-6">
        {step === 0 ? (
          <div className="flex flex-col gap-4">
            <label className="block text-sm text-zinc-300">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
                placeholder={DRAFT_CHARACTER_NAME}
                autoComplete="off"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              Concept
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="mt-1 min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
                placeholder="One-line story hook"
                rows={3}
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <label className="block text-sm text-zinc-300">
              Nature
              <input
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
                autoComplete="off"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              Demeanor
              <input
                value={demeanor}
                onChange={(e) => setDemeanor(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
                autoComplete="off"
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-4">
            <label className="block text-sm text-zinc-300">
              Clan
              <select
                value={clanId}
                onChange={(e) => setClanId(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
              >
                <option value="">Decide later</option>
                {clans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-zinc-300">
              Generation
              <input
                type="number"
                min={1}
                max={15}
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                className="mt-1 w-full max-w-32 rounded-md border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-zinc-100 outline-none focus:border-[rgb(200,36,52)]/60"
              />
            </label>
            <p className="text-xs text-zinc-500">
              Browsing full clan lore:{" "}
              <Link
                className="text-[rgb(200,36,52)] hover:underline"
                href="/clans"
                target="_blank"
                rel="noreferrer"
              >
                Clans
              </Link>
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/characters"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              className="rounded-lg border border-zinc-600 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200 transition enabled:hover:border-zinc-500 enabled:hover:bg-zinc-800/50 disabled:opacity-50"
            >
              Back
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={pending}
              className="rounded-lg border border-[rgb(200,36,52)]/50 bg-[rgb(200,36,52)]/15 px-4 py-2 text-sm font-medium text-zinc-100 transition enabled:hover:border-[rgb(200,36,52)]/80 enabled:hover:bg-[rgb(200,36,52)]/25 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Next"}
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="rounded-lg border border-[rgb(200,36,52)]/50 bg-[rgb(200,36,52)]/15 px-4 py-2 text-sm font-medium text-zinc-100 transition enabled:hover:border-[rgb(200,36,52)]/80 enabled:hover:bg-[rgb(200,36,52)]/25 disabled:opacity-50"
            >
              {pending ? "Finishing…" : "Save & return to list"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
