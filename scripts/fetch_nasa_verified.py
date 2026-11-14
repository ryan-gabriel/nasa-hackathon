"""Fetch verified NASA ODE product/metadata records (web-side copy)."""
from __future__ import annotations

import json
import time
from pathlib import Path
import sys
from urllib.parse import urlencode
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parent))
try:
    from env import load_project_env
    load_project_env()
except Exception:
    pass

WEB_ROOT = Path(__file__).resolve().parents[1]
OUT = WEB_ROOT / "data" / "verified_sources"
ODE = "https://oderest.rsl.wustl.edu/live2/"

QUERIES = [
    {"name": "moon_lro_dlre_rdr4", "params": {"query":"product","results":"m","target":"moon","ihid":"LRO","iid":"DLRE","pt":"RDR4","limit":5,"output":"JSON"}},
    {"name": "moon_lro_dlre_gdr_l3", "params": {"query":"product","results":"m","target":"moon","ihid":"LRO","iid":"DLRE","pt":"GDR_L3","limit":5,"output":"JSON"}},
    {"name": "moon_lro_lroc_edrnac4", "params": {"query":"product","results":"m","target":"moon","ihid":"LRO","iid":"LROC","pt":"EDRNAC4","limit":5,"output":"JSON"}},
    {"name": "mars_mro_ctx_edr", "params": {"query":"product","results":"m","target":"mars","ihid":"MRO","iid":"CTX","pt":"EDR","limit":5,"output":"JSON"}},
    {"name": "mars_mro_crism_trdr", "params": {"query":"product","results":"m","target":"mars","ihid":"MRO","iid":"CRISM","pt":"TRDR","limit":5,"output":"JSON"}},
    {"name": "mars_mgs_mola_pedr", "params": {"query":"product","results":"m","target":"mars","ihid":"MGS","iid":"MOLA","pt":"PEDR","limit":5,"output":"JSON"}},
]


def fetch(params):
    url = ODE + "?" + urlencode(params)
    req = Request(url, headers={"Accept":"application/json","User-Agent":"AnalogAtlas/1.0 (NASA-verified-source-fetch)"})
    with urlopen(req, timeout=60) as r:
        raw = r.read()
    return url, raw


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {"source": "NASA PDS Geosciences ODE REST (oderest.rsl.wustl.edu)", "verified_live": True, "queries": []}
    for q in QUERIES:
        try:
            url, raw = fetch(q["params"])
            data = json.loads(raw.decode("utf-8", errors="replace"))
            path = OUT / f"{q['name']}.json"
            path.write_text(json.dumps(data, indent=2), encoding="utf-8")
            ores = data.get("ODEResults", {})
            status = ores.get("Status")
            count = None
            prods = ores.get("Products") or ores.get("Product")
            if isinstance(prods, dict):
                for k, v in prods.items():
                    if isinstance(v, list):
                        count = len(v)
            elif isinstance(prods, list):
                count = len(prods)
            summary["queries"].append({"name": q["name"], "url": url, "status": status, "saved": str(path.relative_to(WEB_ROOT)), "product_count_hint": count})
            print(q["name"], status, count)
        except Exception as e:
            summary["queries"].append({"name": q["name"], "status": "ERROR", "error": str(e)})
            print(q["name"], "ERROR", e)
        time.sleep(0.5)
    (OUT / "verification_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("saved", OUT)


if __name__ == "__main__":
    main()
