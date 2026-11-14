# Running the Web App

The AnalogAtlas web app is a static/client-side app (React + Vite + TypeScript, MapLibre GL, ECharts) that loads **precomputed** data from `web/public/data/` (served as `data/*.geojson`). No backend is required.

## Prerequisites
- Node.js 18+ and npm (`node -v`, `npm -v`)
- Internet access for basemap tiles (OpenStreetMap) and the optional NASA GIBS imagery overlay (verified NASA.gov source)

## 1) Install dependencies (first time)
```powershell
cd web
npm install
```

## 2a) Development server
```powershell
cd web
npm run dev
```
Open the URL printed by Vite (typically http://localhost:5173).

## 2b) Production build + preview
```powershell
cd web
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```
Open http://127.0.0.1:4173. Build output is in `web/dist`.

## 2c) Serve the built `dist` folder
Any static server works (must serve over HTTP so fetches succeed), e.g.:
```powershell
cd web
npx serve dist
```

## Features to try
- **Target picker:** Mars (Jezero) / Moon (Shackleton rim).
- **Parameters:** include/exclude scored dimensions and adjust weights (live re-ranking).
- **Map:** H3 hexes colored by total score; toggle **NASA GIBS imagery (verified)** overlay.
- **Details:** click a hex or ranked item for radar chart, matches/breakdowns, mission tags, provenance, Worldview/Earthdata links.
- **Novelty:** hide known analogs; Pareto-front highlights in ranked list.
- **Earth limits:** gravity, vacuum/pressure, radiation shown as NOT ANALOGUABLE.

## Data & provenance
- Scores/features loaded from `web/public/data/scores_mars_jezero.geojson` and `scores_moon_shackleton_rim.geojson`.
- In this build, data is labeled `provenance: synthetic` (fallback). NASA GIBS overlay is a verified real NASA.gov imagery source (visual context). See `docs/DATA_SOURCES.md` and `docs/NASA_SOURCE_VERIFICATION.md`.

## Troubleshooting
- **Blank map/hexes not loading:** ensure you are using `npm run dev`/`preview` or a static server (not `file://`), and that `data/*.geojson` files exist under `web/public/data/` (or `web/dist/data/` after build).
- **GIBS overlay missing:** requires internet access to `gibs.earthdata.nasa.gov`; toggle it off/on in the map control.