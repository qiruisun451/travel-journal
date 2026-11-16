# Map base data

Base geometry (water, coastline, rail, motorway-class roads, rivers) was
extracted from the Geospatial Information Authority of Japan (GSI) experimental
vector tiles:

`https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf`

- Zoom 11, Kansai and Kanto bounding boxes.
- Extracted and simplified with `shapely`; stored as two local GeoJSON files so
  the site does not depend on a runtime tile service.
- Then slimmed with `tools/slim_basemap.py` (line merge, 0.00015° simplify,
  5-decimal coordinates): ~5.3 MB → ~2.3 MB, no visible change up to zoom 12.
- `kansai.json`: Kansai bbox, 134.9–136.1 E / 34.25–35.25 N.
- `kanto.json`: Kanto bbox, 138.55–140.05 E / 34.8–35.85 N.

Attribution: 地図データ © 国土地理院 (Geospatial Information Authority of Japan).
The route lines and distances are drawn from the author's Timeline records and
are illustrative, not navigation-grade tracks.
