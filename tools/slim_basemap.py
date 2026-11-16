"""Shrink the local base-map GeoJSON (data/map/*.json) without visible loss.

Merges touching line pieces, simplifies geometry and rounds coordinates.
At the site's max zoom (12) one pixel is ~0.0003°, so a 0.00015° tolerance
and 5-decimal coordinates (~1 m) are invisible.

Usage: python3 tools/slim_basemap.py data/map/kansai.json data/map/kanto.json
"""
import json
import sys

from shapely.geometry import mapping, shape
from shapely.ops import linemerge

TOLERANCE = 0.00015
DIGITS = 5


def rnd(obj):
    if isinstance(obj, float):
        return round(obj, DIGITS)
    if isinstance(obj, (list, tuple)):
        return [rnd(x) for x in obj]
    return obj


def slim(path):
    data = json.load(open(path))
    for layer, feats in data.items():
        out = []
        for f in feats:
            g = shape(f["geometry"])
            if g.geom_type in ("MultiLineString", "LineString"):
                g = linemerge(g)
            g = g.simplify(TOLERANCE, preserve_topology=True)
            if g.is_empty:
                continue
            geom = mapping(g)
            geom["coordinates"] = rnd(geom["coordinates"])
            out.append({"type": "Feature", "properties": {}, "geometry": geom})
        data[layer] = out
    with open(path, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))


if __name__ == "__main__":
    for p in sys.argv[1:]:
        slim(p)
        print("slimmed", p)
