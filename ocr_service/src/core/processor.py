"""
processor.py — Open/Closed + Single Responsibility Principles

The CharacterSheetProcessor is the only business-logic layer.
It:
  1. Delegates PDF extraction to whatever ILLMAdapter it receives (OCP).
  2. Validates the raw dict through Pydantic (fail-fast contract).
  3. Returns a fully-typed CharacterSheetResponse.

It knows nothing about HTTP, FastAPI, or any specific LLM provider.
"""

import logging

from ..interfaces import ILLMAdapter
from ..schemas import CharacterSheetResponse

logger = logging.getLogger(__name__)


class CharacterSheetProcessor:
    """
    Orchestrates the PDF → LLM → validated response pipeline.

    Args:
        llm_adapter: Any object that implements ILLMAdapter.
                     Injected at construction time (Dependency Injection).
    """

    def __init__(self, llm_adapter: ILLMAdapter) -> None:
        self._llm = llm_adapter

    async def process(self, pdf_bytes: bytes) -> CharacterSheetResponse:
        """
        Full pipeline:
          PDF bytes → LLM extraction → Pydantic validation → typed response

        Args:
            pdf_bytes: Raw binary content of the uploaded PDF.

        Returns:
            A fully validated CharacterSheetResponse instance.

        Raises:
            LLMAdapterError: Propagated from the adapter on provider failure.
            ValidationError:  Pydantic error if the LLM returns an unexpected shape.
        """
        logger.info("Processing PDF (%d bytes)…", len(pdf_bytes))

        raw_dict = await self._llm.extract_character_from_pdf(pdf_bytes)
        logger.debug("Raw dict from LLM: %s", raw_dict)

        # Pydantic validates types, clamps ranges, and fills missing defaults
        validated = CharacterSheetResponse.model_validate(raw_dict)
        logger.info("Extraction complete — character: %s", validated.name)

        return validated
