import {
  timestamp,
  primaryKey,
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

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
