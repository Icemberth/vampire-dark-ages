import type { Dictionary } from "@/lib/i18n/dictionaries";

export type ClanBookRow = {
  id: string;
  name: string;
  emblemSrc: string;
  subName: string | null;
  nickname: string | null;
  isBloodline: boolean;
  weakness: string;
  description: string | null;
  disciplines: {
    key: string;
    displayName: string;
    description: string | null;
  }[];
};

/** i18n slice used by the left parchment codex page. */
export type ClanCodexLeftCopy = Pick<
  Dictionary["clansPage"],
  | "lineageBadge"
  | "bloodline"
  | "defaultTagline"
  | "record"
  | "recordFallback"
  | "weakness"
  | "motto"
  | "disciplines"
  | "disciplineNoLore"
  | "noDisciplines"
>;
