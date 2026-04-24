import { randomUUID } from "node:crypto";
import { db } from "./index";
import { characters, clans, clanDisciplines, disciplines } from "./schema";
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

export async function getAllClans() {
  const data: ClanSelectRow[] = await db
    .select({
      id: clans.id,
      name: clans.name,
      subName: clans.subName,
      nickname: clans.nickname,
      isBloodline: clans.isBloodline,
      weakness: clans.weakness,
      description: clans.description,
      disciplineName: disciplines.name,
    })
    .from(clans)
    .leftJoin(clanDisciplines, eq(clans.id, clanDisciplines.clanId))
    .leftJoin(disciplines, eq(clanDisciplines.disciplineId, disciplines.id));

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

/** Placeholder name for rows created at the start of the character builder wizard. */
export const DRAFT_CHARACTER_NAME = "Unnamed character";

export type CharacterRow = typeof characters.$inferSelect;

/**
 * Inserts a new character row and returns its id. Used when entering the builder so the
 * list and other views can key off a stable id while the user fills the wizard.
 */
export async function createDraftCharacter(userId: string): Promise<string> {
  const id = randomUUID();
  await db.insert(characters).values({
    id,
    userId,
    name: DRAFT_CHARACTER_NAME,
    generation: 12,
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
