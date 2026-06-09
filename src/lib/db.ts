import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb>;
};

function createDb() {
  const dbPath = process.env.DATABASE_URL
    ? path.resolve(process.cwd(), process.env.DATABASE_URL)
    : path.resolve(process.cwd(), "remind-me-please.db");

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
