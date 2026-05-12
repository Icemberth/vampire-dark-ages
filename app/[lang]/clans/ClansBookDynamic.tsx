"use client";

import dynamic from "next/dynamic";
import type { ClanBookRow } from "./ClansBook";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

const ClansBookLazy = dynamic(
  () => import("./ClansBook").then((m) => ({ default: m.ClansBook })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[20rem] w-full flex-col items-center justify-center rounded-sm px-8 py-14 text-[#d4d4d8]/90">
        <span className="font-sans text-sm tracking-[0.12em]">…</span>
      </div>
    ),
  },
);

type Props = {
  copy: Dictionary["clansPage"];
  nav: Pick<Dictionary["nav"], "disciplines" | "characters">;
  locale: Locale;
  clans: ClanBookRow[];
};

/** Client boundary so `dynamic(..., { ssr: false })` is not used from a Server Component. */
export function ClansBookDynamic(props: Props) {
  return <ClansBookLazy {...props} />;
}
