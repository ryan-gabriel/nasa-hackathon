"""Verified NASA.gov source access helpers (web-side copy)."""
from __future__ import annotations

import json
from pathlib import Path
import sys
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    from env import load_project_env
    load_project_env()
except Exception:
    pass

GIBS_SAMPLE_TILE = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/250m/0/0/0.jpg"
ODE_BASE = "https://oderest.rsl.wustl.edu/live2/"


def _get(url: str, accept: str | None = None, timeout: int = 30):
    headers = {"User-Agent": "AnalogAtlas/1.0 (source-verification)"}
    if accept:
        headers["Accept"] = accept
    req = Request(url, headers=headers)
    with urlopen(req, timeout=timeout) as r:
        return r.status, dict(r.headers), r.read()


def verify_gibs():
    s, h, b = _get(GIBS_SAMPLE_TILE)
    return {
        "source": "NASA GIBS",
        "verified": s == 200 and int(h.get("Content-Length", len(b))) > 0,
        "status": s,
        "content_type": h.get("Content-Type"),
        "content_length": int(h.get("Content-Length", len(b))),
        "layer_actual": h.get("Layer-Identifier-Actual"),
        "time_actual": h.get("Layer-Time-Actual"),
        "url": GIBS_SAMPLE_TILE,
        "auth_required": False,
    }


def verify_ode():
    url = ODE_BASE + "?query=product&results=c&target=moon&limit=1&output=JSON"
    s, h, b = _get(url, accept="application/json")
    data = json.loads(b.decode("utf-8", errors="replace"))
    status = (data.get("ODEResults") or {}).get("Status")
    return {
        "source": "PDS Geosciences ODE REST",
        "reachable": s == 200 and "ODEResults" in data,
        "http_status": s,
        "ode_status": status,
        "query_summary": (data.get("ODEResults") or {}).get("QuerySummary"),
        "url": url,
        "auth_required": False,
    }


def main():
    report = {
        "gibs": verify_gibs(),
        "ode": verify_ode(),
        "notes": [
            "GIBS provides verified NASA imagery (tiles), not raw numeric EO rasters.",
            "ODE requires correct IHID/IID/PT or PDSId/ODEID for product queries.",
            "Earthdata raw downloads require credentials (not verified here).",
        ],
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
