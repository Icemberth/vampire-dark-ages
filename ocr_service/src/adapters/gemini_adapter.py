"""
gemini_adapter.py — Single Responsibility Principle (SOLID - S)

This module has ONE job: talk to the Google Gemini API.
All knowledge about the prompt, model name, and response parsing lives here.
Nothing outside this file needs to know that Gemini exists.
"""

import json
import re
import base64
import logging

import google.generativeai as genai

from ..interfaces import ILLMAdapter, LLMAdapterError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompt — instructs Gemini to return a strict JSON object
# ---------------------------------------------------------------------------

_EXTRACTION_PROMPT = """
You are an expert assistant that reads Vampire: The Dark Ages (V20 Dark Ages)
character sheets from scanned PDFs or images.

Your task is to extract every numeric field visible on the sheet and return
ONLY a valid JSON object — no markdown fences, no commentary, just raw JSON.

The JSON must follow this exact shape (use the exact key names below):

{
  "name": "<character name or null>",
  "attributes": {
    "strength": <int 1-5>, "dexterity": <int 1-5>, "stamina": <int 1-5>,
    "charisma": <int 1-5>, "manipulation": <int 1-5>, "appearance": <int 1-5>,
    "perception": <int 1-5>, "intelligence": <int 1-5>, "wits": <int 1-5>
  },
  "abilities": {
    "alertness": <int 0-5>, "athletics": <int 0-5>, "awareness": <int 0-5>,
    "brawl": <int 0-5>, "empathy": <int 0-5>, "expression": <int 0-5>,
    "intimidation": <int 0-5>, "leadership": <int 0-5>,
    "streetwise": <int 0-5>, "subterfuge": <int 0-5>,
    "animalKen": <int 0-5>, "archery": <int 0-5>, "commerce": <int 0-5>,
    "crafts": <int 0-5>, "etiquette": <int 0-5>, "herbalism": <int 0-5>,
    "melee": <int 0-5>, "ride": <int 0-5>, "stealth": <int 0-5>,
    "survival": <int 0-5>,
    "academics": <int 0-5>, "hearthWisdom": <int 0-5>,
    "investigation": <int 0-5>, "law": <int 0-5>, "medicine": <int 0-5>,
    "occult": <int 0-5>, "politics": <int 0-5>, "seneschal": <int 0-5>,
    "theology": <int 0-5>, "lingua": <int 0-5>
  },
  "advantages": {
    "roadName": "<string>", "roadValue": <int 1-10>,
    "willpower": <int 1-10>,
    "conscience": <int 1-5>, "selfControl": <int 1-5>, "courage": <int 1-5>
  }
}

Rules:
- Dots/circles filled = numeric level (e.g. ●●●○○ = 3).
- If a field is not visible or illegible, use its minimum default value.
- Attributes minimum is 1; Abilities minimum is 0.
- Return ONLY the JSON object, nothing else.
"""


class GeminiAdapter(ILLMAdapter):
    """
    Concrete ILLMAdapter that uses Google Gemini's multimodal API
    to extract character-sheet data from a PDF.

    Gemini can natively accept PDF bytes as inline data, eliminating
    the need for a separate OCR step.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash") -> None:
        """
        Args:
            api_key:    Your GOOGLE_API_KEY from .env.
            model_name: Gemini model to use. gemini-2.0-flash is the
                        recommended balance of speed and accuracy.
        """
        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(model_name=model_name)
        logger.info("GeminiAdapter initialised with model=%s", model_name)

    async def extract_character_from_pdf(self, pdf_bytes: bytes) -> dict:
        """
        Sends the PDF to Gemini as inline base64 data and parses the response.

        Returns:
            Unvalidated dict matching CharacterSheetResponse shape.

        Raises:
            LLMAdapterError: On API failure or JSON parse error.
        """
        try:
            # Gemini accepts inline file data via the `inline_data` part format
            pdf_part = {
                "inline_data": {
                    "mime_type": "application/pdf",
                    "data": base64.b64encode(pdf_bytes).decode("utf-8"),
                }
            }

            logger.debug("Sending PDF (%d bytes) to Gemini…", len(pdf_bytes))
            response = await self._model.generate_content_async(
                [_EXTRACTION_PROMPT, pdf_part]
            )

            raw_text = response.text.strip()
            logger.debug("Gemini raw response:\n%s", raw_text)

            return self._parse_json(raw_text)

        except Exception as exc:
            logger.error("Gemini API call failed: %s", exc)
            raise LLMAdapterError(f"Gemini extraction failed: {exc}") from exc

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_json(raw: str) -> dict:
        """
        Robustly extracts a JSON object from the model's text output.
        Handles cases where the model accidentally wraps JSON in markdown.
        """
        # Strip optional ```json ... ``` fences the model sometimes adds
        cleaned = re.sub(r"^```[a-z]*\n?", "", raw, flags=re.MULTILINE)
        cleaned = re.sub(r"\n?```$", "", cleaned, flags=re.MULTILINE)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise LLMAdapterError(
                f"Could not parse JSON from Gemini response. "
                f"Raw text was:\n{raw}"
            ) from exc
