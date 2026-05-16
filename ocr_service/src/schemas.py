"""
schemas.py — Data Transfer Objects (Pydantic models)

These models define the exact JSON contract between:
  - The LLM adapter (input to validation)
  - The API response (output to the Next.js frontend)

Mirrors the Drizzle/Postgres schema in db/schema/character.ts so that
the Next.js Server Action can insert the response directly with no
further transformation.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Sub-schemas — each mirrors one Drizzle table
# ---------------------------------------------------------------------------

class AttributesSchema(BaseModel):
    """Maps to the `attributes` table. All values default to 1 (WoD minimum)."""

    # Physical
    strength: int = Field(default=1, ge=1, le=5)
    dexterity: int = Field(default=1, ge=1, le=5)
    stamina: int = Field(default=1, ge=1, le=5)

    # Social
    charisma: int = Field(default=1, ge=1, le=5)
    manipulation: int = Field(default=1, ge=1, le=5)
    appearance: int = Field(default=1, ge=1, le=5)

    # Mental
    perception: int = Field(default=1, ge=1, le=5)
    intelligence: int = Field(default=1, ge=1, le=5)
    wits: int = Field(default=1, ge=1, le=5)


class AbilitiesSchema(BaseModel):
    """Maps to the `abilities` table. All values default to 0."""

    # Talents
    alertness: int = Field(default=0, ge=0, le=5)
    athletics: int = Field(default=0, ge=0, le=5)
    awareness: int = Field(default=0, ge=0, le=5)
    brawl: int = Field(default=0, ge=0, le=5)
    empathy: int = Field(default=0, ge=0, le=5)
    expression: int = Field(default=0, ge=0, le=5)
    intimidation: int = Field(default=0, ge=0, le=5)
    leadership: int = Field(default=0, ge=0, le=5)
    streetwise: int = Field(default=0, ge=0, le=5)
    subterfuge: int = Field(default=0, ge=0, le=5)

    # Skills
    animalKen: int = Field(default=0, ge=0, le=5)
    archery: int = Field(default=0, ge=0, le=5)
    commerce: int = Field(default=0, ge=0, le=5)
    crafts: int = Field(default=0, ge=0, le=5)
    etiquette: int = Field(default=0, ge=0, le=5)
    herbalism: int = Field(default=0, ge=0, le=5)
    melee: int = Field(default=0, ge=0, le=5)
    ride: int = Field(default=0, ge=0, le=5)
    stealth: int = Field(default=0, ge=0, le=5)
    survival: int = Field(default=0, ge=0, le=5)

    # Knowledges
    academics: int = Field(default=0, ge=0, le=5)
    hearthWisdom: int = Field(default=0, ge=0, le=5)
    investigation: int = Field(default=0, ge=0, le=5)
    law: int = Field(default=0, ge=0, le=5)
    medicine: int = Field(default=0, ge=0, le=5)
    occult: int = Field(default=0, ge=0, le=5)
    politics: int = Field(default=0, ge=0, le=5)
    seneschal: int = Field(default=0, ge=0, le=5)
    theology: int = Field(default=0, ge=0, le=5)
    lingua: int = Field(default=0, ge=0, le=5)


class AdvantagesSchema(BaseModel):
    """Maps to the `advantages` table."""

    roadName: str = Field(default="Road of Humanity")
    roadValue: int = Field(default=5, ge=1, le=10)
    willpower: int = Field(default=5, ge=1, le=10)
    conscience: int = Field(default=1, ge=1, le=5)
    selfControl: int = Field(default=1, ge=1, le=5)
    courage: int = Field(default=1, ge=1, le=5)


# ---------------------------------------------------------------------------
# Root response — the single object the API returns
# ---------------------------------------------------------------------------

class CharacterSheetResponse(BaseModel):
    """
    Top-level response body sent back to the Next.js frontend.

    The frontend can destructure this directly into the three Drizzle
    insert calls (attributes, abilities, advantages) without any mapping.
    """

    name: Optional[str] = Field(
        default=None,
        description="Character name as read from the PDF, if legible.",
    )
    attributes: AttributesSchema = Field(default_factory=AttributesSchema)
    abilities: AbilitiesSchema = Field(default_factory=AbilitiesSchema)
    advantages: AdvantagesSchema = Field(default_factory=AdvantagesSchema)
