"""
local_db.py — Lightweight SQLite repository for OCR test results.

Responsibilities (Single Responsibility):
  - Create the results table if it doesn't exist.
  - Insert a validated CharacterSheetResponse.
  - Query all stored results.

Uses only Python's stdlib `sqlite3` — no extra dependencies.
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

from src.schemas import CharacterSheetResponse

# The SQLite file lives alongside this module inside ocr_service/local_db/
DB_PATH = Path(__file__).parent / "results.db"


def _get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create the results table if it doesn't exist yet."""
    with _get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS ocr_results (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                source_file TEXT    NOT NULL,
                created_at  TEXT    NOT NULL,
                name        TEXT,
                raw_json    TEXT    NOT NULL
            )
            """
        )
        conn.commit()


def save_result(source_file: str, response: CharacterSheetResponse) -> int:
    """
    Persist a CharacterSheetResponse to the local SQLite DB.

    Args:
        source_file: Filename of the PDF that was processed.
        response:    The validated Pydantic model to store.

    Returns:
        The auto-incremented row id of the inserted record.
    """
    raw_json = response.model_dump_json(indent=2)
    now = datetime.utcnow().isoformat()

    with _get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO ocr_results (source_file, created_at, name, raw_json)
            VALUES (?, ?, ?, ?)
            """,
            (source_file, now, response.name, raw_json),
        )
        conn.commit()
        return cursor.lastrowid  # type: ignore[return-value]


def list_results() -> list[dict]:
    """Return all stored results as plain dicts (for pretty-printing)."""
    with _get_connection() as conn:
        rows = conn.execute(
            "SELECT id, source_file, created_at, name FROM ocr_results ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


def get_result_by_id(row_id: int) -> dict | None:
    """Return the full JSON for a single result row."""
    with _get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM ocr_results WHERE id = ?", (row_id,)
        ).fetchone()
        if row is None:
            return None
        data = dict(row)
        data["parsed"] = json.loads(data["raw_json"])
        return data
