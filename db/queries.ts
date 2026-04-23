import { db } from "./index";
import { characters, clans, clanDisciplines, disciplines } from "./schema";
import { eq } from "drizzle-orm";

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
