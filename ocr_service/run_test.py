#!/usr/bin/env python3
"""
run_test.py — Local end-to-end test script.

Usage:
    # Process the first PDF found in samples/
    python run_test.py

    # Process a specific PDF
    python run_test.py samples/my_character.pdf

    # List all previously stored results
    python run_test.py --list

    # Show the full JSON of a specific result (by DB row id)
    python run_test.py --show 3

This script calls the processor directly — no HTTP server needed.
Run it from inside the ocr_service/ directory:

    cd ocr_service
    python run_test.py samples/my_sheet.pdf
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# ── Make sure ocr_service/ is on sys.path ──────────────────────────────────
# This lets us import src.* and local_db.* without installing the package.
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

# ── Load .env before importing anything that reads env vars ────────────────
from dotenv import load_dotenv  # noqa: E402 — intentional late import
load_dotenv(ROOT / ".env")

from src.adapters.gemini_adapter import GeminiAdapter  # noqa: E402
from src.core.processor import CharacterSheetProcessor  # noqa: E402
from src.interfaces import LLMAdapterError  # noqa: E402
from local_db.local_db import init_db, save_result, list_results, get_result_by_id  # noqa: E402

SAMPLES_DIR = ROOT / "samples"

# ── Colour helpers (degrade gracefully on Windows without ANSI support) ────
GREEN = "\033[92m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

def _h(label: str, colour: str = CYAN) -> str:
    return f"{colour}{BOLD}{label}{RESET}"


# ── Sub-commands ───────────────────────────────────────────────────────────

def cmd_list() -> None:
    """Print a table of all results stored in the local DB."""
    init_db()
    rows = list_results()
    if not rows:
        print(f"{YELLOW}No results stored yet.{RESET}")
        return

    print(f"\n{_h('Stored OCR results', CYAN)}\n")
    print(f"{'ID':>4}  {'Name':<30}  {'Source File':<35}  {'Created At'}")
    print("─" * 90)
    for r in rows:
        print(
            f"{r['id']:>4}  "
            f"{(r['name'] or '(unknown)'):<30}  "
            f"{r['source_file']:<35}  "
            f"{r['created_at']}"
        )
    print()


def cmd_show(row_id: int) -> None:
    """Pretty-print the full JSON for a stored result."""
    init_db()
    result = get_result_by_id(row_id)
    if result is None:
        print(f"{RED}No result with id={row_id}{RESET}")
        sys.exit(1)

    source_file = result["source_file"]
    print(f"\n{_h(f'Result #{row_id} — {source_file}', CYAN)}")
    print(f"Character : {result['name'] or '(unknown)'}")
    print(f"Stored at : {result['created_at']}\n")
    print(json.dumps(result["parsed"], indent=2))


async def cmd_process(pdf_path: Path) -> None:
    """Run the full PDF → Gemini → SQLite pipeline."""
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(f"{RED}ERROR: GOOGLE_API_KEY is not set.{RESET}")
        print(f"  → Run: export GOOGLE_API_KEY='your_key'  or fill ocr_service/.env")
        sys.exit(1)

    if not pdf_path.exists():
        print(f"{RED}ERROR: File not found: {pdf_path}{RESET}")
        sys.exit(1)

    if pdf_path.suffix.lower() != ".pdf":
        print(f"{YELLOW}WARNING: '{pdf_path.name}' does not have a .pdf extension.{RESET}")

    print(f"\n{_h('VDA Character Sheet OCR — Local Test', GREEN)}")
    print(f"  PDF    : {pdf_path}")
    print(f"  Model  : {os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash')}")
    print(f"  DB     : {ROOT / 'local_db' / 'results.db'}\n")

    # Wire dependencies
    adapter = GeminiAdapter(
        api_key=api_key,
        model_name=os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
    )
    processor = CharacterSheetProcessor(llm_adapter=adapter)

    # Read PDF
    print("📄  Reading PDF…")
    pdf_bytes = pdf_path.read_bytes()
    print(f"    {len(pdf_bytes):,} bytes loaded.\n")

    # Process
    print("🤖  Sending to Gemini…")
    try:
        result = await processor.process(pdf_bytes)
    except LLMAdapterError as exc:
        print(f"\n{RED}LLM ERROR: {exc}{RESET}")
        sys.exit(1)

    # Save to DB
    init_db()
    row_id = save_result(pdf_path.name, result)

    # Print summary
    print(f"\n{_h('✅  Extraction complete!', GREEN)}")
    print(f"  Character : {result.name or '(name not found)'}")
    print(f"  DB row id : {row_id}")
    print(f"\n{_h('Raw JSON:', CYAN)}")
    print(result.model_dump_json(indent=2))
    print(f"\n💾  Saved to local DB. Use  {YELLOW}python run_test.py --show {row_id}{RESET}  to review later.")


# ── Entry point ────────────────────────────────────────────────────────────

def main() -> None:
    args = sys.argv[1:]

    if not args:
        # Auto-pick first PDF in samples/
        pdfs = sorted(SAMPLES_DIR.glob("*.pdf"))
        if not pdfs:
            print(f"{YELLOW}No PDFs found in {SAMPLES_DIR}.{RESET}")
            print("  → Drop a PDF there or pass its path as an argument.")
            print(f"  → Usage: python run_test.py samples/my_sheet.pdf")
            sys.exit(0)
        asyncio.run(cmd_process(pdfs[0]))

    elif args[0] == "--list":
        cmd_list()

    elif args[0] == "--show":
        if len(args) < 2 or not args[1].isdigit():
            print(f"{RED}Usage: python run_test.py --show <id>{RESET}")
            sys.exit(1)
        cmd_show(int(args[1]))

    else:
        # Treat first arg as a PDF path
        asyncio.run(cmd_process(Path(args[0])))


if __name__ == "__main__":
    main()
