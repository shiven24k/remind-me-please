import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./remind-me-please.db",
  },
} satisfies Config;
