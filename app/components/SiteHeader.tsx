import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { UserMenu } from "@/app/components/UserMenu";

const RAIL_MAX = "clamp(75rem, min(92vw, calc(100% - 2.5rem)), 159rem)";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0]?.trim() ||
    null;
  const userInitial = displayName?.[0]?.toUpperCase() ?? null;

  return (
    <header
      className="sticky top-0 z-20 box-border flex w-full shrink-0 overflow-visible border-b border-zinc-800/80 bg-black/45 backdrop-blur-md"
      aria-label="Primary navigation"
    >
      <div
        className="mx-auto flex w-full items-center justify-between gap-3 overflow-visible px-4 pb-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.625rem))] sm:gap-4 sm:px-6 sm:pb-5 sm:pt-[max(1.125rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:px-8"
        style={{ maxWidth: RAIL_MAX }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-wide text-zinc-100 hover:text-zinc-200 sm:text-xl"
          >
            Nocturnus
          </Link>
          <nav
            className="flex min-w-0 items-center gap-3 text-sm font-medium text-zinc-300 sm:gap-6 sm:text-base"
            aria-label="Site sections"
          >
            <Link
              href="/clans"
              className="shrink-0 whitespace-nowrap hover:text-zinc-100"
            >
              Clans
            </Link>
            <Link
              href="/disciplines"
              className="shrink-0 whitespace-nowrap hover:text-zinc-100"
            >
              Disciplines
            </Link>
            <Link
              href="/characters"
              className="shrink-0 whitespace-nowrap hover:text-zinc-100"
            >
              Characters
            </Link>
          </nav>
        </div>
        {userInitial ? (
          <UserMenu
            userInitial={userInitial}
            displayName={session?.user?.name ?? session?.user?.email ?? "Account"}
          />
        ) : (
          <span
            className="inline-block h-14 w-14 shrink-0 sm:h-18 sm:w-18"
            aria-hidden
          />
        )}
      </div>
    </header>
  );
}
