import pg from "pg";
import { waddler } from "waddler/node-postgres";

let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
  return pool;
}

let sql: ReturnType<typeof waddler> | undefined;

export function db() {
  if (!sql) {
    sql = waddler({ client: getPool() });
  }
  return { sql };
}

// Runs `fn` against a `sql` tag bound to a single dedicated connection wrapped
// in BEGIN/COMMIT/ROLLBACK — every query fn issues through that `sql` either
// all commit together or all roll back together. Use for any multi-row
// mutation where a partial failure would otherwise leave data in an
// inconsistent, half-applied state (e.g. the itinerary delay-cascade route,
// which shifts several rows' start_time in sequence).
export async function transaction<T>(
  fn: (sql: ReturnType<typeof waddler>) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  const txSql = waddler({ client });
  try {
    await client.query("BEGIN");
    const result = await fn(txSql);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
