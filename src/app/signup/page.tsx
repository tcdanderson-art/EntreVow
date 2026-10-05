import { isValidInviteCode } from "@/lib/invite-codes";
import { isUnspentBetaCode } from "@/lib/beta-offer";
import SignupForm from "@/components/SignupForm";
import InviteCodeEntry from "@/components/InviteCodeEntry";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;

  if (!isValidInviteCode(invite) && !(await isUnspentBetaCode(invite))) {
    return (
      <main className="flex-1 flex items-center justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm text-center bg-white border border-border-warm rounded-xl p-8 shadow-sm">
          <h1 className="font-display text-2xl mb-2">Founding couples access</h1>
          <p className="text-sm text-foreground/80">
            Entrevow is currently open to founding couples by invitation. Enter the code we sent
            you to create your account.
          </p>
          <InviteCodeEntry />
          <p className="text-sm text-foreground/80 mt-5">
            Don&apos;t have a code yet? Email{" "}
            <a
              href="mailto:hello@entrevow.com?subject=Founding%20couples%20code"
              className="text-brand font-medium underline"
            >
              hello@entrevow.com
            </a>{" "}
            to request one.
          </p>
        </div>
      </main>
    );
  }

  return <SignupForm inviteCode={invite ?? null} />;
}
