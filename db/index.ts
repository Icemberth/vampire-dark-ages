import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// This pulls your database URL from the .env.local file we created
const sql = neon(process.env.POSTGRES_URL!);

// This exports the 'db' object so you can use it anywhere in your app
export const db = drizzle(sql, { schema });
