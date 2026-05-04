import {
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  varchar,
  boolean,
  serial,
  jsonb,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/pg-core";

// 1. The Clan & Bloodline Table
export const clans = pgTable(
  "clans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    locale: text("locale").default("en").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    subName: varchar("sub_name", { length: 100 }), // "Healer", "Warrior", etc.
    nickname: varchar("nickname", { length: 100 }),
    isBloodline: boolean("is_bloodline").default(false),
    parentClanId: uuid("parent_clan_id"),
    weakness: text("weakness").notNull(),
    weaknessDescription: text("weakness_description"), // Exact PDF Text
    description: text("description"),
  },
  (t) => ({
    parentClanFk: foreignKey({
      columns: [t.parentClanId],
      foreignColumns: [t.id],
    }).onDelete("set null"),
    clansNameLocaleIdx: uniqueIndex("clans_name_locale_idx").on(
      t.name,
      t.locale,
    ),
  }),
);

// 2. The Disciplines Table
export const disciplines = pgTable("disciplines", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});

// 3. The Junction Table (THE GLUE)
export const clanDisciplines = pgTable(
  "clan_disciplines",
  {
    clanId: uuid("clan_id")
      .notNull()
      .references(() => clans.id, { onDelete: "cascade" }),
    // We reference the 'name' in codex because disciplines are categorized there
    disciplineName: text("discipline_name").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.clanId, table.disciplineName] }),
  }),
);

export const codex = pgTable(
  "codex",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Defaulting to 'en' keeps your current data working.
    locale: text("locale").default("en").notNull(),
    // 'attribute', 'ability', 'virtue', 'merit', 'flaw', 'background'
    category: text("category").notNull(),

    // 'physical', 'talent', 'mental', etc. (for grouping in the UI)
    subcategory: text("subcategory"),

    name: text("name").notNull(), // 'strength', 'brawl', 'iron_will'
    displayName: text("display_name").notNull(), // 'Strength', 'Iron Will'

    description: text("description").notNull(), // The general PDF intro text

    longDescription: text("long_description"),

    // Specific text for each dot (1-5)
    // Example: { "1": "Poor...", "2": "Average..." }
    dotDescriptions: jsonb("dot_descriptions"),

    // For Merits/Flaws: point cost (e.g., -2 for a Flaw, 3 for a Merit)
    pointValue: integer("point_value"),
  },
  (table) => {
    return {
      nameLocaleIndex: uniqueIndex("name_locale_idx").on(
        table.name,
        table.locale,
      ),
    };
  },
);
