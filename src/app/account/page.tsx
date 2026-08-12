import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Couple } from "@/types/couple";
import DashboardHeader from "@/components/DashboardHeader";
import AccountSettings from "@/components/AccountSettings";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const couples = (await db().sql`
    SELECT id, email, display_name, created_at FROM couples WHERE id = ${session.coupleId}
  `) as Couple[];
  const couple = couples[0];
  if (!couple) redirect("/login");

  return (
    <div className="flex-1 bg-cream">
      <DashboardHeader />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-8">Account settings</h1>
        <AccountSettings couple={couple} />
      </div>
    </div>
  );
}
