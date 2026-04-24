import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "./connectionString";
import { clans, disciplines, clanDisciplines } from "./schema";

dotenv.config({ path: ".env.local" });
const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

async function main() {
  console.log("🧹 Wiping database...");
  await db.delete(clanDisciplines);
  await db.delete(clans);
  await db.delete(disciplines);

  // 1. ALL DISCIPLINES (Check these names carefully)
  const discData = [
    { name: "Abombwe" },
    { name: "Animalism" },
    { name: "Auspex" },
    { name: "Bardo" },
    { name: "Celerity" },
    { name: "Daimoinon" },
    { name: "Dominate" },
    { name: "Fortitude" },
    { name: "Mortis" },
    { name: "Mytherceria" },
    { name: "Nihilistics" },
    { name: "Obeah" },
    { name: "Obfuscate" },
    { name: "Obtenebration" },
    { name: "Potence" },
    { name: "Presence" },
    { name: "Protean" },
    { name: "Quietus" },
    { name: "Serpentis" },
    { name: "Sihir" },
    { name: "Spiritus" },
    { name: "Temporis" },
    { name: "Thanatosis" },
    { name: "Thaumaturgy" },
    { name: "Valeren" },
    { name: "Vicissitude" },
    { name: "Visceratika" },
  ];

  const discEntries = await db.insert(disciplines).values(discData).returning();

  // Safe helper: will throw a clear error if name is missing
  const d = (name: string) => {
    const found = discEntries.find((i) => i.name === name);
    if (!found)
      throw new Error(`DISCIPLINE NOT FOUND: "${name}". Check Step 1 list.`);
    return found.id;
  };

  // 2. THE 32 LINEAGES
  const allLineagesData = [
    {
      name: "Assamite",
      alias: "Children of Haqim",
      weakness: "Blood addiction.",
      weaknessDescription:
        "Assamite viziers are rigorous to a fault. Each character has an obsession with her highest intellectual or creative Ability, which acts as a derangement. While the derangement is active, the character’s aura glows in a way as to provide hints to the vizier’s true Nature, as well as the object of her obsession, visible to Auspex users. Additionally, Assamites darken with age. This is a slow process. But over the centuries, Assamite skin blackens to a matte onyx",
      isBloodline: false,
    },
    {
      name: "Brujah",
      alias: "Zealots",
      weakness: "Frenzy prone.",
      weaknessDescription:
        "Brujah vampires are impulsive, easily aroused, and unable to maintain a consistent state of mind. Each character has an obsession with her highest emotional or creative Ability, which acts as a derangement. While the derangement is active, the character’s aura glows in a way as to provide hints to the brujah’s true Nature, as well as the object of her obsession, visible to Auspex users. Additionally, Brujah darken with age. This is a slow process. But over the centuries, Brujah skin blackens to a matte onyx",
      isBloodline: false,
    },
    {
      name: "Cappadocian",
      alias: "Clan of Death",
      weakness: "Ashen skin.",
      weaknessDescription:
        "Regardless of how much blood they consume, the Cappadocians remain deathly pale. This is not the attractive, alabaster skin common to many of the High Clans, but the ashen, grayish pallor of a corpse. Because of this, Cappadocians have +1 difficulty to all Social rolls to interact with mortals",
      isBloodline: false,
    },
    {
      name: "Followers of Set",
      alias: "Serpents",
      weaknessDescription:
        " The enmity between Set and Horus, sun god and son of Set’s hated brother Osiris, is eternal. The Followers of Set carry Horus’ curse more heavily than other vampires and take twice the amount of aggravated damage from any exposure to sunlight than members of other clans",
      weakness: "Light sensitivity.",

      isBloodline: false,
    },
    {
      name: "Gangrel",
      alias: "Animals",
      weakness: "Animal features.",
      isBloodline: false,
    },
    {
      name: "Lasombra",
      alias: "Magisters",
      weakness: "No reflection.",
      isBloodline: false,
    },
    {
      name: "Malkavian",
      alias: "Madmen",
      weakness: "Derangement.",
      isBloodline: false,
    },
    {
      name: "Nosferatu",
      alias: "Priors",
      weakness: "Appearance 0.",
      isBloodline: false,
    },
    {
      name: "Ravnos",
      alias: "Deceivers",
      weakness: "Compulsive vice.",
      isBloodline: false,
    },
    {
      name: "Toreador",
      alias: "Artisans",
      weakness: "Trance of beauty.",
      isBloodline: false,
    },
    {
      name: "Tremere",
      alias: "Usurpers",
      weakness: "Blood bond.",
      isBloodline: false,
    },
    {
      name: "Tzimisce",
      alias: "Fiends",
      weakness: "Native soil.",
      isBloodline: false,
    },
    {
      name: "Ventrue",
      alias: "Patricians",
      weakness: "Refined palate.",
      isBloodline: false,
    },
    { name: "Ahrimanes", isBloodline: true, weakness: "Sterile embrace." },
    { name: "Anda", isBloodline: true, weakness: "Mobility requirement." },
    { name: "Baali", isBloodline: true, weakness: "Holy symbol repulsion." },
    { name: "Bonsam", isBloodline: true, weakness: "Backward feet." },
    {
      name: "Children of Osiris",
      isBloodline: true,
      weakness: "Humanity tie.",
    },
    { name: "Danava", isBloodline: true, weakness: "Asceticism." },
    { name: "Gargoyles", isBloodline: true, weakness: "Stone skin." },
    { name: "Giovani", isBloodline: true, weakness: "Painful bite." },
    { name: "Impundulu", isBloodline: true, weakness: "Witch service." },
    { name: "Kiasyd", isBloodline: true, weakness: "Iron sensitivity." },
    { name: "Lamiae", isBloodline: true, weakness: "Plague bite." },
    { name: "Lhiannan", isBloodline: true, weakness: "Spirit mark." },
    { name: "Nagaraja", isBloodline: true, weakness: "Flesh eater." },
    { name: "Niktuku", isBloodline: true, weakness: "Horrendous hunger." },
    {
      name: "Ramanga",
      isBloodline: true,
      weakness: "Reflection vulnerability.",
    },
    {
      name: "Salubri",
      subName: "Healer Caste",
      weakness: "Consent feeding.",
      isBloodline: false,
    },
    {
      name: "Salubri",
      subName: "Warrior Caste",
      weakness: "No feeding in fear.",
      isBloodline: false,
    },
    {
      name: "Salubri",
      subName: "Watcher Caste",
      weakness: "Observation feeding.",
      isBloodline: false,
    },
    { name: "True Brujah", isBloodline: true, weakness: "Emotionless." },
  ];

  const insertedClans = await db
    .insert(clans)
    .values(allLineagesData)
    .returning();

  const c = (name: string, sub?: string) => {
    const found = insertedClans.find(
      (i) => i.name === name && (sub ? i.subName === sub : true),
    );
    if (!found) throw new Error(`CLAN NOT FOUND: "${name} ${sub || ""}"`);
    return found.id;
  };

  // 3. COMPLETE LINK MAP
  const links = [
    { cl: c("Assamite"), di: [d("Celerity"), d("Obfuscate"), d("Quietus")] },
    { cl: c("Brujah"), di: [d("Celerity"), d("Potence"), d("Presence")] },
    { cl: c("Cappadocian"), di: [d("Auspex"), d("Fortitude"), d("Mortis")] },
    {
      cl: c("Followers of Set"),
      di: [d("Obfuscate"), d("Presence"), d("Serpentis")],
    },
    { cl: c("Gangrel"), di: [d("Animalism"), d("Fortitude"), d("Protean")] },
    {
      cl: c("Lasombra"),
      di: [d("Obtenebration"), d("Potence"), d("Presence")],
    },
    { cl: c("Malkavian"), di: [d("Auspex"), d("Dominate"), d("Obfuscate")] },
    { cl: c("Nosferatu"), di: [d("Animalism"), d("Obfuscate"), d("Potence")] },
    { cl: c("Ravnos"), di: [d("Animalism"), d("Fortitude"), d("Presence")] },
    { cl: c("Toreador"), di: [d("Auspex"), d("Celerity"), d("Presence")] },
    { cl: c("Tremere"), di: [d("Auspex"), d("Dominate"), d("Thaumaturgy")] },
    { cl: c("Tzimisce"), di: [d("Animalism"), d("Auspex"), d("Vicissitude")] },
    { cl: c("Ventrue"), di: [d("Dominate"), d("Fortitude"), d("Presence")] },
    { cl: c("Ahrimanes"), di: [d("Animalism"), d("Presence"), d("Spiritus")] },
    { cl: c("Anda"), di: [d("Animalism"), d("Fortitude"), d("Protean")] },
    { cl: c("Baali"), di: [d("Daimoinon"), d("Obfuscate"), d("Presence")] },
    { cl: c("Bonsam"), di: [d("Abombwe"), d("Potence"), d("Obfuscate")] },
    {
      cl: c("Children of Osiris"),
      di: [d("Bardo"), d("Auspex"), d("Fortitude")],
    },
    { cl: c("Danava"), di: [d("Auspex"), d("Fortitude"), d("Presence")] },
    {
      cl: c("Gargoyles"),
      di: [d("Fortitude"), d("Potence"), d("Visceratika")],
    },
    { cl: c("Giovani"), di: [d("Dominate"), d("Potence"), d("Mortis")] },
    { cl: c("Impundulu"), di: [d("Animalism"), d("Fortitude"), d("Potence")] },
    {
      cl: c("Kiasyd"),
      di: [d("Dominate"), d("Mytherceria"), d("Obtenebration")],
    },
    { cl: c("Lamiae"), di: [d("Fortitude"), d("Potence"), d("Mortis")] },
    { cl: c("Lhiannan"), di: [d("Animalism"), d("Presence"), d("Protean")] },
    { cl: c("Nagaraja"), di: [d("Auspex"), d("Dominate"), d("Nihilistics")] },
    { cl: c("Niktuku"), di: [d("Auspex"), d("Celerity"), d("Potence")] },
    { cl: c("Ramanga"), di: [d("Animalism"), d("Obfuscate"), d("Presence")] },
    {
      cl: c("Salubri", "Healer Caste"),
      di: [d("Auspex"), d("Fortitude"), d("Obeah")],
    },
    {
      cl: c("Salubri", "Warrior Caste"),
      di: [d("Auspex"), d("Fortitude"), d("Valeren")],
    },
    {
      cl: c("Salubri", "Watcher Caste"),
      di: [d("Auspex"), d("Fortitude"), d("Valeren")],
    },
    { cl: c("True Brujah"), di: [d("Potence"), d("Presence"), d("Temporis")] },
  ];

  const finalLinks = links.flatMap((link) =>
    link.di.map((disciplineId) => ({ clanId: link.cl, disciplineId })),
  );

  await db.insert(clanDisciplines).values(finalLinks);
  console.log("✅ Success! All links created.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
