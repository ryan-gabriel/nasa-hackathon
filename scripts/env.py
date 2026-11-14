"""Load environment variables for web-side AnalogAtlas scripts.

Looks for:
- web/.env (preferred, same folder level as package.json when run from web/)
- web/scripts/.env (fallback)

Secrets are for local scripts/ETL only; do not expose them in browser/Vite client code.
"""
from __future__ import annotations

from pathlib import Path

WEB_ROOT = Path(__file__).resolve().parents[1]


def load_project_env() -> None:
    try:
        from dotenv import load_dotenv
    except Exception:
        return
    for p in [WEB_ROOT / ".env", WEB_ROOT / "scripts" / ".env"]:
        if p.exists():
            load_dotenv(dotenv_path=p, override=False)
