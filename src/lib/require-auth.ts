import { getSession } from "@/lib/session";

export async function requireCoupleId(): Promise<number | null> {
  const session = await getSession();
  return session?.coupleId ?? null;
}
