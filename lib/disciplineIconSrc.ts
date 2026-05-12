/**
 * Resolves `/public/icons/disciplines/<Name>.webp` for a clan discipline key.
 * Keys usually match codex `name` (lowercase English slug); Spanish clan JSON
 * may store localized labels — those are normalized here to the same asset stem.
 */
const DISCIPLINE_ICON_SLUG_ALIASES: Record<string, string> = {
  animalismo: "animalism",
  celeridad: "celerity",
  dominacion: "dominate",
  extincion: "quietus",
  fortaleza: "fortitude",
  dementacion: "dementation",
  obtenebracion: "obtenebration",
  ofuscacion: "obfuscate",
  potencia: "potence",
  presencia: "presence",
  quimerismo: "chimerstry",
  taumaturgia: "thaumaturgy",
  vicisitud: "vicissitude",
  volar: "flight",
  nigromancia: "necromancy",
};

/** Asset filename stem when it differs from PascalCase(slug). */
const DISCIPLINE_ICON_FILE_STEM: Record<string, string> = {
  serpentis: "SSerpentis",
};

const FALLBACK_DISCIPLINE_ICON = "/icons/clans/darkAges.svg";

function normalizeDisciplineLookupKey(raw: string): string {
  return raw.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function slugToIconStem(slug: string): string {
  const s = slug.trim();
  if (!s) return "Discipline";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function resolveDisciplineIconSlug(rawKey: string): string {
  const normalized = normalizeDisciplineLookupKey(rawKey);
  return DISCIPLINE_ICON_SLUG_ALIASES[normalized] ?? normalized;
}

export function disciplineIconSrc(rawKey: string): string {
  const slug = resolveDisciplineIconSlug(rawKey);
  const stem = slugToIconStem(slug);
  const fileStem = DISCIPLINE_ICON_FILE_STEM[slug] ?? stem;
  return `/icons/disciplines/${fileStem}.webp`;
}

/** Ordered URLs: webp → png → neutral SVG. */
export function disciplineIconCandidates(rawKey: string): string[] {
  const slug = resolveDisciplineIconSlug(rawKey);
  const stem = slugToIconStem(slug);
  const primary = DISCIPLINE_ICON_FILE_STEM[slug] ?? stem;
  const ordered: string[] = [
    `/icons/disciplines/${primary}.webp`,
    `/icons/disciplines/${primary}.png`,
  ];
  if (primary !== stem) {
    ordered.push(`/icons/disciplines/${stem}.webp`, `/icons/disciplines/${stem}.png`);
  }
  ordered.push(FALLBACK_DISCIPLINE_ICON);
  return [...new Set(ordered)];
}
