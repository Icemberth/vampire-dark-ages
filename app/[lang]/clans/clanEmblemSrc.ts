import {
  CLAN_EMBLEM_BASENAME_BY_SLUG,
  resolveClanArtifactKey,
  normalizeClanAssetKey,
} from "@/lib/clanAssetKey";

export function clanEmblemSrc(clanName: string) {
  const raw = normalizeClanAssetKey(clanName);
  const slug = resolveClanArtifactKey(raw);
  const file = CLAN_EMBLEM_BASENAME_BY_SLUG[slug] ?? slug;
  return `/icons/clans/${file}.svg`;
}
