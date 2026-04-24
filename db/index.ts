import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "./connectionString";
import * as schema from "./schema/index";

const sql = neon(getDatabaseUrl());

// This exports the 'db' object so you can use it anywhere in your app
export const db = drizzle(sql, { schema });
