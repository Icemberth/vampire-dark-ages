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
} from "drizzle-orm/pg-core";

// 1. The Clan & Bloodline Table
export const clans = pgTable("clans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  subName: varchar("sub_name", { length: 100 }), // "Healer", "Warrior", etc.
  nickname: varchar("nickname", { length: 100 }),
  isBloodline: boolean("is_bloodline").default(false),
  parentClanId: integer("parent_clan_id"), // Links a bloodline to its parent clan
  weakness: text("weakness").notNull(),
  weaknessDescription: text("weakness_description"), // Exact PDF Text
  description: text("description"),
});

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
    // Change this from integer() to uuid()
    clanId: uuid("clan_id")
      .notNull()
      .references(() => clans.id, { onDelete: "cascade" }),

    disciplineId: integer("discipline_id") // Keep this as integer if disciplines.id is still an integer
      .notNull()
      .references(() => disciplines.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.clanId, t.disciplineId] }),
  }),
);

export const codex = pgTable("codex", {
  id: uuid("id").primaryKey().defaultRandom(),

  // 'attribute', 'ability', 'virtue', 'merit', 'flaw', 'background'
  category: text("category").notNull(),

  // 'physical', 'talent', 'mental', etc. (for grouping in the UI)
  subcategory: text("subcategory"),

  name: text("name").notNull().unique(), // 'strength', 'brawl', 'iron_will'
  displayName: text("display_name").notNull(), // 'Strength', 'Iron Will'

  description: text("description").notNull(), // The general PDF intro text

  // Specific text for each dot (1-5)
  // Example: { "1": "Poor...", "2": "Average..." }
  dotDescriptions: jsonb("dot_descriptions"),

  // For Merits/Flaws: point cost (e.g., -2 for a Flaw, 3 for a Merit)
  pointValue: integer("point_value"),
});
