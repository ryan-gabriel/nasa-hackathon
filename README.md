# AnalogAtlas Web

React + Vite + TypeScript web app for exploring multi-dimensional planetary analogs (Moon/Mars targets vs Earth candidates). The UI loads **precomputed** GeoJSON from `public/data/`.

> **Note:** Current demo data may be labeled `provenance: synthetic` unless replaced by real ETL outputs. NASA GIBS map overlay is a verified real NASA imagery source when enabled. See `docs/`.

## Quick start (run the website)
```powershell
cd web
npm install
npm run dev
```
Open the URL shown by Vite (usually http://localhost:5173).

Production preview:
```powershell
cd web
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## Retrieve data using the script + `.env`
If this `web/` folder is used as a standalone repo, use the included scripts to verify/fetch available NASA data:

1. **Create env file (for credentials/keys):**
   ```powershell
   copy .env.example .env
   ```
   Edit `web/.env` and fill values as needed:
   - `EARTHDATA_USERNAME` / `EARTHDATA_PASSWORD` **or** `EARTHDATA_TOKEN` (NASA Earthdata Login) for authenticated EO downloads.
   - Optional: Copernicus/JAXA credentials if you use those APIs.
   > `.env` is gitignored; `.env.example` is the template. **Do not use `VITE_`** and do not expose secrets in browser code.

2. **Install Python deps for scripts (one time):**
   ```powershell
   python -m venv .venv
   .venv\Scripts\pip install -r scripts/requirements.txt
   # for real Earthdata downloads/ETL later: .venv\Scripts\pip install earthaccess
   ```

3. **Run retrieval script (from `web/`):**
   ```powershell
   .venv\Scripts\python scripts/retrieve_data.py
   ```
   - Verifies NASA GIBS/ODE endpoints (public)
   - Fetches **verified NASA PDS ODE product/metadata records** (real NASA DB records, no auth) into `data/verified_sources/`
   - Detects if Earthdata credentials are present in `.env`

   Useful flags: `--skip-verified-fetch`

## Where data is stored (inside `web/`)
| Path | What goes here |
|---|---|
| `.env` | Your credentials/keys (from `.env.example`) — **not committed** |
| `data/raw/` | Raw downloaded products/rasters (Earthdata granules, PDS files, etc.) |
| `data/interim/` | Intermediate/cache processing outputs |
| `data/processed/` | Processed features/targets/scores |
| `data/verified_sources/` | Verified NASA ODE product/metadata records fetched by script |
| `public/data/` | GeoJSON consumed by the web UI (`scores_<target>.geojson`) |

## Notes on real vs fallback data
- **No-auth retrieval:** GIBS imagery (verified) and ODE product/metadata records can be fetched without credentials.
- **Earth EO numeric features:** require Earthdata Login + dataset downloads/ETL (not a one-shot public fetch). After producing real features/scores, place/update GeoJSON in `public/data/` for the app.
- **Secrets:** keep credentials in `.env` for scripts/ETL only; never expose in frontend code.

More details: `docs/RUNNING_THE_WEB_APP.md`, `docs/DATA_SOURCES.md`, `docs/NASA_SOURCE_VERIFICATION.md`, `docs/DATA_DICTIONARY.md`.
