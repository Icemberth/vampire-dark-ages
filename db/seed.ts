import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "./connectionString";
import { seedClansTable } from "./data/clans";
import { seedDisciplinesTable } from "./data/disciplines";
import {
  seedCodexArchetypes,
  seedCodexAttributes,
  seedCodexMeta,
} from "./seed-codex";

dotenv.config({ path: ".env.local" });
const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

async function main() {
  console.log("🦇 Nocturnus Database Seed Initiated...");

  try {
    // 1. Core Attributes (The Rules)
    await seedCodexAttributes();
    // 2. Creation Meta
    await seedCodexMeta();
    // 3. Archetypes
    await seedCodexArchetypes();

    // 2. Discipline Lore
    await seedDisciplinesTable();

    // 3. Clans and Relationships
    await seedClansTable();

    console.log("🏁 All data successfully bound to the database.");
    process.exit(0);
  } catch (err) {
    console.error("💀 Master seed failed:", err);
    process.exit(1);
  }
}

main();
