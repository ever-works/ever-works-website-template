import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a dummy DB client for when DATABASE_URL is not available
class DummyDb {
  async query() {
    console.warn("Database operations are disabled: DATABASE_URL is not set");
    return [];
  }

  async transaction(callback: (tx: DummyDb) => Promise<unknown>) {
    console.warn("Database transactions are disabled: DATABASE_URL is not set");
    return callback(this);
  }

  select() {
    return this.createDummyQuery();
  }

  insert() {
    return this.createDummyQuery();
  }

  update() {
    return this.createDummyQuery();
  }

  delete() {
    return this.createDummyQuery();
  }

  private createDummyQuery() {
    const dummyQuery = {
      from: () => dummyQuery,
      where: () => dummyQuery,
      values: () => dummyQuery,
      set: () => dummyQuery,
      returning: () => dummyQuery,
      limit: () => dummyQuery,
      offset: () => dummyQuery,
      orderBy: () => dummyQuery,
      execute: async () => {
        console.warn("Database operations are disabled: DATABASE_URL is not set");
        return [];
      }
    };
    return dummyQuery;
  }
}

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  db: ReturnType<typeof drizzle> | DummyDb;
};

let db: ReturnType<typeof drizzle> | DummyDb;
let isRealConnection = false;

const getPoolSize = (): number => {
  const envPoolSize = process.env.DB_POOL_SIZE;
  if (envPoolSize) {
    const parsed = parseInt(envPoolSize, 10);
    return isNaN(parsed) ? 20 : parsed;
  }
  return process.env.NODE_ENV === 'production' ? 20 : 10;
};

// Only initialize the database if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const poolSize = getPoolSize();
    const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL, {
      max: poolSize,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
    globalForDb.conn = conn;
    db = drizzle(conn, { schema });
    globalForDb.db = db;
    isRealConnection = true;
    console.log(`Database connection established successfully with pool size: ${poolSize}`);
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    db = new DummyDb();
    globalForDb.db = db;
    isRealConnection = false;
  }
} else {
  console.warn("DATABASE_URL is not set. Database features will be disabled.");
  db = new DummyDb();
  globalForDb.db = db;
  isRealConnection = false;
}

// Add a method to check if we have a real database connection
if (db && typeof db === 'object') {
  (db as ReturnType<typeof drizzle> & { isRealConnection: () => boolean }).isRealConnection = () => isRealConnection;
}

export { db };
