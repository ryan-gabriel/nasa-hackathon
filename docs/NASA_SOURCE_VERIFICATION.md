# NASA Source Verification (live checks)

Date: 2026-11-14 (environment: C:\Codes\Projects\nasa-hackathon)

This document records **live verification** of NASA.gov-accessible APIs/services attempted from this environment, to support replacing synthetic fallbacks with real NASA sources where possible.

## 1) NASA GIBS (Global Imagery Browse Services) — VERIFIED WORKING (no auth)
- **Service:** WMTS/WMS imagery tiles (public, no API key). https://gibs.earthdata.nasa.gov
- **Capabilities (verified):** `GET https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml` returned HTTP 200 with valid WMTS Capabilities XML (saved: `docs/source_verification/gibs_capabilities_snippet.xml`).
- **Tile fetch (verified):** `GET https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/250m/0/0/0.jpg`
  - HTTP 200, `Content-Type: image/jpeg`, `Content-Length: 53814`
  - `Layer-Identifier-Actual: MODIS_Terra_CorrectedReflectance_TrueColor_v6.1_STD`, `Layer-Time-Actual: 2024-01-01T00:00:00Z`
  - Headers saved: `docs/source_verification/gibs_tile_headers.txt`
- **Use in AnalogAtlas:** Real NASA imagery overlay/context in web map (verified source). **Note:** GIBS provides pre-rendered imagery tiles, not raw numeric science rasters (LST/slope/material values) for feature extraction.
- **Attribution:** "Imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's EOSDIS."

## 2) PDS Geosciences ODE REST — VERIFIED REACHABLE (public)
- **Endpoint:** `https://oderest.rsl.wustl.edu/live2/` (and GDS: `https://oderest.rsl.wustl.edu/livegds`)
- **Live response (verified):** Requests return JSON with ODE status/metadata (e.g. `ODEResults` with `Status`, `QuerySummary`, `Date`, `Query_Elapsed_Time`; error responses indicate parameter requirements/IIPT validation), confirming the service is live and queryable.
  - Example probe: `GET .../live2/?query=product&results=c&target=moon&limit=1&output=JSON` → JSON error requesting valid IHID/IID/PT or PDSId/ODEID (service reachable, parameterized).
  - IIPT queries executed and responses saved: `docs/source_verification/ode_iipt_lro_diviner.json`, `docs/source_verification/ode_iipt_lro_lola.json` (large JSON payloads returned; content includes instrument/product type listings).
- **Use in AnalogAtlas:** Intended for LRO LOLA/Diviner/Mini-RF and Mars (MRO/MGS) product discovery/metadata and granular queries to compute target features from real PDS data.
- **Note:** Correct IIPT/PT parameters must be selected per instrument/product; downloads/processing of large products not performed in this verification pass.

## 3) PDS Search API (pds.nasa.gov/api/search) — REACHABLE, endpoint behavior noted
- **Endpoint family:** `https://pds.nasa.gov/api/search/1/...` (documented)
- **Live check:** `GET https://pds.nasa.gov/api/search/1/` returned HTTP 406 with `{"title":"Not Acceptable","status":406,"detail":"Acceptable representations: [text/html]."}` — confirms service responds at NASA.gov host; JSON search endpoints may require specific paths/headers/versions per current deployment.
- **Use in AnalogAtlas:** Product search/resolve/crawl as per PDS API docs when accessible with correct request format; fallback to ODE/PDS Geosciences nodes for orbital data.

## 4) Earthdata (CMR/earthaccess) — requires authentication for downloads
- **Status:** `search.earthdata.nasa.gov` reachable; `earthaccess` installed but `login(strategy='environment')` unavailable without `EARTHDATA_USERNAME`/`EARTHDATA_PASSWORD` or `EARTHDATA_TOKEN`. Raw numeric Earth EO downloads (MODIS/SMAP/MERRA-2/ASTER/ICESat-2/NSIDC etc.) not performed.
- **Impact:** Earth feature cube remains `provenance: synthetic` until authenticated ETL is run.

## Summary
| Source | NASA.gov | Verified | Auth | Integrated now |
|---|---:|---:|---:|---|
| GIBS WMTS/WMS imagery | Yes | **Yes (200, real tiles/capabilities)** | No | Web map overlay toggle (real NASA imagery) |
| ODE REST / GDS | Yes (PDS Geosciences) | Reachable/live JSON responses | No (query) | Client/verification artifacts; full target ETL pending correct IIPT & processing |
| PDS Search API | Yes | Reachable (406 noted) | No (search) | Docs/verification; use per working endpoints |
| Earthdata downloads | Yes | Reachable, auth missing | Yes | Pending credentials |

**Conclusion:** Real NASA.gov data sources are verified as available/usable (especially GIBS with no auth). Web now includes verified NASA GIBS imagery; planetary/Earth numeric feature ingestion requires parameter-correct ODE/PDS queries and/or Earthdata credentials plus raster ETL to replace synthetic values. All synthetic outputs remain clearly labeled.
