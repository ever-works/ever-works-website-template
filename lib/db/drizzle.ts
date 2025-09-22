import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: ReturnType<typeof drizzle> | undefined;
};

const getPoolSize = (): number => {
  const envPoolSize = process.env.DB_POOL_SIZE;
  if (envPoolSize) {
    const parsed = parseInt(envPoolSize, 10);
    return isNaN(parsed) ? 20 : parsed;
  }
  return process.env.NODE_ENV === 'production' ? 20 : 10;
};

// Only initialize the database if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

let db: ReturnType<typeof drizzle>;

try {
  const poolSize = getPoolSize();
  const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL, {
    max: poolSize,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  globalForDb.conn = conn;
  db = globalForDb.db ?? drizzle(conn, { schema });
  globalForDb.db = db;
  console.log(`Database connection established successfully with pool size: ${poolSize}`);
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  throw error;
}

export { db };
