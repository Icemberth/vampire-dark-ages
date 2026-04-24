import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { clans, codex } from "./world";

export const characters = pgTable("character", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),

  // The link to the User who owns this character
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // The link to the Clan data (where the weaknessDescription lives)
  clanId: uuid("clanId").references(() => clans.id),

  // Basic Dark Ages Bio
  concept: text("concept"),
  nature: text("nature"),
  demeanor: text("demeanor"),
  generation: integer("generation").default(12),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Physical, Social, Mental stats
export const attributes = pgTable("attributes", {
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .primaryKey(),
  strength: integer("strength").default(1),
  dexterity: integer("dexterity").default(1),
  stamina: integer("stamina").default(1),
  charisma: integer("charisma").default(1),
  manipulation: integer("manipulation").default(1),
  appearance: integer("appearance").default(1),
  perception: integer("perception").default(1),
  intelligence: integer("intelligence").default(1),
  wits: integer("wits").default(1),
});

// Talents, Skills, Knowledges
export const abilities = pgTable("abilities", {
  // Primary Key linked 1:1 to the Character
  characterId: uuid("character_id")
    .primaryKey()
    .references(() => characters.id, { onDelete: "cascade" }),

  // --- TALENTS ---
  alertness: integer("alertness").default(0).notNull(),
  athletics: integer("athletics").default(0).notNull(),
  awareness: integer("awareness").default(0).notNull(),
  brawl: integer("brawl").default(0).notNull(),
  empathy: integer("empathy").default(0).notNull(),
  expression: integer("expression").default(0).notNull(),
  intimidation: integer("intimidation").default(0).notNull(),
  leadership: integer("leadership").default(0).notNull(),
  streetwise: integer("streetwise").default(0).notNull(),
  subterfuge: integer("subterfuge").default(0).notNull(),

  // --- SKILLS ---
  animalKen: integer("animal_ken").default(0).notNull(),
  archery: integer("archery").default(0).notNull(),
  commerce: integer("commerce").default(0).notNull(),
  crafts: integer("crafts").default(0).notNull(),
  etiquette: integer("etiquette").default(0).notNull(),
  herbalism: integer("herbalism").default(0).notNull(),
  melee: integer("melee").default(0).notNull(),
  ride: integer("ride").default(0).notNull(),
  stealth: integer("stealth").default(0).notNull(),
  survival: integer("survival").default(0).notNull(),

  // --- KNOWLEDGES ---
  academics: integer("academics").default(0).notNull(),
  hearthWisdom: integer("hearth_wisdom").default(0).notNull(),
  investigation: integer("investigation").default(0).notNull(),
  law: integer("law").default(0).notNull(),
  medicine: integer("medicine").default(0).notNull(),
  occult: integer("occult").default(0).notNull(),
  politics: integer("politics").default(0).notNull(),
  seneschal: integer("seneschal").default(0).notNull(),
  theology: integer("theology").default(0).notNull(),
  lingua: integer("lingua").default(0).notNull(), // V20 DA replacement for "Linguistics"
});

// Backgrounds, Virtues, and Road
export const advantages = pgTable("advantages", {
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .primaryKey(),
  roadName: text("road_name").default("Road of Humanity"),
  roadValue: integer("road_value").default(5),
  willpower: integer("willpower").default(5),
  conscience: integer("conscience").default(1),
  selfControl: integer("self_control").default(1),
  courage: integer("courage").default(1),
});

// For things a character MIGHT have (Merits, Flaws, Backgrounds)
export const characterTraits = pgTable("character_traits", {
  id: uuid("id").primaryKey().defaultRandom(),
  characterId: uuid("character_id").references(() => characters.id),
  traitId: uuid("trait_id").references(() => codex.id), // Links to the Codex
  currentValue: integer("current_value").default(1), // How many dots they bought
  note: text("note"), // For things like "Specialty" or "Contact Name"
});
