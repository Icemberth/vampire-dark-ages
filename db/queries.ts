import { db } from "./index";
import { clans, clanDisciplines, disciplines } from "./schema";
import { eq } from "drizzle-orm";

export async function getAllClans() {
  const data = await db
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
  return data.reduce((acc: any[], current) => {
    const existing = acc.find((c) => c.id === current.id);
    if (existing) {
      if (current.disciplineName)
        existing.disciplines.push(current.disciplineName);
    } else {
      acc.push({
        ...current,
        disciplines: current.disciplineName ? [current.disciplineName] : [],
      });
    }
    return acc;
  }, []);
}
