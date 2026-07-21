import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { schemaOrder, validateSchemaRegistry } from "./schema";

// Native Bun ANSI Colors
const C = {
  green: (t: string) => `${Bun.color("green", "ansi")}${t}\x1b[0m`,
  red: (t: string) => `${Bun.color("red", "ansi")}${t}\x1b[0m`,
  yellow: (t: string) => `${Bun.color("yellow", "ansi")}${t}\x1b[0m`,
  cyan: (t: string) => `${Bun.color("cyan", "ansi")}${t}\x1b[0m`,
  gray: (t: string) => `${Bun.color("gray", "ansi")}${t}\x1b[0m`,
};

const isDev = process.env.NODE_ENV !== "production";
const projectRoot = process.cwd();
const dbDir = resolve(projectRoot, "data");

try {
  mkdirSync(dbDir, { recursive: true });
} catch (e) {
  console.error(
    C.red("[DB]") +
      ` Gagal membuat direktori database (${dbDir}): ${(e as Error).message}`,
  );
  process.exit(1);
}

const dbPath = resolve(
  dbDir,
  isDev ? "dev.db" : process.env.DB_PATH || "data.db",
).replace(/\\/g, "/");

console.log(`${C.cyan("[DB]")} Initializing SQLite at: ${C.gray(dbPath)}`);

let db: Database;
try {
  db = new Database(dbPath, { create: true });
} catch (e) {
  console.error(
    `${C.red("[DB]")} Gagal membuka database: ${(e as Error).message}`,
  );
  process.exit(1);
}

try {
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");
  db.run("PRAGMA busy_timeout = 5000;");
} catch (e) {
  console.warn(
    `${C.yellow("[DB]")} Gagal mengatur PRAGMA: ${(e as Error).message}`,
  );
}

validateSchemaRegistry();

for (const schema of schemaOrder) {
  try {
    db.run(schema.content);
    console.log(`${C.green("  [OK] ")}Schema executed: ${schema.name}`);
  } catch (e) {
    console.error(
      C.red("  [FAIL] ") +
        `Gagal mengeksekusi schema ${schema.name}: ${(e as Error).message}`,
    );
    process.exit(1);
  }
}

export default db;
