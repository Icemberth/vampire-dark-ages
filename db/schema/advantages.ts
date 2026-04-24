import { pgTable, uuid, integer, text, jsonb } from "drizzle-orm/pg-core";
import { characters } from "./character";

export const advantages = pgTable("advantages", {
  characterId: uuid("character_id")
    .primaryKey()
    .references(() => characters.id, { onDelete: "cascade" }),

  // --- VIRTUES ---
  // These usually start at 1 dot automatically
  conscience: integer("conscience").default(1).notNull(),
  selfControl: integer("self_control").default(1).notNull(),
  courage: integer("courage").default(1).notNull(),

  // --- MORALITY (The Road) ---
  roadName: text("road_name").default("Road of Humanity").notNull(),
  roadValue: integer("road_value").default(5).notNull(), // Usually Conscience + Self-Control

  // --- POOLS ---
  willpower: integer("willpower").default(5).notNull(), // Usually equal to Courage
  willpowerCurrent: integer("willpower_current").default(5).notNull(),
  bloodPoolMax: integer("blood_pool_max").default(10).notNull(), // Depends on Generation
  bloodPoolCurrent: integer("blood_pool_current").default(10).notNull(),

  // --- BACKGROUNDS ---
  // Backgrounds are flexible, so we store them as a JSON object
  // Format: { "Generation": 3, "Resources": 2, "Allies": 1 }
  backgrounds: jsonb("backgrounds").default({}).notNull(),
});
