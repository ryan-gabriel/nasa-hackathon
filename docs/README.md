# AnalogAtlas Web Docs

Documentation relevant to the `web/` app (React + Vite + TypeScript, MapLibre GL, ECharts). The app loads precomputed data from `web/public/data/`.

## Documents
- [RUNNING_THE_WEB_APP.md](RUNNING_THE_WEB_APP.md) — How to run locally (dev/build/preview/static), features, and troubleshooting.
- [DATA_SOURCES.md](DATA_SOURCES.md) — Data sources, intended use, access status, license/attribution, and provenance.
- [DATA_DICTIONARY.md](DATA_DICTIONARY.md) — Fields shown/used by the app (hex features, `sim_*` dimensions, totals, breakdowns, tags, provenance).
- [NASA_SOURCE_VERIFICATION.md](NASA_SOURCE_VERIFICATION.md) — Live verification of NASA.gov sources; GIBS imagery overlay is a verified NASA source used in the map.
- [API_SOURCES.md](API_SOURCES.md) — NASA/public API endpoints and auth/provenance notes.

## Key notes
- **Precomputed data:** `public/data/scores_<target>.geojson` (no heavy runtime computation).
- **Provenance:** This build uses `provenance: synthetic` fallback scores/features (labeled in UI); NASA GIBS overlay provides verified real imagery for context.
- **Parameters:** Users can include/exclude scored dimensions and adjust weights for live re-ranking over available data.

For full project docs (methodology, validation, case studies, assumptions), see the repository root `docs/` folder.