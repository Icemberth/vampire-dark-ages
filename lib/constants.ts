/** App accent red — matches `:root { --vda-blood }` in `app/globals.css`. */
export const VDA_BLOOD_RED = "#c82434" as const;

// --- IDENTITY ---
export const NATURES_DEMEANORS = [
  "Architect",
  "Autocrat",
  "Barbarian",
  "Bravo",
  "Caretaker",
  "Celebrant",
  "Chameleon",
  "Child",
  "Conformist",
  "Conniver",
  "Curmudgeon",
  "Deviant",
  "Director",
  "Fanatic",
  "Gallant",
  "Innocent",
  "Judge",
  "Loner",
  "Martyr",
  "Monster",
  "Pedagogue",
  "Penitent",
  "Perfectionist",
  "Rebel",
  "Rogue",
  "Survivor",
  "Thrills-Seeker",
  "Traditionalist",
  "Tyrant",
  "Visionary",
];

// --- ATTRIBUTES ---
export const ATTRIBUTE_CATEGORIES = {
  PHYSICAL: ["strength", "dexterity", "stamina"],
  SOCIAL: ["charisma", "manipulation", "appearance"],
  MENTAL: ["perception", "intelligence", "wits"],
};

// --- ABILITIES ---
export const ABILITY_CATEGORIES = {
  TALENTS: [
    "alertness",
    "athletics",
    "awareness",
    "brawl",
    "empathy",
    "expression",
    "intimidation",
    "leadership",
    "streetwise",
    "subterfuge",
  ],
  SKILLS: [
    "animalKen",
    "archery",
    "commerce",
    "crafts",
    "etiquette",
    "herbalism",
    "melee",
    "ride",
    "stealth",
    "survival",
  ],
  KNOWLEDGES: [
    "academics",
    "hearthWisdom",
    "investigation",
    "law",
    "medicine",
    "occult",
    "politics",
    "seneschal",
    "theology",
    "lingua",
  ],
};

// --- BACKGROUNDS ---
export const BACKGROUNDS = [
  "Allies",
  "Contacts",
  "Domain",
  "Fame",
  "Generation",
  "Herd",
  "Influence",
  "Mentor",
  "Resources",
  "Retainers",
  "Status",
];

// --- ROADS ---
export const ROADS = [
  "Road of Humanity",
  "Road of Kings",
  "Road of Heaven",
  "Road of the Beast",
  "Road of Sin",
  "Road of Blood",
];

// --- POINT COSTS (Freebie Points) ---
export const FREEBIE_COSTS = {
  ATTRIBUTE: 5,
  ABILITY: 2,
  DISCIPLINE: 7,
  BACKGROUND: 1,
  VIRTUE: 2,
  ROAD: 2,
  WILLPOWER: 1,
};
