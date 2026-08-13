import pg from "pg";

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.DATABASE_URL;

// Dependency order: parents before children (FK constraints).
const TABLES = [
  "couples",
  "weddings",
  "guests",
  "itinerary_items",
  "announcements",
  "photos",
  "shuttles",
  "wedding_tables",
  "stripe_webhook_events",
];

const source = new pg.Client({ connectionString: SOURCE_URL });
const target = new pg.Client({ connectionString: TARGET_URL });
await source.connect();
await target.connect();

for (const table of TABLES) {
  const { rows } = await source.query(`SELECT * FROM ${table}`);
  if (rows.length === 0) {
    console.log(`${table}: 0 rows, skipping`);
    continue;
  }
  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  let inserted = 0;
  for (const row of rows) {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const values = columns.map((c) => row[c]);
    await target.query(
      `INSERT INTO ${table} (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );
    inserted++;
  }
  console.log(`${table}: copied ${inserted} rows`);
}

// Realign SERIAL sequences with the copied data so future inserts don't collide.
const SEQUENCE_TABLES = [
  "couples",
  "weddings",
  "guests",
  "itinerary_items",
  "announcements",
  "photos",
  "shuttles",
  "wedding_tables",
];
for (const table of SEQUENCE_TABLES) {
  await target.query(
    `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`
  );
  console.log(`${table}: sequence realigned`);
}

await source.end();
await target.end();
console.log("\nDone.");
