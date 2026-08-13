import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = new URL("../netlify/database/migrations", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);

const { rows: appliedRows } = await client.query("SELECT name FROM _migrations");
const applied = new Set(appliedRows.map((r) => r.name));

const dirs = (await readdir(MIGRATIONS_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let ranAny = false;
for (const dir of dirs) {
  if (applied.has(dir)) continue;
  ranAny = true;
  const sql = await readFile(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8");
  process.stdout.write(`Applying ${dir}... `);
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query("INSERT INTO _migrations (name) VALUES ($1)", [dir]);
    await client.query("COMMIT");
    console.log("ok");
  } catch (err) {
    await client.query("ROLLBACK");
    console.log("FAILED");
    throw err;
  }
}
if (!ranAny) console.log("Nothing to apply — up to date.");

await client.end();
