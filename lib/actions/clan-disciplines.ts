"use server";

import { z } from "zod";
import { getClanDisciplinesWithCodex } from "@/db/queries";
import { localeParamSchema } from "@/lib/i18n/locale";

const clanIdSchema = z.string().uuid();

/** Discipline keys from `clan_disciplines` plus codex display copy when available. */
export async function fetchClanDisciplinesWithCodexAction(
  clanId: string,
  localeRaw: string,
) {
  const id = clanIdSchema.parse(clanId);
  const locale = localeParamSchema.parse(localeRaw);
  return getClanDisciplinesWithCodex(id, locale);
}
