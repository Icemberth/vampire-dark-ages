"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
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

function InfoFieldButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="vda-wizard-label-info"
      aria-label={label}
    >
      <Image
        src="/icons/info.png"
        alt=""
        width={24}
        height={24}
        unoptimized
        className="h-6 w-6 object-contain"
      />
    </button>
  );
}

function FormLabelWithInfo({
  htmlFor,
  children,
  infoLabel,
}: {
  htmlFor: string;
  children: ReactNode;
  /** Accessibility label for the info control */
  infoLabel: string;
}) {
  return (
    <div className="vda-wizard-label-row">
      <label className="vda-wizard-label" htmlFor={htmlFor}>
        {children}
      </label>
      <InfoFieldButton label={infoLabel} />
    </div>
  );
}

function FormSectionTitleWithInfo({
  children,
  infoLabel,
}: {
  children: ReactNode;
  infoLabel: string;
}) {
  return (
    <div className="vda-wizard-section-title-row">
      <h2 className="vda-wizard-section-title">
        {children}
      </h2>
      <InfoFieldButton label={infoLabel} />
    </div>
  );
}

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
  const [clanSearch, setClanSearch] = useState("");

  const clanSearchMatches = useMemo(() => {
    const q = clanSearch.trim().toLowerCase();
    if (!q) return [];
    return clans
      .filter((c) =>
        [c.name, c.subName, c.nickname]
          .filter((x): x is string => Boolean(x))
          .some((x) => x.toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [clans, clanSearch]);

  const applyClanFromSearch = (id: string) => {
    setClanId(id);
    const c = clans.find((x) => x.id === id);
    setClanSearch(c ? c.name : "");
  };

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
        <div className="vda-wizard-step-bar-layout">
          <Link href="/characters" className="vda-wizard-cta vda-wizard-cta--cancel">
            Cancel
          </Link>
          <ol className="vda-wizard-step-bar-list">
            {STEPS.map((s, i) => {
              const active = i === step;
              return (
                <li key={s.label} className="min-w-0 text-center">
                  <button
                    type="button"
                    className={[
                      "vda-wizard-step-bar-tab",
                      active ? "vda-wizard-step-bar-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
          <div className="vda-wizard-step-bar-actions">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={pending}
                className="vda-wizard-cta"
              >
                Back
              </button>
            ) : null}
            {step < 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={pending}
                className="vda-wizard-cta"
              >
                {pending ? "Saving…" : "Next"}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={pending}
                className="vda-wizard-cta vda-wizard-cta--wrap"
              >
                {pending ? "Finishing…" : "Save & return to list"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {error ? (
        <p className="mt-4 rounded-md border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {step === 0 ? (
        <div className="vda-wizard-concept-panel box-border mt-6 flex min-w-0 flex-col">
          <div className="vda-wizard-concept-panel-body flex min-w-0 flex-1 flex-col gap-6">
            <FormSectionTitleWithInfo infoLabel="About character concept">
              Character concept
            </FormSectionTitleWithInfo>
            <div className="flex flex-col gap-3">
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-name"
                  infoLabel="About character name"
                >
                  Character name
                </FormLabelWithInfo>
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
                <FormLabelWithInfo
                  htmlFor="char-wizard-concept"
                  infoLabel="About concept"
                >
                  Concept
                </FormLabelWithInfo>
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
                <FormLabelWithInfo
                  htmlFor="char-wizard-nature"
                  infoLabel="About nature"
                >
                  Nature
                </FormLabelWithInfo>
                <input
                  id="char-wizard-nature"
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="vda-wizard-input"
                  autoComplete="off"
                />
              </div>
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-demeanor"
                  infoLabel="About demeanor"
                >
                  Demeanor
                </FormLabelWithInfo>
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
                <>
                  <div className="relative z-20 mb-3 w-full max-w-md">
                    <FormLabelWithInfo
                      htmlFor="char-wizard-clan-search"
                      infoLabel="About finding a clan"
                    >
                      Find a clan
                    </FormLabelWithInfo>
                    <input
                      id="char-wizard-clan-search"
                      type="search"
                      value={clanSearch}
                      onChange={(e) => setClanSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        const m = clanSearchMatches;
                        if (m.length === 1) applyClanFromSearch(m[0].id);
                        else if (m.length > 1) applyClanFromSearch(m[0].id);
                      }}
                      className="vda-wizard-input vda-wizard-clan-search"
                      placeholder="Search by name, bloodline, or nickname…"
                      autoComplete="off"
                    />
                    {clanSearch.trim() && clanSearchMatches.length > 0 ? (
                      <ul
                        id="char-wizard-clan-search-list"
                        role="listbox"
                        className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-auto rounded border border-zinc-700 bg-black/95 py-1 shadow-lg"
                      >
                        {clanSearchMatches.map((c) => (
                          <li key={c.id} role="presentation">
                            <button
                              type="button"
                              role="option"
                              aria-selected={c.id === clanId}
                              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-zinc-900/90"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => applyClanFromSearch(c.id)}
                            >
                              <span className="font-medium text-zinc-100">
                                {c.name}
                              </span>
                              {c.subName ? (
                                <span className="text-xs text-zinc-500">
                                  {c.subName}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : clanSearch.trim() && clanSearchMatches.length === 0 ? (
                      <p className="mt-1.5 text-xs text-zinc-500">
                        No clan matches that search.
                      </p>
                    ) : null}
                  </div>
                  <ClanCarousel
                    clans={clans}
                    mode="embed"
                    selectedClanId={clanId || null}
                    onClanIdChange={setClanId}
                  />
                </>
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
          <FormSectionTitleWithInfo infoLabel="About generation (blood)">
            Generation
          </FormSectionTitleWithInfo>
          <div className="vda-wizard-field max-w-sm">
            <FormLabelWithInfo
              htmlFor="char-wizard-generation"
              infoLabel="About generation"
            >
              Generation
            </FormLabelWithInfo>
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
    </div>
  );
}
