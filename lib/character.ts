import { characters } from "@/db/schema";

/** Cannot create another once this many rows exist (disabled when count > 1). */
export const MAX_CHARACTERS_PER_USER = 2;

/** Default name for a row created in the character builder; safe to import in client code. */
export const DRAFT_CHARACTER_NAME = (lang: string) => {
  switch ((lang || "en").toLowerCase()) {
    case "es":
      return "Sin nombre";
    case "en":
    default:
      return "Unnamed character";
  }
};

/** Row shape for the `character` table; derived from schema only (no DB client). */
export type CharacterRow = typeof characters.$inferSelect;
