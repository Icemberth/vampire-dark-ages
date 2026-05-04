import { z } from "zod";
import type { CharacterWizardPatch } from "@/db/queries";
import { DRAFT_CHARACTER_NAME } from "@/lib/character";

/** react-hook-form + zodResolver (raw field values). */
export const characterWizardConceptFormSchema = z.object({
  /** Empty string is OK at validation time; trimmed empty becomes draft name on save. */
  name: z.string().max(200),
  concept: z.string().max(4000),
  nature: z.string().max(500),
  demeanor: z.string().max(500),
  clanId: z.union([z.string().uuid(), z.literal("")]),
});

export const characterWizardBloodFormSchema = z.object({
  generation: z.number().int().min(1).max(15),
});

export type CharacterWizardConceptFormValues = z.infer<
  typeof characterWizardConceptFormSchema
>;
export type CharacterWizardBloodFormValues = z.infer<
  typeof characterWizardBloodFormSchema
>;

export function conceptFormToPatch(
  data: CharacterWizardConceptFormValues,
  locale: string,
): CharacterWizardPatch {
  const trim = (s: string) => s.trim();
  const name =
    trim(data.name) === "" ? DRAFT_CHARACTER_NAME(locale) : trim(data.name);
  return {
    name,
    concept: trim(data.concept) === "" ? null : trim(data.concept),
    nature: trim(data.nature) === "" ? null : trim(data.nature),
    demeanor: trim(data.demeanor) === "" ? null : trim(data.demeanor),
    clanId: data.clanId === "" ? null : data.clanId,
  };
}
