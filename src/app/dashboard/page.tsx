import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Wedding } from "@/types/wedding";
import CreateWeddingForm from "@/components/CreateWeddingForm";
import DashboardHeader from "@/components/DashboardHeader";
import WeddingListItem from "@/components/WeddingListItem";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const weddings = (await db().sql`
    SELECT * FROM weddings WHERE couple_id = ${session.coupleId} ORDER BY created_at DESC
  `) as Wedding[];

  return (
    <div className="flex-1 bg-cream">
      <DashboardHeader />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-8">Your weddings</h1>

        {weddings.length > 0 && (
          <ul className="flex flex-col gap-3 mb-10">
            {weddings.map((wedding) => (
              <WeddingListItem key={wedding.id} wedding={wedding} />
            ))}
          </ul>
        )}

        <div className="bg-white border border-border-warm rounded-xl p-6">
          <h2 className="font-semibold mb-4">Create a wedding</h2>
          <CreateWeddingForm />
        </div>
      </div>
    </div>
  );
}
