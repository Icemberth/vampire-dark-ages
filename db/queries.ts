import { randomUUID } from "node:crypto";
import { DRAFT_CHARACTER_NAME, type CharacterRow } from "@/lib/character";
import { db } from "./index";
import { characters, clans, clanDisciplines, codex } from "./schema";
import { and, eq } from "drizzle-orm";

type ClanSelectRow = {
  id: string;
  name: string;
  subName: string | null;
  nickname: string | null;
  isBloodline: boolean | null;
  weakness: string;
  description: string | null;
  disciplineName: string | null;
};

type ClanWithDisciplines = Omit<ClanSelectRow, "disciplineName"> & {
  disciplines: string[];
};

export async function getAllClans(locale: string) {
  const data: ClanSelectRow[] = await db
    .select({
      id: clans.id,
      name: clans.name,
      subName: clans.subName,
      nickname: clans.nickname,
      isBloodline: clans.isBloodline,
      weakness: clans.weakness,
      description: clans.description,
      disciplineName: clanDisciplines.disciplineName,
    })
    .from(clans)
    .leftJoin(clanDisciplines, eq(clans.id, clanDisciplines.clanId))
    .where(eq(clans.locale, locale));

  // Grouping disciplines by clan so we don't have duplicate clan cards
  return data.reduce<ClanWithDisciplines[]>((acc, current) => {
    const existing = acc.find((c) => c.id === current.id);
    if (existing) {
      if (current.disciplineName)
        existing.disciplines.push(current.disciplineName);
    } else {
      const { disciplineName, ...rest } = current;
      acc.push({
        ...rest,
        disciplines: disciplineName ? [disciplineName] : [],
      });
    }
    return acc;
  }, []);
}

export type ClanDisciplineCodexRow = {
  /** Normalized key from `clan_disciplines.discipline_name` (e.g. celerity). */
  name: string;
  displayName: string;
  description: string | null;
};

/**
 * Junction rows for the clan, joined to codex lore for the requested locale when present.
 */
export async function getClanDisciplinesWithCodex(
  clanId: string,
  locale: string,
): Promise<ClanDisciplineCodexRow[]> {
  const rows = await db
    .select({
      disciplineKey: clanDisciplines.disciplineName,
      displayName: codex.displayName,
      description: codex.description,
    })
    .from(clanDisciplines)
    .leftJoin(
      codex,
      and(
        eq(codex.name, clanDisciplines.disciplineName),
        eq(codex.locale, locale),
      ),
    )
    .where(eq(clanDisciplines.clanId, clanId));

  return rows.map((r) => ({
    name: r.disciplineKey,
    displayName: r.displayName ?? r.disciplineKey,
    description: r.description,
  }));
}

export async function getCharactersForUser(userId: string) {
  return await db
    .select({
      id: characters.id,
      name: characters.name,
      concept: characters.concept,
      nature: characters.nature,
      demeanor: characters.demeanor,
      generation: characters.generation,
      clanName: clans.name,
      createdAt: characters.createdAt,
    })
    .from(characters)
    .leftJoin(clans, eq(characters.clanId, clans.id))
    .where(eq(characters.userId, userId));
}

export type { CharacterRow };
export { DRAFT_CHARACTER_NAME };

/**
 * Inserts a new character row and returns its id. Used when entering the builder so the
 * list and other views can key off a stable id while the user fills the wizard.
 */
export async function createDraftCharacter(
  userId: string,
  locale: string,
): Promise<string> {
  const id = randomUUID();
  const now = new Date();
  await db.insert(characters).values({
    id,
    userId,
    name: DRAFT_CHARACTER_NAME(locale),
    generation: 12,
    locale,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function getCharacterByIdForUser(
  id: string,
  userId: string,
): Promise<CharacterRow | null> {
  const [row] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .limit(1);
  return row ?? null;
}

export type CharacterWizardPatch = {
  name?: string;
  concept?: string | null;
  nature?: string | null;
  demeanor?: string | null;
  generation?: number | null;
  clanId?: string | null;
};

export async function updateCharacterForUser(
  id: string,
  userId: string,
  patch: CharacterWizardPatch,
): Promise<boolean> {
  const [row] = await db
    .update(characters)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .returning({ id: characters.id });
  return row != null;
}

export async function deleteCharacterForUser(
  id: string,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .delete(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .returning({ id: characters.id });
  return row != null;
}
