# API & NASA.gov Sources

NASA/public APIs and services relevant to AnalogAtlas, with access/auth notes and verification status. See [NASA_SOURCE_VERIFICATION.md](NASA_SOURCE_VERIFICATION.md) for live check results.

## 1) NASA GIBS — Global Imagery Browse Services (Earth imagery)
- **Type:** WMTS/WMS/TWMS/XYZ map imagery tiles (pre-rendered visualizations, **not** raw numeric science rasters)
- **Auth:** None (public)
- **Base:** `https://gibs.earthdata.nasa.gov`
- **Examples:**
  - Capabilities: `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml`
  - WMTS tile (REST): `https://gibs.earthdata.nasa.gov/wmts/{epsg4326|epsg3857}/best/{Layer}/default/{Time}/{TileMatrixSet}/{z}/{y}/{x}.{jpg|png}`
  - Sample: `.../MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/250m/0/0/0.jpg`
- **Verified:** Yes (HTTP 200, real tile/capabilities). Integrated as optional web map overlay.
- **Docs:** https://nasa-gibs.github.io/gibs-api-docs/ , https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api
- **Attribution:** Imagery provided by services from NASA's GIBS, part of NASA EOSDIS.

## 2) PDS Geosciences ODE REST (orbital/planetary data)
- **Type:** Product metadata/search, footprints, granular queries (Moon/Mars/Mercury/Venus)
- **Auth:** None for queries
- **Base:** `https://oderest.rsl.wustl.edu/live2/` (GDS: `https://oderest.rsl.wustl.edu/livegds`)
- **Use:** Discover LRO (LOLA, Diviner, LROC, Mini-RF, LEND), MRO/MGS (MOLA, HiRISE, CTX, CRISM, THEMIS/TES) products and subsets for target feature computation.
- **Notes:** Requires correct `ihid`/`iid`/`pt` (IIPT) or `PDSId`/`ODEID`; see ODE docs/manuals and GDS query tools (e.g. Diviner RDR, LOLA RDR).
- **Verified:** Reachable/live JSON responses (see verification doc/artifacts).

## 3) PDS Search API (NASA PDS)
- **Type:** Search/resolve/crawl PDS products across nodes
- **Auth:** None for search (public)
- **Base (documented):** `https://pds.nasa.gov/api/search/1/` (and node-specific variants)
- **Examples (per docs):** `/products`, `/properties`, `/classes`, resolve by lid/lidvid, members/member-of, query params (`q`, `limit`, `fields`, etc.)
- **Docs:** https://nasa-pds.github.io/pds-api/guides/search/endpoints.html
- **Verified:** NASA.gov host reachable (behavior/paths may vary by deployment; confirm request format).

## 4) NASA Earthdata (CMR + earthaccess) — Earth observation downloads
- **Type:** Discovery and download of Earth science granules (MODIS LST/NDVI/AOD, ASTER, ECOSTRESS, MERRA-2, GPM, SMAP, ICESat-2, NASADEM/Copernicus DEM via catalog, NSIDC, etc.)
- **Auth:** **Required** for most data downloads (Earthdata Login). Search may be public.
- **Tools:** `earthaccess` Python library, https://search.earthdata.nasa.gov/
- **Example flow:**
  ```python
  import earthaccess
  earthaccess.login()  # EARTHDATA_USERNAME/PASSWORD or EARTHDATA_TOKEN
  results = earthaccess.search_data(short_name="MOD11A1", temporal=("2020-01-01","2020-12-31"), bounding_box=(...))
  files = earthaccess.download(results, "data/raw/...")
  ```
- **Status in this build:** Not authenticated; Earth numeric features use `provenance: synthetic` fallbacks.

## 5) Partner/open sources (non-U.S., follow terms/attribution)
- **ESA Copernicus Data Space Ecosystem:** https://dataspace.copernicus.eu/ (Sentinel-1/2; auth for API/download)
- **ESA Open Science Catalog:** https://opensciencedata.esa.int/
- **CSA RCM/RADARSAT:** https://donnees-data.asc-csa.gc.ca/en/dataset/rcm , https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1 ; tutorial https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial
- **JAXA G-Portal:** https://gportal.jaxa.jp/gpr/index/index (account for downloads)

## Run verification helper
```powershell
# from repo root
.venv\Scripts\python.exe etl\nasa_sources.py
```
Outputs JSON status for GIBS (tile fetch) and ODE (reachability probe). Use with [NASA_SOURCE_VERIFICATION.md](NASA_SOURCE_VERIFICATION.md).