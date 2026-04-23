import type { CSSProperties, ReactNode } from "react";
import "./list-frame.css";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function CharactersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const displayName =
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0]?.trim() ||
    null;
  const userInitial = displayName?.[0]?.toUpperCase() ?? null;

  const shellVars = {
    "--top-nav-bottom-border-size": "2px",
    // Navbar inner rail: ~1200px floor, fluid, ~2544px cap
    "--characters-rail-max":
      "clamp(75rem, min(92vw, calc(100% - 2.5rem)), 159rem)",
    // Main / character list only: narrower, caps ~1550px (96.875rem at 16px root)
    "--characters-content-max":
      "clamp(0rem, min(82vw, calc(100% - 2.5rem)), 96.875rem)",
  } as CSSProperties;

  return (
    <div
      className="relative min-h-svh overflow-x-hidden text-zinc-100"
      style={{
        ...shellVars,
        backgroundImage: "url(/icons/castlebackground.png)",
        backgroundSize: "cover",
        backgroundPosition: "center 28%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75),rgba(0,0,0,0.88))]" />

      <div
        className="relative z-10 flex h-svh w-full flex-col"
        style={shellVars}
      >
        {/* Full-bleed bar; wide inner rail (main body uses a narrower max below) */}
        <header
          className="sticky top-0 z-20 box-border flex w-full shrink-0 overflow-visible border-b border-zinc-800 bg-black/95 backdrop-blur-sm"
          aria-label="Characters"
        >
          <div
            className="mx-auto flex w-full items-center justify-between gap-4 overflow-visible px-4 pb-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.625rem))] sm:px-6 sm:pb-5 sm:pt-[max(1.125rem,calc(env(safe-area-inset-top,0px)+0.75rem))] lg:px-8"
            style={{ maxWidth: "var(--characters-rail-max)" }}
          >
            <Link
              href="/"
              className="text-lg font-semibold tracking-wide text-zinc-100 hover:text-zinc-200 sm:text-xl"
            >
              Nocturnus
            </Link>
            {userInitial ? (
              <div
                className="relative grid h-14 w-14 shrink-0 place-items-center overflow-visible text-base font-bold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:h-18 sm:w-18 sm:text-lg"
                title={session?.user?.name ?? session?.user?.email ?? "Account"}
                aria-label={`Signed in as ${session?.user?.name ?? session?.user?.email ?? "user"}`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-[-18%] rounded-full sm:inset-[-14%]"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    backgroundImage: "url(/icons/vtm-blood-stats.png)",
                    backgroundSize: "contain",
                    backgroundPosition: "50% 44%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <span className="relative z-1">{userInitial}</span>
              </div>
            ) : (
              <span
                className="inline-block h-14 w-14 shrink-0 sm:h-18 sm:w-18"
                aria-hidden
              />
            )}
          </div>
        </header>

        <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
          <div
            className="mx-auto flex min-h-0 w-full flex-1 flex-col px-4 sm:px-6 lg:px-8"
            style={{ maxWidth: "var(--characters-content-max)" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
