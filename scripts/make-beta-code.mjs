// Mints a single-use free-beta code to email to someone who asked for one.
// Usage: node --env-file=.env.local scripts/make-beta-code.mjs "Their name or email"
import pg from "pg";
import { randomBytes } from "crypto";

const label = process.argv[2];
if (!label) {
  console.error('Usage: node --env-file=.env.local scripts/make-beta-code.mjs "<label>"');
  process.exit(1);
}

// Unambiguous alphabet (no 0/O/1/I) so it survives being read out or retyped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const bytes = randomBytes(8);
const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query("INSERT INTO beta_codes (code, label) VALUES ($1, $2)", [code, label]);
console.log(`Code for ${label}: ${code}`);
console.log(`Signup link (also works as their invite): https://entrevow.com/signup?invite=${code}`);
await client.end();
