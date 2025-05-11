import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a dummy DB client for when DATABASE_URL is not available
class DummyDb {
  async query() {
    console.warn("Database operations are disabled: DATABASE_URL is not set");
    return [];
  }
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: any;
};

let db: any;

// Only initialize the database if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL);
    globalForDb.conn = conn;
    db = drizzle(conn, { schema });
    globalForDb.db = db;
  } catch (error) {
    console.warn("Failed to initialize database connection:", error);
    db = new DummyDb();
    globalForDb.db = db;
  }
} else {
  console.warn("DATABASE_URL is not set. Database features will be disabled.");
  db = new DummyDb();
  globalForDb.db = db;
}

export { db };
