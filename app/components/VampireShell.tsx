import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { SiteHeader } from "@/app/components/SiteHeader";

const shellVars = {
  "--top-nav-bottom-border-size": "2px",
  "--characters-rail-max":
    "clamp(75rem, min(92vw, calc(100% - 2.5rem)), 159rem)",
  "--characters-content-max":
    "clamp(0rem, min(82vw, calc(100% - 2.5rem)), 96.875rem)",
} as CSSProperties;

type VampireShellProps = {
  children: ReactNode;
  locale: Locale;
  /** Narrow inner column (characters list). Clans uses full width. */
  constrainContentWidth?: boolean;
};

export function VampireShell({
  children,
  locale,
  constrainContentWidth = false,
}: VampireShellProps) {
  return (
    <div
      className="relative min-h-dvh overflow-x-hidden text-zinc-100"
      style={{
        ...shellVars,
        backgroundColor: "#070708",
        backgroundImage: "url(/icons/vda-background-img.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28),rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.38))]" />

      <div
        className="relative z-10 flex min-h-dvh w-full flex-col bg-transparent"
        style={shellVars}
      >
        <SiteHeader locale={locale} />
        <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-transparent">
          {constrainContentWidth ? (
            <div
              className="mx-auto flex min-h-0 w-full flex-1 flex-col bg-transparent px-4 sm:px-6 lg:px-8 sm:[max-width:var(--characters-content-max)]"
            >
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
