import { db } from "./index";
import { codex } from "./schema/world";

async function seedCodex() {
  console.log("Seeding Codex: Physical Attributes...");

  const physicalAttributes = [
    {
      category: "attribute",
      subcategory: "physical",
      name: "strength",
      displayName: "Strength",
      description:
        "Strength is the measure of your character's raw physical power—the ability to lift, carry, and deal damage.",
      dotDescriptions: {
        "1": "Poor: A few buckets of water makes you break out in a sweat.",
        "2": "Average: You can handle the daily chores of a medieval peasant.",
        "3": "Good: You are physically fit; a soldier or a hardened laborer.",
        "4": "Exceptional: You can snap a spear or lift a grown man with one hand.",
        "5": "Outstanding: You can shatter stone and bend iron bars with your bare hands.",
      },
    },
    {
      category: "attribute",
      subcategory: "physical",
      name: "dexterity",
      displayName: "Dexterity",
      description:
        "Dexterity measures physical agility, reflexes, and fine motor skills.",
      dotDescriptions: {
        "1": "Poor: You are clumsy and prone to tripping over your own feet.",
        "2": "Average: You have the coordination of a typical townsperson.",
        "3": "Good: You are graceful and move with the confidence of an athlete.",
        "4": "Exceptional: You move like a shadow; your reflexes are uncanny.",
        "5": "Outstanding: You have the preternatural agility of a true predator.",
      },
    },
    {
      category: "attribute",
      subcategory: "physical",
      name: "stamina",
      displayName: "Stamina",
      description:
        "Stamina reflects health, endurance, and the ability to shrug off physical pain.",
      dotDescriptions: {
        "1": "Poor: You bruise easily and tire after a short walk.",
        "2": "Average: You can endure a normal day's work in the fields.",
        "3": "Good: You are hardy and can recover quickly from minor injuries.",
        "4": "Exceptional: You can run for miles or withstand a brutal beating.",
        "5": "Outstanding: You are as resilient as the earth itself; pain is a distant memory.",
      },
    },
  ];
  // GUIDE FOR CHARACTER CREATION
  const characterCreationRules = {
    category: "rule",
    subcategory: "creation_guide",
    name: "character_creation_process",
    displayName: "The Creation Process",
    description:
      "Creating a character for Vampire: The Dark Ages is a journey of defining a fallen soul in a dark world. It follows a structured sequence from concept to the final spending of Freebie Points.",
    // We use the JSONB field to store the specific steps from pages 144-151
    dotDescriptions: {
      step_1:
        "Step One: Character Concept. Choose Name, Clan, Nature, Demeanor, and Concept.",
      step_2:
        "Step Two: Select Attributes. Prioritize Physical, Social, and Mental categories (7/5/3 points).",
      step_3:
        "Step Three: Select Abilities. Prioritize Talents, Skills, and Knowledges (13/9/5 points).",
      step_4:
        "Step Four: Select Advantages. Choose Disciplines (3), Backgrounds (5), and Virtues (7).",
      step_5:
        "Step Five: Last Touches. Calculate Road, Willpower, and spend Freebie Points (15).",
    },
  };

  for (const attr of physicalAttributes) {
    await db.insert(codex).values(attr).onConflictDoUpdate({
      target: codex.name,
      set: attr,
    });
    await db.insert(codex).values(characterCreationRules).onConflictDoUpdate({
      target: codex.name,
      set: characterCreationRules,
    });
  }

  console.log("Seed complete: 3 Physical Attributes added to Codex.");
}

seedCodex().catch(console.error);
