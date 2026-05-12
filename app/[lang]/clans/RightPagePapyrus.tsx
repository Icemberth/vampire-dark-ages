"use client";

import type { CSSProperties } from "react";
import { useMemo } from "react";
import {
  normalizeClanAssetKey,
  resolveClanPanelArtUrl,
} from "@/lib/clanAssetKey";

/** Papyrus wash for right portrait page, back cover, and empty state. */
export const CLAN_BOOK_PAGE_STYLE = {
  backgroundColor: "#d8c4a4",
  backgroundImage: "url(/img/papyrus.png)",
  backgroundSize: "cover",
  backgroundPosition: "44% 50%",
  backgroundRepeat: "no-repeat",
} satisfies CSSProperties;

export type RightPagePapyrusProps = {
  clanName: string;
};

function ClanPanelArtBg({ clanName }: { clanName: string }) {
  const src = useMemo(
    () => resolveClanPanelArtUrl(normalizeClanAssetKey(clanName)),
    [clanName],
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element -- programmatic clan panel art
    <img
      src={src}
      alt=""
      role="presentation"
      decoding="async"
      className="h-full w-full object-cover object-right"
    />
  );
}

/** Right codex spread: papyrus multiply layers + clan portrait art. */
export function RightPagePapyrus({ clanName }: RightPagePapyrusProps) {
  return (
    <div
      className="relative box-border h-full overflow-hidden text-[#251a12]"
      style={CLAN_BOOK_PAGE_STYLE}
    >
      <div
        className="absolute inset-0 z-30 opacity-90 mix-blend-multiply"
        style={CLAN_BOOK_PAGE_STYLE}
      />
      <div className="relative z-20 h-full w-full mix-blend-multiply brightness-[0.97] saturate-[1.02]">
        <ClanPanelArtBg clanName={clanName} />
      </div>
    </div>
  );
}
