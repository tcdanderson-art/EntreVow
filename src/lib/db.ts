import { waddler } from "waddler/node-postgres";

let sql: ReturnType<typeof waddler> | undefined;

export function db() {
  if (!sql) {
    sql = waddler(process.env.DATABASE_URL!);
  }
  return { sql };
}
