# Data Dictionary

Schema and key fields used by AnalogAtlas. See `scoring/config.yaml` for authoritative feature definitions (source, unit, baseline, statistic).

## 1) Target profiles (`data/processed/targets/<target>.json`)
| Field | Type | Description |
|---|---|---|
| `id` | string | Target identifier (e.g. `mars_jezero`, `moon_shackleton_rim`) |
| `body` | string | `mars` or `moon` |
| `name` | string | Human-readable site name |
| `mvp` | bool | Included in MVP |
| `provenance` | string | Data provenance (e.g. `synthetic`, `observed/derived` when real) |
| `provenance_note` | string | Explanation/caveats |
| `coordinates` | object | `{lat, lon, crs}` |
| `features.<dimension>.<feature>` | object | Feature entry (see below) |

**Feature entry:** `value` (number|string|null), `unit`, `baseline_m`, `uncertainty`, `source_product_ids` (array), `status` (`estimated`|`missing`|`constant`|`ok`), optional `confidence`. **Missing dimensions/features are `null` with `status:"missing"` and never filled.**

## 2) Earth feature cube (`data/processed/earth_hex_features.parquet`)
One row per H3 hexagon (land, NDVI-filtered) with aggregated features and metadata.

| Field/group | Description |
|---|---|
| `hex_id` | H3 cell index (res per `scoring/config.yaml`, MVP res 6) |
| `lat`, `lon` | Hex center coordinates (EPSG:4326) |
| `h3_res` | H3 resolution |
| `seed_region`, `profile` | Generation/region context (synthetic build) |
| `provenance`, `provenance_note` | `synthetic` in this build; real ETL should set observed/derived |
| `data_quality`, `quality_score` | Quality indicators |
| Terrain | `slope_p50`, `slope_p90` (deg), `rough_10m`, `rough_100m` (m RMS), `crater_feature_index` (0-1, optional) |
| Thermal | `t_mean`, `t_range`, `t_min` (K) |
| Materials | `mafic_idx`, `silica_idx`, `carbonate_idx` (index), `lithology_class` (class) |
| Volatiles | `precip` (mm/yr), `soil_moist` (m3/m3), `permafrost` (0-1) |
| Aeolian | `wind_p95` (m/s), `aod` (unitless), `dune_frac` (0-1) |
| Filter | `ndvi_mean` (NDVI; rows kept where `< 0.1`) |
| Stretch (low-confidence) | `subsurface_*`, `ops_*` indicators as available |

## 3) Scores (`data/processed/scores_<target>.parquet`, `web/public/data/scores_<target>.geojson`)
Per-hex comparison against a target (precomputed).

| Field | Description |
|---|---|
| `sim_terrain|thermal|materials|volatiles|aeolian` | Per-dimension similarity in [0,1] or null if dimension missing/unavailable |
| `status_<dimension>` | `ok` or `missing` (target data unavailable/not applicable) |
| `total_score_equal` | Mean of available scored dimensions (equal weights) |
| `_dynTotal` (web, client-side) | User-weighted total over **included** available parameters (live re-ranking) |
| `breaks_down`, `breakdown_count` | Any dimension below threshold (default 0.3) or missing comparison |
| `breakdown_reasons` | JSON array of plain-language reasons |
| `mission_tags` | JSON array of rule-derived mission-use tags |
| `is_novel` | Outside known-analog buffer/mask logic |
| `pareto_front` | Non-dominated across scored dimensions (precomputed) |
| `provenance`, `data_quality` | Carried from inputs |

## 4) Scored dimensions & not analoguable
- **Scored (independent 0–1):** Terrain, Thermal, Materials, Volatiles, Aeolian.
- **Filter only:** Vegetation (`ndvi_mean < 0.1`, not scored).
- **Stretch (low-confidence):** Subsurface, Operations/biology.
- **Not analoguable (never scored):** Gravity, atmosphere pressure/vacuum, radiation — always reported as limits/caveats.

## 5) Provenance values
- `synthetic` — generated/estimated fallback (this build); **not real observational results**.
- Future real runs should use `observed`, `derived`, or product-specific provenance with citations/product IDs.