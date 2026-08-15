import { isValidInviteCode } from "@/lib/invite-codes";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;

  if (!isValidInviteCode(invite)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm text-center bg-white border border-border-warm rounded-xl p-8 shadow-sm">
          <h1 className="font-display text-2xl mb-2">Invite only, for now</h1>
          <p className="text-sm text-foreground/80">
            Entrevow is in a private beta ahead of launch. If you&apos;ve been invited, use the
            link you were given — otherwise, check back soon.
          </p>
        </div>
      </div>
    );
  }

  return <SignupForm inviteCode={invite ?? null} />;
}
