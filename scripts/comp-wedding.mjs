// Marks a wedding as paid without a real Stripe charge -- for comping beta
// couples (or the demo account). Mirrors what a real checkout.session.completed
// webhook does to weddings.plan_tier/paid_at, just without a payment behind it.
//
// Usage: node --env-file=.env.local scripts/comp-wedding.mjs <weddingId> <essentials|full>
import pg from "pg";

const [weddingIdArg, tierArg] = process.argv.slice(2);
const weddingId = Number(weddingIdArg);
const tier = tierArg;

if (!Number.isInteger(weddingId) || !["essentials", "full"].includes(tier)) {
  console.error("Usage: node --env-file=.env.local scripts/comp-wedding.mjs <weddingId> <essentials|full>");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `UPDATE weddings SET plan_tier = $1, paid_at = NOW()
   WHERE id = $2
   RETURNING id, title, plan_tier, paid_at`,
  [tier, weddingId]
);

if (rows.length === 0) {
  console.error(`No wedding with id ${weddingId} found.`);
  process.exitCode = 1;
} else {
  console.log(`Comped: ${rows[0].title} (id ${rows[0].id}) -> ${rows[0].plan_tier}, paid_at ${rows[0].paid_at}`);
}

await client.end();
