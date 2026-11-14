# Data Sources (Phase 0-8)

This document lists every required source, its intended use in AnalogAtlas, what was actually accessed/used in this build, license/attribution notes, and provenance status.

> **Compliance:** NASA does not endorse non-U.S. Government entities, products, or services. For non-U.S. sources (CSA, ESA, JAXA), follow each site's data-use terms and record attribution.

## Earth sources

| Source | URL | Intended use in AnalogAtlas | Actually accessed/used (this build) | License/attribution notes | Provenance |
|---|---|---|---|---|---|
| NASA Earthdata Search | https://search.earthdata.nasa.gov/ | Primary discovery and access for Earth datasets via `earthaccess` | HTTP reachability verified (200). `earthaccess 0.19.0` installed but credentialed login unavailable (no env credentials). No datasets downloaded. | Data products subject to individual dataset licenses/citations in Earthdata. | Fallback |
| NASA Worldview | https://worldview.earthdata.nasa.gov/index.html | Visual sanity checks of candidate sites; linked from site cards | HTTP reachability verified; links generated in app and in `docs/WORLDVIEW_SPOTCHECK.md`. | NASA Worldview imagery terms apply. | Reachable/linked |
| NASADEM / Copernicus DEM | via Earthdata / Copernicus | Terrain: slope (p50,p90), multi-scale roughness (10m/100m), elevation features | Not downloaded; synthetic feature values used in `etl/build_earth_features.py`. | NASADEM/Copernicus DEM licenses apply when used; cite appropriately. | Synthetic fallback |
| ICESat-2 | https://search.earthdata.nasa.gov/ | Terrain roughness/elevation support | Not downloaded; synthetic fallback. | NASA Earthdata terms. | Synthetic fallback |
| MODIS LST (MOD11) | https://search.earthdata.nasa.gov/ | Thermal: t_mean, t_range, t_min | Not downloaded; synthetic fallback. | NASA EOSDIS terms. | Synthetic fallback |
| ECOSTRESS | https://search.earthdata.nasa.gov/ | Thermal (where available) | Not downloaded; synthetic fallback. | NASA/JPL-Caltech terms. | Synthetic fallback |
| ASTER emissivity (AST_L1T/ASTER GED) | https://search.earthdata.nasa.gov/ | Materials: mafic/silica/carbonate indices, lithology support | Not downloaded; synthetic fallback. | NASA/METI/Japan Space Systems terms. | Synthetic fallback |
| MODIS NDVI (MOD13Q1) | https://search.earthdata.nasa.gov/ | Vegetation negative filter (keep ndvi_mean < 0.1) | Not downloaded; synthetic values generated and filter applied. | NASA EOSDIS terms. | Synthetic fallback |
| MODIS AOD (MCD19A2) | https://search.earthdata.nasa.gov/ | Aeolian: aerosol optical depth | Not downloaded; synthetic fallback. | NASA EOSDIS terms. | Synthetic fallback |
| MERRA-2 wind | https://search.earthdata.nasa.gov/ | Aeolian: wind_p95 | Not downloaded; synthetic fallback. | NASA GMAO terms. | Synthetic fallback |
| GPM precipitation (IMERG) | https://search.earthdata.nasa.gov/ | Volatiles: precipitation | Not downloaded; synthetic fallback. | NASA/JAXA GPM terms. | Synthetic fallback |
| SMAP soil moisture | https://search.earthdata.nasa.gov/ | Volatiles: soil moisture | Not downloaded; synthetic fallback. | NASA/JPL terms. | Synthetic fallback |
| NSIDC permafrost/glacier data | https://nsidc.org/ (via Earthdata) | Volatiles: permafrost/ice presence | Not downloaded; synthetic fallback. | NSIDC data use policies apply. | Synthetic fallback |
| GLiM lithology | Global Lithological Map dataset | Materials/lithology | Not downloaded; categorical placeholder in synthetic build. | Cite GLiM (Hartmann & Moosdorf) per dataset terms. | Synthetic fallback |
| SoilGrids | https://soilgrids.org/ | Soils/material context | Not downloaded; synthetic fallback. | ISRIC SoilGrids license/attribution. | Synthetic fallback |

## Moon and Mars sources

| Source | URL | Intended use | Actually accessed/used (this build) | License/attribution notes | Provenance |
|---|---|---|---|---|---|
| NASA PDS | https://pds.nasa.gov/ | Long-term archive for lunar/Martian mission data | HTTP reachability verified. No product downloads. | NASA PDS open archive; cite specific product IDs. | Reachable/fallback |
| NASA LRO (PDS Geosciences) | https://pds-geosciences.wustl.edu/missions/lro/ | LROC, LOLA, Diviner, LEND, Mini-RF | Reachable. Intended product IDs recorded in target profiles; not downloaded/computed. | NASA/PDS terms. | Fallback |
| LRO Diviner | https://pds-geosciences.wustl.edu/missions/lro/diviner.htm | Lunar surface temperatures (Tmax/Tmin), polar/resource products | Reachable. Estimated values used with intended IDs. | NASA/PDS terms. | Fallback |
| LOLA DEM/slope/roughness | LRO PDS | Terrain for Moon targets | Not computed; synthetic estimates. | NASA/PDS. | Synthetic fallback |
| LEND hydrogen, Mini-RF CPR | LRO PDS | Volatile/radar proxies | Not computed; synthetic estimates. | NASA/PDS. | Synthetic fallback |
| MOLA DEM | MGS/MRO PDS | Mars terrain | Not computed; synthetic estimates. | NASA/PDS. | Synthetic fallback |
| HiRISE/CTX derived products | MRO PDS | Mars morphology/DTMs/roughness where available | Not computed; synthetic estimates. | NASA/JPL/UA terms. | Synthetic fallback |
| THEMIS/TES thermal | Odyssey/MGS PDS | Mars thermal stats/inertia proxies | Not computed; synthetic estimates. | NASA/ASU/JPL terms. | Synthetic fallback |
| CRISM mineralogy | MRO PDS | Mars material indices | Not computed; synthetic estimates. | JHUAPL/NASA terms. | Synthetic fallback |
| SHARAD, dust/aolian products | MRO PDS / climatologies | Subsurface ice indicators, aeolian | Not computed; synthetic estimates. | NASA/ASI/PDS terms. | Synthetic fallback |

## Space agency partner sources (non-U.S.)

| Source | URL | Intended use | Actually accessed/used (this build) | License/attribution notes | Provenance |
|---|---|---|---|---|---|
| CSA RADARSAT Constellation Mission | https://donnees-data.asc-csa.gc.ca/en/dataset/rcm | SAR roughness/backscatter | HTTP reachability verified. No data downloaded. | **CSA/non-U.S.** Follow CSA data-use terms and attribution on dataset page; record license when used. | Fallback |
| CSA RADARSAT-1 (open license) | https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1 | SAR roughness/backscatter | Reachable. No data downloaded. | **CSA/non-U.S.** Open license as stated by CSA; attribute per terms. | Fallback |
| CSA SAR Python/QGIS tutorial | https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial | SAR processing guidance | Reachable/referenced for intended workflow. | Follow repository license/attribution. | Referenced |
| ESA Copernicus Data Space Ecosystem | https://dataspace.copernicus.eu/ | Sentinel-1 SAR backscatter, Sentinel-2 | Reachable. Credentials not configured; no data downloaded. | **ESA/Copernicus/non-U.S. (EU).** Copernicus data free/open per EU Copernicus Programme; cite Sentinel data per guidelines. | Fallback |
| ESA Open Science Catalog | https://opensciencedata.esa.int/ | Open science products | Reachable. Not used. | **ESA/non-U.S.** Follow product-specific terms. | Reachable |
| JAXA G-Portal | https://gportal.jaxa.jp/gpr/index/index | Precipitation, snow, vegetation products | Reachable. Credentials not configured; no data downloaded. | **JAXA/non-U.S.** Follow JAXA/G-Portal data use policy and attribution requirements. | Fallback |

## Community
- Space Apps Connect: https://github.com/nasa/spaceapps (linked in README for questions).

## Provenance summary
- **Synthetic fallback (this build):** Earth hex features, target profiles, and derived scores/case studies are generated as clearly labeled synthetic/estimated placeholders to demonstrate end-to-end pipeline logic. All are tagged `provenance: synthetic` in data/UI and documented in `docs/ASSUMPTIONS.md`. **Never present synthetic data as real results.**
- **Real-data path:** Re-run ETL with authenticated `earthaccess`/partner APIs, download cited products, compute baselines per `scoring/config.yaml`, regenerate parquet/GeoJSON/scores, and update provenance flags to `observed/derived` with product citations.
