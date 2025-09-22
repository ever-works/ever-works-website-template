import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create a dummy DB client for when DATABASE_URL is not available
class DummyDb {
  async query() {
    console.warn("Database operations are disabled: DATABASE_URL is not set");
    return [];
  }

  async transaction<T>(callback: (tx: DummyDb) => Promise<T>): Promise<T> {
    console.warn("Database transactions are disabled: DATABASE_URL is not set");
    return callback(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select(fields?: unknown) {
    return this.createDummyQuery();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  insert(table: unknown) {
    return this.createDummyQuery();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(table: unknown) {
    return this.createDummyQuery();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(table: unknown) {
    return this.createDummyQuery();
  }

  private createDummyQuery() {
    const emptyResult = Promise.resolve([]);

    const dummyQuery = {
      from: () => dummyQuery,
      where: () => dummyQuery,
      values: () => dummyQuery,
      set: () => dummyQuery,
      returning: () => emptyResult,
      limit: () => dummyQuery,
      offset: () => dummyQuery,
      orderBy: () => dummyQuery,
      groupBy: () => dummyQuery,
      having: () => dummyQuery,
      leftJoin: () => dummyQuery,
      rightJoin: () => dummyQuery,
      innerJoin: () => dummyQuery,
      fullJoin: () => dummyQuery,
      onConflictDoNothing: () => dummyQuery,
      onConflictDoUpdate: () => dummyQuery,
      onDuplicateKeyUpdate: () => dummyQuery,
      execute: async () => {
        console.warn("Database operations are disabled: DATABASE_URL is not set");
        return [];
      },
      then: (onFulfilled: (value: never[]) => void) => {
        console.warn("Database operations are disabled: DATABASE_URL is not set");
        // For count queries, return an object with count property
        const result = [{ count: 0 }] as never[];
        return Promise.resolve(result).then(onFulfilled);
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
