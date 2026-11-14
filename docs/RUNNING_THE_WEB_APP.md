# Running the Web App (and retrieving data)

This guide covers running the AnalogAtlas web UI and using the included scripts to retrieve/verify NASA data (useful when `web/` is pushed as its own repo).

## Prerequisites
- **Node.js + npm** (for the web app)
- **Python 3.11+** (for `scripts/` data retrieval helpers)
- Internet access for map tiles (OSM) and NASA GIBS overlay; public NASA APIs for verification/fetch

## 1) Run the website
```powershell
cd web
npm install
npm run dev
```
Open the URL Vite prints (typically http://localhost:5173). The app loads precomputed GeoJSON from `public/data/`.

Build & preview:
```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## 2) Configure `.env` (credentials/keys)
1. Copy the template:
   ```powershell
   copy .env.example .env
   ```
2. Fill in values in `web/.env` as needed:
   - `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD` **or** `EARTHDATA_TOKEN` — NASA Earthdata Login (for authenticated EO downloads via `earthaccess`)
   - Optional: `COPERNICUS_*`, `JAXA_GPORTAL_*`

**Important:**
- `.env` is gitignored; never commit secrets.
- Scripts auto-load `web/.env` (see `scripts/env.py`).
- **Do not** add `VITE_` prefix and **do not** use these secrets in frontend/browser code.

## 3) Retrieve/verify data using the script
Install script dependencies once:
```powershell
python -m venv .venv
.venv\Scripts\pip install -r scripts/requirements.txt
# optional for authenticated Earthdata downloads later:
# .venv\Scripts\pip install earthaccess
```

Run the orchestrator from `web/`:
```powershell
.venv\Scripts\python scripts/retrieve_data.py
```
What it does now (no credentials required):
- Verifies NASA endpoints (GIBS, ODE REST)
- Fetches **verified NASA PDS ODE product/metadata records** into `data/verified_sources/` (real NASA database records)
- Reports whether Earthdata credentials are detected

Flags:
- `--skip-verified-fetch` — skip ODE record fetch

Individual scripts:
- `scripts/nasa_sources.py` — endpoint verification
- `scripts/fetch_nasa_verified.py` — fetch ODE records

## 4) Where data is stored
| Path | Purpose |
|---|---|
| `data/raw/` | Raw downloaded real products/rasters (put Earthdata/PDS files here) |
| `data/interim/` | Intermediate/cache outputs |
| `data/processed/` | Processed features/targets/scores |
| `data/verified_sources/` | Verified NASA ODE product/metadata records (fetched) |
| `public/data/` | GeoJSON consumed by the web UI |
| `.env` | Local credentials (gitignored) |

## 5) Real data vs fallback
- **Available without auth:** NASA GIBS imagery (verified, used as map overlay) and ODE product/metadata records fetched by the script.
- **Requires Earthdata Login/ETL:** raw numeric Earth EO datasets (MODIS, ASTER, SMAP, MERRA-2, GPM, ICESat-2, NASADEM, NSIDC, etc.). After authenticated download + processing, regenerate features/scores and update `public/data/*.geojson` so the web app uses real derived data.
- **Targets:** verified ODE source records can be fetched; full pixel-level feature computation requires downloading referenced products.

## 6) Web UI features
- Target picker, per-parameter include/exclude + weights (live re-ranking), H3 score map, hex details (radar, matches/breakdowns, mission tags, provenance), NASA GIBS overlay toggle, novelty toggle, ranked list/Pareto, NOT-ANALOGUABLE Earth-limits panel.

See also: `docs/DATA_SOURCES.md`, `docs/NASA_SOURCE_VERIFICATION.md`, `docs/DATA_DICTIONARY.md`, `docs/API_SOURCES.md`.
