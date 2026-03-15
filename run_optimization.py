"""
AxNano Smart-Feed v9 — Python runner for Next.js API route.
Reads JSON from stdin, runs optimization, writes JSON to stdout.

Usage:
    echo '{"streams": [...], "config": {...}}' | python3 run_optimization.py
"""
import json
import sys
import math
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from dataclasses import asdict
from smart_feed_v9 import WasteStream, SystemConfig, run_optimization


def phase_to_dict(phase):
    d = asdict(phase)
    # Convert BlendProperties nested dataclass
    return d


def schedule_to_dict(schedule):
    if schedule is None:
        return None
    return {
        "phases": [phase_to_dict(p) for p in schedule.phases],
        "total_cost": schedule.total_cost,
        "total_runtime_min": schedule.total_runtime_min,
        "total_runtime_hr": schedule.total_runtime_hr,
    }


def main():
    raw = sys.stdin.read()
    data = json.loads(raw)

    # Build WasteStream list
    streams = [WasteStream(**s) for s in data["streams"]]

    # Build SystemConfig (only override provided keys)
    cfg_overrides = data.get("config", {})
    cfg = SystemConfig(**{k: v for k, v in cfg_overrides.items()
                         if hasattr(SystemConfig, k) or k in SystemConfig.__dataclass_fields__})

    # Run optimization (silent)
    result = run_optimization(streams, cfg, verbose=False)

    output = {
        "baseline": schedule_to_dict(result["baseline"]),
        "optimized": schedule_to_dict(result["optimized"]),
        "savings_pct": result["savings_pct"],
        "stats": {k: (v if isinstance(v, (int, float, str, bool)) else str(v))
                  for k, v in result["stats"].items()},
        "streams": [asdict(s) for s in streams],
        "config": asdict(cfg),
    }

    print(json.dumps(output))


if __name__ == "__main__":
    main()
