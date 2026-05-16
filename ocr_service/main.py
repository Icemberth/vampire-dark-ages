"""
main.py — FastAPI entry-point

Responsibilities (this file only):
  - Configure the app, CORS, and lifecycle (startup/shutdown).
  - Wire dependencies together via FastAPI's DI system.
  - Expose the single POST /process-pdf endpoint.

It does NOT contain business logic — that lives in core/processor.py.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from src.adapters.gemini_adapter import GeminiAdapter
from src.core.processor import CharacterSheetProcessor
from src.interfaces import LLMAdapterError
from src.schemas import CharacterSheetResponse

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Dependency factory — FastAPI calls this once per request
# (swap GeminiAdapter for any ILLMAdapter without touching the endpoint)
# ---------------------------------------------------------------------------

def get_processor() -> CharacterSheetProcessor:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY environment variable is not set.")

    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    adapter = GeminiAdapter(api_key=api_key, model_name=model_name)
    return CharacterSheetProcessor(llm_adapter=adapter)


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("OCR micro-service starting up…")
    # Fail fast on missing env vars at boot time
    get_processor()
    yield
    logger.info("OCR micro-service shutting down.")


# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------

app = FastAPI(
    title="VDA Character Sheet OCR Service",
    description=(
        "Receives a PDF, sends it to Google Gemini, and returns a structured "
        "JSON representing a Vampire: The Dark Ages character sheet."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:3000",  # default: local Next.js dev server
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

MAX_PDF_SIZE_MB = int(os.environ.get("MAX_PDF_SIZE_MB", "10"))
MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024


@app.post(
    "/process-pdf",
    response_model=CharacterSheetResponse,
    summary="Extract character sheet data from a PDF",
    response_description="Structured character data ready for DB insertion",
)
async def process_pdf(
    file: UploadFile = File(..., description="The character sheet PDF"),
    processor: CharacterSheetProcessor = Depends(get_processor),
) -> CharacterSheetResponse:
    """
    **Scope:** receive a PDF → send to Gemini → return validated JSON.

    The caller (Next.js Server Action) is responsible for persisting the
    returned JSON to the database.

    - **file**: A `multipart/form-data` field named `file` containing the PDF.
    - Returns `CharacterSheetResponse` on success.
    - Returns `422` if the LLM output cannot be validated.
    - Returns `500` on provider-level failures.
    """

    # --- 1. Validate MIME type ---
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a PDF.",
        )

    # --- 2. Read & size-guard ---
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_PDF_SIZE_MB} MB.",
        )

    # --- 3. Process ---
    try:
        result = await processor.process(pdf_bytes)
        return result

    except LLMAdapterError as exc:
        logger.error("LLM adapter error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))

    except ValidationError as exc:
        logger.error("Pydantic validation failed: %s", exc)
        raise HTTPException(
            status_code=422,
            detail=f"LLM returned an unexpected structure: {exc.error_count()} error(s).",
        )


# ---------------------------------------------------------------------------
# Health check (useful for Docker/K8s readiness probes)
# ---------------------------------------------------------------------------

@app.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}
