import { db } from "./index";
import { codex } from "./schema/world";
import codexAttributes from "./data/json/codexAttributes.json";
import codexCreationMeta from "./data/json/codexCreationMeta.json";

export async function seedCodexAttributes() {
  console.log("💾 Seeding Attributes into Codex...");

  try {
    for (const entry of codexAttributes) {
      await db
        .insert(codex)
        .values({
          locale: entry.locale,
          category: entry.category,
          name: entry.name,
          displayName: entry.displayName,
          description: entry.description,
          subcategory: entry.subcategory,
          dotDescriptions: entry.dotDescriptions,
        })
        .onConflictDoUpdate({
          target: [codex.name, codex.locale],
          set: {
            displayName: entry.displayName,
            description: entry.description,
            dotDescriptions: entry.dotDescriptions,
            subcategory: entry.subcategory,
          },
        });
    }
    console.log(
      `✅ Successfully seeded ${codexAttributes.length} attribute entries.`,
    );
  } catch (error) {
    console.error("❌ Error seeding Attributes:", error);
    throw error;
  }
}

export async function seedCodexMeta() {
  console.log("💾 Seeding Creation Meta into Codex...");
  for (const entry of codexCreationMeta) {
    await db
      .insert(codex)
      .values(entry)
      .onConflictDoUpdate({
        target: [codex.name, codex.locale],
        set: {
          displayName: entry.displayName,
          description: entry.description,
        },
      });
  }
  console.log(
    `✅ Successfully seeded ${codexCreationMeta.length} creation meta entries.`,
  );
}
