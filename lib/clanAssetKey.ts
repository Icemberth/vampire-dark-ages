/**
 * Normalized lookup key from a clan display name for asset paths under `/icons/clans/` and `/img/`.
 * Strips Unicode diacritics so localized names (“Gárgola”) fold to ASCII before slugging.
 */
export function normalizeClanAssetKey(input: string) {
  return input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/**
 * Map normalized display key → canonical asset slug (matches panel map + default PNG basenames).
 * Includes Spanish (and other) display names that do not normalize to the English slug.
 */
export const CLAN_ASSET_KEY_ALIAS: Record<string, string> = {
  assamita: "assamite",
  capadocio: "cappadocian",
  seguidoresdeset: "followersofset",
  hijosdeosiris: "childrenofosiris",
  gargola: "gargoyle",
  verdaderosbrujah: "truebrujah",
  /** Legacy / alternate label */
  childrenofset: "followersofset",
  settites: "followersofset",
};

/** Side codex panel when no dedicated artwork exists. */
export const DEFAULT_CLAN_PANEL_ART_PATH = "/img/darkAges.png";

/**
 * Known panel art under `public/img` (sync resolve only — no HTTP probing).
 * Keys are canonical slugs after {@link CLAN_ASSET_KEY_ALIAS}.
 */
export const CLAN_PANEL_ART_BY_KEY: Record<string, string> = {
  assamite: "/img/assamite.png",
  baali: "/img/baali.png",
  brujah: "/img/brujah.png",
  cappadocian: "/img/cappadocian.png",
  childrenofosiris: "/img/childrenofosiris.png",
  followersofset: "/img/followersofset.png",
  gangrel: "/img/gangrel.png",
  lasombra: "/img/lasombra.png",
  nosferatu: "/img/nosferatu.png",
  ravnos: "/img/ravnos.png",
  salubri: "/img/salubri.png",
  toreador: "/img/toreador.png",
  tremere: "/img/tremere.png",
  tzimisce: "/img/tzimisce.png",
  ventrue: "/img/Ventrue.png",
};

export function resolveClanArtifactKey(normalizedDisplayKey: string): string {
  if (!normalizedDisplayKey) return normalizedDisplayKey;
  return CLAN_ASSET_KEY_ALIAS[normalizedDisplayKey] ?? normalizedDisplayKey;
}

/** Resolve panel image URL without network probes (avoids hundreds of 404s on the clans codex). */
export function resolveClanPanelArtUrl(normalizedKey: string): string {
  if (!normalizedKey) return DEFAULT_CLAN_PANEL_ART_PATH;
  const slug = resolveClanArtifactKey(normalizedKey);
  return CLAN_PANEL_ART_BY_KEY[slug] ?? DEFAULT_CLAN_PANEL_ART_PATH;
}

/**
 * Optional override: canonical slug → SVG basename in `public/icons/clans/<name>.svg`
 * when it differs from the slug (casing or spelling).
 */
export const CLAN_EMBLEM_BASENAME_BY_SLUG: Record<string, string> = {
  brujah: "Brujah",
  childrenofosiris: "ChildrenofOsiris",
  followersofset: "FollowersOfSet",
  gargoyle: "gargoyles",
  giovanni: "giovani",
  truebrujah: "TrueBrujah",
};
