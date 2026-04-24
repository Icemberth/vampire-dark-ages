import { characters } from "@/db/schema";

/** Default name for a row created in the character builder; safe to import in client code. */
export const DRAFT_CHARACTER_NAME = "Unnamed character" as const;

/** Row shape for the `character` table; derived from schema only (no DB client). */
export type CharacterRow = typeof characters.$inferSelect;
