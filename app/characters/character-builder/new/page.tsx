import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { createDraftCharacter } from "@/db/queries";

export default async function CharacterBuilderNewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/characters");
  }
  const id = await createDraftCharacter(session.user.id);
  redirect(`/characters/character-builder/${id}`);
}
