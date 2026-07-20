import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { schemaOrder, validateSchemaRegistry } from "./schema";

const isDev = process.env.NODE_ENV !== "production";
const projectRoot = process.cwd();
const dbDir = resolve(projectRoot, "data");

try {
  mkdirSync(dbDir, { recursive: true });
} catch (e) {
  console.error(
    `[DB] Gagal membuat direktori database (${dbDir}): ${(e as Error).message}`,
  );
  process.exit(1);
}

const dbPath = resolve(
  dbDir,
  isDev ? "dev.db" : process.env.DB_PATH || "data.db",
).replace(/\\/g, "/");

console.log(`[DB] Initializing SQLite at: ${dbPath}`);

let db: Database;
try {
  db = new Database(dbPath, { create: true });
} catch (e) {
  console.error(`[DB] Gagal membuka database: ${(e as Error).message}`);
  process.exit(1);
}

try {
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA busy_timeout = 5000;");
} catch (e) {
  console.warn(`[DB] Gagal mengatur PRAGMA: ${(e as Error).message}`);
}

// Validasi (kini hanya formalitas)
validateSchemaRegistry();

// Eksekusi schema yang sudah ter-embed
for (const schema of schemaOrder) {
  try {
    db.run(schema.content);
    console.log(`[DB] Schema executed: ${schema.name}`);
  } catch (e) {
    console.error(
      `[DB] Gagal mengeksekusi schema ${schema.name}: ${(e as Error).message}`,
    );
    process.exit(1);
  }
}

export default db;
