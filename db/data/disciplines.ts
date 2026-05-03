import { db } from "../index";
import { codex } from "../schema/world";
import disciplinesMaster from "./json/disciplines.json";

export async function seedDisciplinesTable() {
  console.log("💾 Seeding Disciplines into Codex (EN/ES)...");

  try {
    for (const entry of disciplinesMaster) {
      await db
        .insert(codex)
        .values({
          locale: entry.locale,
          category: "discipline",
          name: entry.name, // The unique key (e.g., 'animalism')
          displayName: entry.displayName,
          description: entry.description,
          dotDescriptions: entry.dotDescriptions,
        })
        .onConflictDoUpdate({
          target: [codex.name, codex.locale],
          set: {
            displayName: entry.displayName,
            description: entry.description,
            dotDescriptions: entry.dotDescriptions,
          },
        });
    }
    console.log(
      `✅ Successfully seeded ${disciplinesMaster.length} discipline entries.`,
    );
  } catch (error) {
    console.error("❌ Error seeding Disciplines:", error);
    throw error;
  }
}
