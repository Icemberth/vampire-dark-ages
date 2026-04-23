import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// 1. The Clan & Bloodline Table
export const clans = pgTable("clans", {
  id: serial("id").primaryKey(),
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
export const clanDisciplines = pgTable("clan_disciplines", {
  id: serial("id").primaryKey(),
  clanId: integer("clan_id").references(() => clans.id),
  disciplineId: integer("discipline_id").references(() => disciplines.id),
});
