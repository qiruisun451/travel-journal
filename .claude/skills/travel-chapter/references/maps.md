# 路线图

## 现在的做法（日本篇）

- Leaflet（本地 vendor 在 `js/vendor/leaflet/`），不用在线瓦片；底图是本地 GeoJSON（水系、海岸线、铁路、主干道、河流），用 canvas 渲染。
- 每个区域一个面板（日本篇：关西 Days I–IX、关东 Days X–XV），两个面板之间有一条"连接条"（D9 夜巴 Osaka → Tokyo）。
- 面板下方有 Day 按钮，点了只高亮当天的路段、站点和说明；说明下面列出当天的站点（来自 `CHAPTER.days[n].stops`）。
- 配置在 `js/map.js` 的 `REGIONS`：`bounds`、`days`、`local`（城市内活动的虚线圈）、`stops`（站点：中英名、Day 标签、坐标、标签方位 `pos`、属于哪几天）、`segments`（路段：属于哪几天、是否巴士虚线 `bus`、路径点，可带 Day 徽章）、`captions`（每天一句说明，含距离）。
- 路线和距离来自用户的 Timeline 定位记录，只到"区域"级别，示意用途，不是导航精度。住处坐标绝不进地图。

## 做新章节的地图

1. **先问要不要做**：城市步行为主的行程，可以只做一个面板，或者不做。
2. **底图数据**：GSI 只覆盖日本。其他地区用 OpenStreetMap 数据（通过 Overpass 导出水系、海岸线、铁路、主干道）或 Natural Earth（大范围、低精度），转成和 `data/map/kansai.json` 一样的结构（按图层分组的 Feature 列表），再用 `tools/slim_basemap.py` 瘦身。署名要跟着数据源改（OSM 是 "© OpenStreetMap contributors"）。在 `data/map/README.md` 记下数据来源、范围和处理步骤。
3. **配置挪进章节数据**：把这一章的区域配置写进 `data/<id>.js`（例如 `CHAPTER.maps`），让 `map.js` 读取，不要再往 `map.js` 里堆国家专属的内容。面板标题、连接条、版权行也一起参数化。
4. **站点和路段**：从 Timeline 推出每天的移动，路径点不用太密，`smooth()` 会做平滑。站点标签方位 `pos`（t/r/b/l）要逐个调，避免和别的标签、路线重叠。

## 修过的坑（改地图样式或加图层时要重新确认）

- `css/style.css` 里全局的 `img, svg { max-width: 100% }` 会把 Leaflet 自定义 pane 里的 SVG 压成 0 宽，路线全部消失。`css/map.css` 里有覆盖规则 `.chapter-maps .leaflet-pane svg, canvas { max-width: none !important }`，别删。
- 站点坐标要核对，日本篇的强罗一度被放在了箱根汤本的位置。
- 地图容器尺寸变化（字体加载、窗口缩放）后，`ResizeObserver` 会重新 `fitBounds`，直到用户自己拖动或缩放为止（`userMoved` 标记）。
- 底图 JSON 先瘦身再提交：日本篇从 5.3 MB 降到 2.3 MB，缩放到 12 级也看不出差别。
