import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// This explicitly loads your .env.local file
dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // This will now successfully find the variable in .env.local
    url: process.env.POSTGRES_URL!,
  },
});
