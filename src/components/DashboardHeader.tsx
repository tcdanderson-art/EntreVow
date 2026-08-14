"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 max-w-3xl mx-auto px-4 sm:px-6 pt-6">
      <Link href="/dashboard">
        <Image
          src="/brand/wordmark.png"
          alt="Entrevow"
          width={663}
          height={82}
          className="h-4 sm:h-5 w-auto"
          unoptimized
        />
      </Link>
      <span className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/faq"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Help
        </Link>
        <Link
          href="/account"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Account
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Log out
        </button>
      </span>
    </header>
  );
}
