import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { getDatabaseUrl } from "./db/connectionString";

dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  // This tells Drizzle to scan every file in the schema folder
  schema: "./db/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
