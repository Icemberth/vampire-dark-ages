"""
interfaces.py — Dependency Inversion Principle (SOLID - D)

Defines the contracts (abstract interfaces) that the core processor depends on.
Concrete implementations live in /adapters and can be swapped without touching
business logic.
"""

from abc import ABC, abstractmethod


class ILLMAdapter(ABC):
    """
    Contract for any LLM/AI provider that can analyze a PDF and return
    a structured character sheet as a plain Python dict.

    Implementing a new provider (e.g. OpenAI, Anthropic) only requires
    creating a new class that fulfils this interface — nothing else changes.
    """

    @abstractmethod
    async def extract_character_from_pdf(self, pdf_bytes: bytes) -> dict:
        """
        Send raw PDF bytes to the AI provider and return an unvalidated dict
        whose shape should conform to CharacterSheetResponse.

        Args:
            pdf_bytes: Raw binary content of the uploaded PDF file.

        Returns:
            A plain dict with keys: name, attributes, abilities, advantages.

        Raises:
            LLMAdapterError: When the provider call fails or returns unparseable data.
        """
        ...


class LLMAdapterError(Exception):
    """Raised by any ILLMAdapter implementation on provider-level failures."""
    pass
