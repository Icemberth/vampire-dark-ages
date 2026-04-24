"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClanCarousel, type Clan } from "@/app/clans/ClanCarousel";
import { DRAFT_CHARACTER_NAME, type CharacterRow } from "@/lib/character";
import {
  completeCharacterWizard,
  saveCharacterWizard,
} from "@/app/characters/character-builder/actions";
import "./character-wizard.css";

const STEPS = [
  { label: "Concept", description: "Name, concept, nature, demeanor, clan" },
  { label: "Blood", description: "Generation" },
] as const;

type CharacterWizardProps = {
  character: CharacterRow;
  clans: Clan[];
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
    if (step !== 0) return;
    startTransition(async () => {
      setError(null);
      const trimmed = name.trim() || DRAFT_CHARACTER_NAME;
      setName(trimmed);
      const res = await saveCharacterWizard(character.id, {
        name: trimmed,
        concept: concept.trim() || null,
        nature: nature.trim() || null,
        demeanor: demeanor.trim() || null,
        clanId: clanId === "" ? null : clanId,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      setStep(1);
    });
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

    startTransition(async () => {
      setError(null);
      const save = await saveCharacterWizard(character.id, {
        generation: gen,
      });
      if (!save.ok) {
        setError(save.error);
        return;
      }
      await completeCharacterWizard(character.id);
    });
  };

  return (
    <div className="vda-wizard mx-auto w-full min-w-0 max-w-4xl">
      <h1 className="mt-1 text-2xl font-bold tracking-wide text-[#c82434] [font-family:var(--font-heading),serif] sm:text-3xl">
        New character
      </h1>
      <nav className="vda-wizard-step-bar" aria-label="Character wizard steps">
        <ol className="vda-wizard-step-bar-list">
          {STEPS.map((s, i) => {
            const active = i === step;
            return (
              <li key={s.label} className="min-w-0 text-center">
                <button
                  type="button"
                  className={active ? "vda-wizard-step-bar-active" : ""}
                  aria-current={active ? "step" : undefined}
                  disabled={i > step}
                  onClick={() => {
                    if (i < step) setStep(i);
                  }}
                  title={s.description}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {error ? (
        <p className="mt-4 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <div className="vda-wizard-concept-panel box-border mt-6 flex min-w-0 flex-col">
          <div className="vda-wizard-concept-panel-body flex min-w-0 flex-1 flex-col gap-6">
            <h2 className="text-sm font-semibold text-zinc-100 [font-family:var(--font-heading),serif]">
              Character concept
            </h2>
            <div className="flex flex-col gap-3">
              <div className="vda-wizard-field">
                <label className="vda-wizard-label" htmlFor="char-wizard-name">
                  Character name
                </label>
                <input
                  id="char-wizard-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="vda-wizard-input"
                  placeholder={DRAFT_CHARACTER_NAME}
                  autoComplete="off"
                />
              </div>
              <div className="vda-wizard-field">
                <label
                  className="vda-wizard-label"
                  htmlFor="char-wizard-concept"
                >
                  Concept
                </label>
                <textarea
                  id="char-wizard-concept"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="vda-wizard-textarea"
                  placeholder="One-line story hook"
                  rows={3}
                />
              </div>
              <div className="vda-wizard-field">
                <label
                  className="vda-wizard-label"
                  htmlFor="char-wizard-nature"
                >
                  Nature
                </label>
                <input
                  id="char-wizard-nature"
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="vda-wizard-input"
                  autoComplete="off"
                />
              </div>
              <div className="vda-wizard-field">
                <label
                  className="vda-wizard-label"
                  htmlFor="char-wizard-demeanor"
                >
                  Demeanor
                </label>
                <input
                  id="char-wizard-demeanor"
                  value={demeanor}
                  onChange={(e) => setDemeanor(e.target.value)}
                  className="vda-wizard-input"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex min-h-[min(72svh,40rem)] w-full min-w-0 flex-col border-t border-white/15 pt-5 sm:min-h-[min(75svh,44rem)]">
              {clans.length > 0 ? (
                <ClanCarousel
                  clans={clans}
                  mode="embed"
                  selectedClanId={clanId || null}
                  onClanIdChange={setClanId}
                />
              ) : (
                <p className="text-sm text-zinc-400">
                  No clans in the codex yet.
                </p>
              )}
            </div>
          </div>
          <div
            aria-hidden
            className="vda-wizard-concept-panel-corner left-[-11px] top-[-11px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/icons/vtm-corner-tl.png"
                alt=""
                fill
                unoptimized
                className="object-contain object-top-left"
                sizes="96px"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="vda-wizard-concept-panel-corner right-[-11px] top-[-11px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/icons/vtm-corner-tr.png"
                alt=""
                fill
                unoptimized
                className="object-contain object-top-right"
                sizes="96px"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="vda-wizard-concept-panel-corner bottom-[-11px] left-[-11px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/icons/vtm-corner-bl.png"
                alt=""
                fill
                unoptimized
                className="object-contain object-bottom-left"
                sizes="96px"
              />
            </div>
          </div>
          <div
            aria-hidden
            className="vda-wizard-concept-panel-corner bottom-[-11px] right-[-11px]"
          >
            <div className="relative h-full w-full">
              <Image
                src="/icons/vtm-corner-br.png"
                alt=""
                fill
                unoptimized
                className="object-contain object-bottom-right"
                sizes="96px"
              />
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-black/30 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-200 [font-family:var(--font-heading),serif]">
            Generation
          </h2>
          <div className="vda-wizard-field max-w-sm">
            <label
              className="vda-wizard-label"
              htmlFor="char-wizard-generation"
            >
              Generation
            </label>
            <input
              id="char-wizard-generation"
              type="number"
              min={1}
              max={15}
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              className="vda-wizard-input w-full"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Browsing clans:{" "}
            <Link
              className="text-[#c82434] hover:underline"
              href="/clans"
              target="_blank"
              rel="noreferrer"
            >
              Clans
            </Link>
          </p>
        </div>
      ) : null}

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
          {step < 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={pending}
              className="rounded-lg border border-[#c82434]/50 bg-[#c82434]/15 px-4 py-2 text-sm font-medium text-zinc-100 transition enabled:hover:border-[#c82434]/80 enabled:hover:bg-[#c82434]/25 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Next"}
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="rounded-lg border border-[#c82434]/50 bg-[#c82434]/15 px-4 py-2 text-sm font-medium text-zinc-100 transition enabled:hover:border-[#c82434]/80 enabled:hover:bg-[#c82434]/25 disabled:opacity-50"
            >
              {pending ? "Finishing…" : "Save & return to list"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
