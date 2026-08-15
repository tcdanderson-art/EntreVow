// Gates account creation only (not the rest of the site) while Entrevow is
// invite-only pre-launch. Replaces the old whole-site coming-soon gate, which
// proved unreliable on real mobile devices (cross-page cookie persistence
// across a rewrite response) -- this is deliberately simpler: no cookie, no
// rewrite, just a code checked on the one route that actually matters (signup).
//
// SIGNUP_INVITE_CODES is a comma-separated "code:label" list, one per invited
// couple, so a leaked/misused code can be revoked individually (remove that
// one entry and redeploy) without affecting anyone else's invite.
function inviteCodes(): Map<string, string> {
  const codes = new Map<string, string>();
  for (const entry of (process.env.SIGNUP_INVITE_CODES ?? "").split(",")) {
    const [code, label] = entry.split(":");
    if (code?.trim()) codes.set(code.trim(), label?.trim() || "invited");
  }
  return codes;
}

// No codes configured at all means signup is open to everyone -- the state
// after real launch, once SIGNUP_INVITE_CODES is unset/removed.
export function signupIsInviteOnly(): boolean {
  return inviteCodes().size > 0;
}

export function isValidInviteCode(code: string | null | undefined): boolean {
  if (!signupIsInviteOnly()) return true;
  if (!code) return false;
  return inviteCodes().has(code);
}
