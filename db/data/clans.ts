import { db } from "../index";
import { clanDisciplines, clans, codex } from "../schema/world";
import { eq, and } from "drizzle-orm";
import clansMaster from "./json/clans.json";

export async function seedClansTable() {
  console.log("💾 Phase 1: Seeding mechanical Clan data and Lore...");

  try {
    // Pass 1: Insert all clans and their basic lore
    for (const entry of clansMaster) {
      // 1. Insert into the 'clans' table (Mechanics)
      await db
        .insert(clans)
        .values({
          name: entry.name,
          locale: entry.locale,
          description: entry.description,
          weakness: entry.weaknessName,
          weaknessDescription: entry.weaknessDescription,
          isBloodline: entry.isBloodline,
          subName: entry.subName,
          nickname: entry.nickname,
          parentClanId: null, // 👈 Explicitly set to null for the first pass
        })
        .onConflictDoUpdate({
          target: [clans.name, clans.locale],
          set: {
            nickname: entry.nickname,
            description: entry.description,
            weakness: entry.weaknessName,
            weaknessDescription: entry.weaknessDescription,
            isBloodline: entry.isBloodline,
            subName: entry.subName,
          },
        });

      // 2. Insert into the 'codex' table (Lore/Sidebar content)
      await db
        .insert(codex)
        .values({
          locale: entry.locale,
          category: "clan_lore",
          name: entry.name.toLowerCase().replace(/\s+/g, "_"),
          displayName: entry.name,
          description: entry.description,
          dotDescriptions: {
            nickname: entry.nickname,
            weakness: entry.weaknessName,
            disciplines: entry.disciplines.join(", "),
          },
        })
        .onConflictDoUpdate({
          target: [codex.name, codex.locale],
          set: {
            description: entry.description,
            dotDescriptions: {
              nickname: entry.nickname,
              weakness: entry.weaknessName,
              disciplines: entry.disciplines.join(", "),
            },
          },
        });
    }

    console.log("💾 Phase 2: Linking Bloodlines to Parent Clans...");

    // Pass 2: Update parentClanId for bloodlines
    const allClans = await db.select().from(clans);

    for (const entry of clansMaster) {
      if (entry.isBloodline && entry.parentClanName) {
        // Find the parent ID by matching the name and locale
        const parent = allClans.find(
          (c) => c.name === entry.parentClanName && c.locale === entry.locale,
        );

        if (parent) {
          await db
            .update(clans)
            .set({ parentClanId: parent.id })
            .where(
              and(eq(clans.name, entry.name), eq(clans.locale, entry.locale)),
            );
        }
      }
    }
    console.log("🔗 Phase 3: Linking Clans to Disciplines...");

    for (const entry of clansMaster) {
      // Find the specific clan record for this locale
      const currentClan = allClans.find(
        (c) => c.name === entry.name && c.locale === entry.locale,
      );

      if (currentClan && entry.disciplines) {
        for (const discName of entry.disciplines) {
          // We normalize the name to lowercase to match the codex keys
          const normalizedDisc = discName.toLowerCase().trim();

          await db
            .insert(clanDisciplines)
            .values({
              clanId: currentClan.id,
              disciplineName: normalizedDisc,
            })
            .onConflictDoNothing(); // Prevent errors on re-runs
        }
      }
    }

    console.log(`✅ Successfully seeded ${clansMaster.length} clan entries.`);
  } catch (error) {
    console.error("❌ Error seeding Clans:", error);
    throw error;
  }
}
