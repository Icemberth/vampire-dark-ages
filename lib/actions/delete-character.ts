"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { deleteCharacterForUser } from "@/db/queries";
import { localeParamSchema } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";

export async function deleteCharacterAction(
  characterId: string,
  localeRaw: string,
) {
  const locale = localeParamSchema.parse(localeRaw);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }
  const ok = await deleteCharacterForUser(characterId, session.user.id);
  if (!ok) {
    return { ok: false as const, error: "Character not found" };
  }
  revalidatePath(withLocale(locale, "/characters"));
  return { ok: true as const };
}
