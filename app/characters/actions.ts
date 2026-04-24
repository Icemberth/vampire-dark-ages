"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { deleteCharacterForUser } from "@/db/queries";

export async function deleteCharacterAction(characterId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, error: "Not signed in" };
  }
  const ok = await deleteCharacterForUser(characterId, session.user.id);
  if (!ok) {
    return { ok: false as const, error: "Character not found" };
  }
  revalidatePath("/characters");
  return { ok: true as const };
}
