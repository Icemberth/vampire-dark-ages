"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import {
  getCharacterByIdForUser,
  type CharacterWizardPatch,
  updateCharacterForUser,
} from "@/db/queries";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function saveCharacterWizard(
  characterId: string,
  patch: CharacterWizardPatch,
) {
  const userId = await requireUserId();
  if (!userId) {
    return { ok: false as const, error: "Not signed in" };
  }
  const ok = await updateCharacterForUser(characterId, userId, patch);
  if (!ok) {
    return { ok: false as const, error: "Character not found" };
  }
  revalidatePath("/characters");
  revalidatePath(`/characters/character-builder/${characterId}`);
  return { ok: true as const };
}

export async function completeCharacterWizard(characterId: string) {
  const userId = await requireUserId();
  if (!userId) {
    redirect("/characters");
  }
  const row = await getCharacterByIdForUser(characterId, userId);
  if (!row) {
    redirect("/characters");
  }
  revalidatePath("/characters");
  redirect("/characters");
}
