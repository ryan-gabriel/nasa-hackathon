"""
AnalogAtlas web data retrieval orchestrator.

Run from the web/ folder (recommended when only web is pushed to GitHub):
  python scripts/retrieve_data.py
  python scripts/retrieve_data.py --skip-verified-fetch

What it does (no credentials required):
- Verifies NASA GIBS/ODE endpoints
- Fetches verified NASA PDS ODE product/metadata records -> web/data/verified_sources/

What needs credentials / extra work:
- Real Earth EO numeric downloads (MODIS/ASTER/SMAP/MERRA-2/GPM/ICESat-2/NASADEM/NSIDC, etc.) require Earthdata Login.
  Set EARTHDATA_USERNAME/PASSWORD or EARTHDATA_TOKEN in web/.env, then run authenticated earthaccess ETL to download
  into web/data/raw/ and produce processed features in web/data/processed/.
- Full pixel-level computation from PDS products requires downloading referenced products and processing.

Data locations (inside web/):
- web/data/verified_sources/   verified NASA ODE records (real NASA DB metadata)
- web/data/raw/                raw downloads/products/rasters (you add real data here)
- web/data/interim/            intermediate/cache
- web/data/processed/          processed features/targets/scores
- web/public/data/             GeoJSON used by the web app UI
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

WEB_ROOT = Path(__file__).resolve().parents[1]
PY = sys.executable


def run_step(name: str, args: list[str]) -> bool:
    print(f"\n==> {name}")
    print(" ", " ".join(args))
    r = subprocess.run(args, cwd=str(WEB_ROOT))
    ok = r.returncode == 0
    print(f"<== {name}: {'OK' if ok else 'FAILED'} (exit {r.returncode})")
    return ok


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-verified-fetch", action="store_true", help="Skip fetching ODE product records")
    args = ap.parse_args()

    sys.path.insert(0, str(WEB_ROOT / "scripts"))
    try:
        from env import load_project_env
        load_project_env()
    except Exception:
        pass

    results = {}
    results["verify_sources"] = run_step(
        "Verify NASA sources (GIBS/ODE)",
        [PY, str(WEB_ROOT / "scripts" / "nasa_sources.py")],
    )
    if not args.skip_verified_fetch:
        results["fetch_verified_ode"] = run_step(
            "Fetch verified NASA ODE product records -> data/verified_sources/",
            [PY, str(WEB_ROOT / "scripts" / "fetch_nasa_verified.py")],
        )
    else:
        results["fetch_verified_ode"] = None

    has_ed = bool(os.getenv("EARTHDATA_USERNAME") or os.getenv("EARTHDATA_TOKEN"))
    results["earthdata_credentials_detected"] = has_ed

    print("\n=== Retrieval summary ===")
    print(json.dumps(results, indent=2, default=str))
    print("\nData locations (web/):")
    print(f" - Verified NASA ODE records: {WEB_ROOT / 'data' / 'verified_sources'}")
    print(f" - Raw downloads (real products/rasters): {WEB_ROOT / 'data' / 'raw'}")
    print(f" - Intermediates/cache: {WEB_ROOT / 'data' / 'interim'}")
    print(f" - Processed outputs: {WEB_ROOT / 'data' / 'processed'}")
    print(f" - Web app data (GeoJSON): {WEB_ROOT / 'public' / 'data'}")
    if not has_ed:
        print("\nNOTE: EARTHDATA credentials not detected in web/.env. Real Earth EO downloads require Earthdata Login.")
    return 0 if results.get("verify_sources") and (results.get("fetch_verified_ode") in (True, None)) else 1


if __name__ == "__main__":
    raise SystemExit(main())
