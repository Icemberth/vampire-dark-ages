"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClanCarousel, type Clan } from "@/app/components/ClanCarousel";
import {
  completeCharacterWizard,
  saveCharacterWizard,
} from "@/lib/actions/character-wizard";
import { DRAFT_CHARACTER_NAME, type CharacterRow } from "@/lib/character";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import {
  characterWizardBloodFormSchema,
  characterWizardConceptFormSchema,
  conceptFormToPatch,
  type CharacterWizardBloodFormValues,
  type CharacterWizardConceptFormValues,
} from "@/lib/validation/character-wizard";
import "./character-wizard.css";

type WizardCopy = Dictionary["wizard"];

type ConceptCodexKey = keyof WizardCopy["codexEntries"];

const CODEX_MOBILE_MQ = "(max-width: 1023px)";

function InfoFieldButton({
  label,
  codexKey,
  activeCodexKey,
  onCodexSelect,
}: {
  label: string;
  codexKey?: ConceptCodexKey;
  activeCodexKey?: ConceptCodexKey | null;
  onCodexSelect?: (key: ConceptCodexKey) => void;
}) {
  const interactive = codexKey != null && onCodexSelect != null;
  const isActive = interactive && activeCodexKey === codexKey;
  const img = (
    <Image
      src="/icons/info.png"
      alt=""
      width={24}
      height={24}
      unoptimized
      className="h-6 w-6 object-contain"
    />
  );
  if (!interactive) {
    return (
      <span className="vda-wizard-label-info" aria-hidden>
        {img}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={[
        "vda-wizard-label-info",
        isActive ? "vda-wizard-label-info--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      aria-pressed={isActive}
      onClick={() => onCodexSelect(codexKey)}
    >
      {img}
    </button>
  );
}

function FormLabelWithInfo({
  htmlFor,
  children,
  infoLabel,
  codexKey,
  activeCodexKey,
  onCodexSelect,
}: {
  htmlFor: string;
  children: ReactNode;
  infoLabel: string;
  codexKey?: ConceptCodexKey;
  activeCodexKey?: ConceptCodexKey | null;
  onCodexSelect?: (key: ConceptCodexKey) => void;
}) {
  return (
    <div className="vda-wizard-label-row">
      <label className="vda-wizard-label" htmlFor={htmlFor}>
        {children}
      </label>
      <InfoFieldButton
        label={infoLabel}
        codexKey={codexKey}
        activeCodexKey={activeCodexKey}
        onCodexSelect={onCodexSelect}
      />
    </div>
  );
}

function FormSectionTitleWithInfo({
  children,
  infoLabel,
  codexKey,
  activeCodexKey,
  onCodexSelect,
}: {
  children: ReactNode;
  infoLabel: string;
  codexKey?: ConceptCodexKey;
  activeCodexKey?: ConceptCodexKey | null;
  onCodexSelect?: (key: ConceptCodexKey) => void;
}) {
  return (
    <div className="vda-wizard-section-title-row">
      <h2 className="vda-wizard-section-title">{children}</h2>
      <InfoFieldButton
        label={infoLabel}
        codexKey={codexKey}
        activeCodexKey={activeCodexKey}
        onCodexSelect={onCodexSelect}
      />
    </div>
  );
}

function ConceptCodexAside({
  wizardCopy,
  activeKey,
}: {
  wizardCopy: WizardCopy;
  activeKey: ConceptCodexKey | null;
}) {
  const { codexAside, codexEntries } = wizardCopy;
  if (activeKey == null) {
    return (
      <div className="vda-wizard-codex-aside-inner">
        <h3 className="vda-wizard-codex-aside-title">{codexAside.emptyTitle}</h3>
        <p className="vda-wizard-codex-aside-body">{codexAside.emptyBody}</p>
      </div>
    );
  }
  const entry = codexEntries[activeKey];
  if (!entry) {
    return (
      <div className="vda-wizard-codex-aside-inner">
        <p className="vda-wizard-codex-aside-body text-zinc-500">
          {codexAside.emptyBody}
        </p>
      </div>
    );
  }
  return (
    <div className="vda-wizard-codex-aside-inner">
      <h3 className="vda-wizard-codex-aside-title">{entry.title}</h3>
      <p className="vda-wizard-codex-aside-body">{entry.body}</p>
    </div>
  );
}

type CharacterWizardProps = {
  character: CharacterRow;
  clans: Clan[];
  locale: Locale;
  wizardCopy: WizardCopy;
};

export function CharacterWizard({
  character,
  clans,
  locale,
  wizardCopy,
}: CharacterWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clanSearch, setClanSearch] = useState("");
  const [conceptCodexKey, setConceptCodexKey] = useState<ConceptCodexKey | null>(
    null,
  );
  const [codexOverlayOpen, setCodexOverlayOpen] = useState(false);

  const closeCodexOverlay = useCallback(() => {
    setCodexOverlayOpen(false);
    setConceptCodexKey(null);
  }, []);

  const handleConceptCodexSelect = useCallback(
    (key: ConceptCodexKey) => {
      const narrow =
        typeof window !== "undefined" &&
        window.matchMedia(CODEX_MOBILE_MQ).matches;
      if (narrow && codexOverlayOpen && conceptCodexKey === key) {
        closeCodexOverlay();
        return;
      }
      setConceptCodexKey(key);
      if (narrow) setCodexOverlayOpen(true);
    },
    [codexOverlayOpen, conceptCodexKey, closeCodexOverlay],
  );

  const conceptForm = useForm<CharacterWizardConceptFormValues>({
    resolver: zodResolver(characterWizardConceptFormSchema),
    defaultValues: {
      name: character.name,
      concept: character.concept ?? "",
      nature: character.nature ?? "",
      demeanor: character.demeanor ?? "",
      clanId: character.clanId ?? "",
    },
  });

  const bloodForm = useForm<CharacterWizardBloodFormValues>({
    resolver: zodResolver(characterWizardBloodFormSchema),
    defaultValues: {
      generation: character.generation ?? 12,
    },
  });

  useEffect(() => {
    conceptForm.reset({
      name: character.name,
      concept: character.concept ?? "",
      nature: character.nature ?? "",
      demeanor: character.demeanor ?? "",
      clanId: character.clanId ?? "",
    });
    bloodForm.reset({
      generation: character.generation ?? 12,
    });
  }, [character, conceptForm, bloodForm]);

  useEffect(() => {
    if (step !== 0) {
      setCodexOverlayOpen(false);
      setConceptCodexKey(null);
    }
  }, [step]);

  useEffect(() => {
    if (!codexOverlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCodexOverlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [codexOverlayOpen, closeCodexOverlay]);

  useEffect(() => {
    if (!codexOverlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [codexOverlayOpen]);

  useEffect(() => {
    const mq = window.matchMedia(CODEX_MOBILE_MQ);
    const onChange = () => {
      setCodexOverlayOpen(false);
      if (mq.matches) setConceptCodexKey(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const clanId = useWatch({
    control: conceptForm.control,
    name: "clanId",
    defaultValue: conceptForm.getValues("clanId"),
  });

  const steps = useMemo(
    () =>
      [
        {
          label: wizardCopy.steps.concept,
          description: wizardCopy.steps.conceptHint,
        },
        {
          label: wizardCopy.steps.blood,
          description: wizardCopy.steps.bloodHint,
        },
      ] as const,
    [wizardCopy.steps],
  );

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
    conceptForm.setValue("clanId", id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    const c = clans.find((x) => x.id === id);
    setClanSearch(c ? c.name : "");
  };

  const goNext = () => {
    if (step !== 0) return;
    void conceptForm.handleSubmit((data) => {
      startTransition(async () => {
        setError(null);
        const patch = conceptFormToPatch(data, locale);
        const res = await saveCharacterWizard(character.id, patch, locale);
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.refresh();
        setStep(1);
      });
    })();
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const finish = () => {
    void bloodForm.handleSubmit((data) => {
      startTransition(async () => {
        setError(null);
        const save = await saveCharacterWizard(
          character.id,
          { generation: data.generation },
          locale,
        );
        if (!save.ok) {
          setError(save.error);
          return;
        }
        await completeCharacterWizard(character.id, locale);
      });
    })();
  };

  const ce = conceptForm.formState.errors;
  const be = bloodForm.formState.errors;

  return (
    <div className="vda-wizard mx-auto w-full min-w-0 max-w-full">
      <h1 className="mt-1 text-2xl font-bold tracking-wide text-[#c82434] [font-family:var(--font-heading),serif] sm:text-3xl">
        {wizardCopy.title}
      </h1>
      <nav className="vda-wizard-step-bar" aria-label="Character wizard steps">
        <div className="vda-wizard-step-bar-layout">
          <Link
            href={withLocale(locale, "/characters")}
            className="vda-wizard-cta vda-wizard-cta--cancel"
          >
            {wizardCopy.cancel}
          </Link>
          <ol className="vda-wizard-step-bar-list">
            {steps.map((s, i) => {
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
                {wizardCopy.back}
              </button>
            ) : null}
            {step < 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={pending}
                className="vda-wizard-cta"
              >
                {pending ? wizardCopy.saving : wizardCopy.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={pending}
                className="vda-wizard-cta vda-wizard-cta--wrap"
              >
                {pending ? wizardCopy.finishing : wizardCopy.finish}
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
        <div className="vda-wizard-concept-panel mt-6 flex min-w-0 max-w-full flex-col">
          <div className="vda-wizard-concept-panel-layout">
            <div className="vda-wizard-concept-panel-main">
              <div className="vda-wizard-concept-panel-body flex min-w-0 flex-1 flex-col gap-6">
            <FormSectionTitleWithInfo
              infoLabel={wizardCopy.conceptSection}
              codexKey="conceptSection"
              activeCodexKey={conceptCodexKey}
              onCodexSelect={handleConceptCodexSelect}
            >
              {wizardCopy.conceptSection}
            </FormSectionTitleWithInfo>
            <div className="flex flex-col gap-3">
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-name"
                  infoLabel={wizardCopy.name}
                  codexKey="name"
                  activeCodexKey={conceptCodexKey}
                  onCodexSelect={handleConceptCodexSelect}
                >
                  {wizardCopy.name}
                </FormLabelWithInfo>
                <input
                  id="char-wizard-name"
                  className="vda-wizard-input"
                  placeholder={DRAFT_CHARACTER_NAME(locale)}
                  autoComplete="off"
                  {...conceptForm.register("name")}
                />
                {ce.name ? (
                  <p className="mt-1 text-xs text-red-300">{ce.name.message}</p>
                ) : null}
              </div>
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-concept"
                  infoLabel={wizardCopy.concept}
                  codexKey="concept"
                  activeCodexKey={conceptCodexKey}
                  onCodexSelect={handleConceptCodexSelect}
                >
                  {wizardCopy.concept}
                </FormLabelWithInfo>
                <textarea
                  id="char-wizard-concept"
                  className="vda-wizard-textarea"
                  placeholder="One-line story hook"
                  rows={3}
                  {...conceptForm.register("concept")}
                />
                {ce.concept ? (
                  <p className="mt-1 text-xs text-red-300">
                    {ce.concept.message}
                  </p>
                ) : null}
              </div>
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-nature"
                  infoLabel={wizardCopy.nature}
                  codexKey="nature"
                  activeCodexKey={conceptCodexKey}
                  onCodexSelect={handleConceptCodexSelect}
                >
                  {wizardCopy.nature}
                </FormLabelWithInfo>
                <input
                  id="char-wizard-nature"
                  className="vda-wizard-input"
                  autoComplete="off"
                  {...conceptForm.register("nature")}
                />
                {ce.nature ? (
                  <p className="mt-1 text-xs text-red-300">
                    {ce.nature.message}
                  </p>
                ) : null}
              </div>
              <div className="vda-wizard-field">
                <FormLabelWithInfo
                  htmlFor="char-wizard-demeanor"
                  infoLabel={wizardCopy.demeanor}
                  codexKey="demeanor"
                  activeCodexKey={conceptCodexKey}
                  onCodexSelect={handleConceptCodexSelect}
                >
                  {wizardCopy.demeanor}
                </FormLabelWithInfo>
                <input
                  id="char-wizard-demeanor"
                  className="vda-wizard-input"
                  autoComplete="off"
                  {...conceptForm.register("demeanor")}
                />
                {ce.demeanor ? (
                  <p className="mt-1 text-xs text-red-300">
                    {ce.demeanor.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex min-h-[min(40svh,17rem)] w-full min-w-0 flex-col border-t border-white/15 pt-5 sm:min-h-[min(52svh,26rem)] lg:min-h-[min(72svh,40rem)]">
              {clans.length > 0 ? (
                <>
                  <div className="relative z-20 mb-3 w-full max-w-md">
                    <FormLabelWithInfo
                      htmlFor="char-wizard-clan-search"
                      infoLabel={wizardCopy.findClan}
                      codexKey="findClan"
                      activeCodexKey={conceptCodexKey}
                      onCodexSelect={handleConceptCodexSelect}
                    >
                      {wizardCopy.findClan}
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
                        if (m.length >= 1) applyClanFromSearch(m[0].id);
                      }}
                      className="vda-wizard-input vda-wizard-clan-search"
                      placeholder={wizardCopy.clanSearchPlaceholder}
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
                              aria-selected={c.id === (clanId ?? "")}
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
                        {wizardCopy.noClanMatch}
                      </p>
                    ) : null}
                  </div>
                  <ClanCarousel
                    clans={clans}
                    mode="embed"
                    selectedClanId={clanId ? clanId : null}
                    onClanIdChange={(id) =>
                      conceptForm.setValue("clanId", id, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  />
                  {ce.clanId ? (
                    <p className="mt-1 text-xs text-red-300">
                      {ce.clanId.message}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-zinc-400">{wizardCopy.noClans}</p>
              )}
            </div>
              </div>
            </div>
            <aside
              className="vda-wizard-concept-panel-side"
              aria-label={wizardCopy.codexAside.emptyTitle}
              aria-live="polite"
            >
              <ConceptCodexAside
                wizardCopy={wizardCopy}
                activeKey={conceptCodexKey}
              />
            </aside>
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
          <FormSectionTitleWithInfo infoLabel={wizardCopy.generation}>
            {wizardCopy.generation}
          </FormSectionTitleWithInfo>
          <div className="vda-wizard-field max-w-sm">
            <FormLabelWithInfo
              htmlFor="char-wizard-generation"
              infoLabel={wizardCopy.generation}
            >
              {wizardCopy.generation}
            </FormLabelWithInfo>
            <input
              id="char-wizard-generation"
              type="number"
              min={1}
              max={15}
              className="vda-wizard-input w-full"
              {...bloodForm.register("generation", { valueAsNumber: true })}
            />
            {be.generation ? (
              <p className="mt-1 text-xs text-red-300">
                {be.generation.message}
              </p>
            ) : null}
          </div>
          <p className="text-xs text-zinc-500">
            {wizardCopy.browseClansLink}{" "}
            <Link
              className="text-[#c82434] hover:underline"
              href={withLocale(locale, "/clans")}
              target="_blank"
              rel="noreferrer"
            >
              {wizardCopy.clansLink}
            </Link>
          </p>
        </div>
      ) : null}

      {step === 0 && codexOverlayOpen && conceptCodexKey != null ? (
        <div
          className="vda-wizard-codex-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={
            wizardCopy.codexEntries[conceptCodexKey]?.title ??
            wizardCopy.codexAside.emptyTitle
          }
        >
          <button
            type="button"
            className="vda-wizard-codex-overlay-backdrop"
            onClick={closeCodexOverlay}
            aria-label={wizardCopy.codexAside.overlayClose}
          />
          <div className="vda-wizard-codex-overlay-sheet">
            <div className="vda-wizard-codex-overlay-header">
              <button
                type="button"
                className="vda-wizard-codex-overlay-close"
                onClick={closeCodexOverlay}
              >
                {wizardCopy.codexAside.overlayClose}
              </button>
            </div>
            <div className="vda-wizard-codex-overlay-sheet-scroll">
              <ConceptCodexAside
                wizardCopy={wizardCopy}
                activeKey={conceptCodexKey}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
