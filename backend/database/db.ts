
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../shared/schema";

// Use the DATABASE_URL from the environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres",
});

export const db = drizzle(pool, { schema });
