/* 章节交互地图：本地 GSI 矢量底图 + Timeline 路线。由 site.js 调用 window.renderChapterMaps(host)。 */
(function () {
  var REGIONS = {
    kansai: {
      el: "map-kansai",
      data: "data/map/kansai.json",
      bounds: [[34.35, 134.96], [35.10, 136.02]],
      days: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      local: { day: [2, 3, 9], at: [34.690, 135.500], label: "大阪 Osaka" },
      stops: [
        { n: "关西机场 KIX", e: "", d: "D1", lat: 34.432, lon: 135.237, pos: "t", days: [1] },
        { n: "大阪", e: "Osaka", d: "D1–9", lat: 34.690, lon: 135.500, pos: "r", days: [1, 2, 3, 4, 5, 7, 8, 9] },
        { n: "奈良", e: "Nara", d: "D4–5", lat: 34.681, lon: 135.818, pos: "r", days: [4, 5] },
        { n: "京都", e: "Kyoto", d: "D6–8", lat: 35.012, lon: 135.768, pos: "r", days: [6, 7, 8] },
        { n: "岚山", e: "Arashiyama", d: "D7", lat: 35.017, lon: 135.678, pos: "l", days: [7] },
        { n: "宇治", e: "Uji", d: "D7", lat: 34.884, lon: 135.807, pos: "r", days: [7] },
        { n: "神户", e: "Kobe", d: "D8", lat: 34.690, lon: 135.196, pos: "l", days: [8] }
      ],
      segments: [
        { days: [1], badge: ["D1", 34.505, 135.420], path: [[34.432, 135.237], [34.460, 135.300], [34.520, 135.380], [34.600, 135.450], [34.660, 135.490], [34.690, 135.500]] },
        { days: [4, 5], badge: ["D4–5", 34.700, 135.690], path: [[34.690, 135.500], [34.700, 135.560], [34.700, 135.620], [34.695, 135.690], [34.681, 135.760], [34.681, 135.818]] },
        { days: [6, 8], badge: ["D6–8", 34.900, 135.690], path: [[34.690, 135.500], [34.760, 135.560], [34.830, 135.620], [34.900, 135.680], [34.960, 135.730], [35.012, 135.768]] },
        { days: [7], badge: ["D7", 34.850, 135.555], path: [[34.690, 135.500], [34.750, 135.530], [34.820, 135.560], [34.890, 135.600], [34.960, 135.640], [35.000, 135.670], [35.017, 135.678]] },
        { days: [7], path: [[35.017, 135.678], [35.000, 135.720], [35.012, 135.768]] },
        { days: [7], path: [[35.012, 135.768], [34.980, 135.780], [34.940, 135.790], [34.900, 135.800], [34.884, 135.807]] },
        { days: [7], path: [[34.884, 135.807], [34.860, 135.760], [34.820, 135.700], [34.770, 135.630], [34.730, 135.560], [34.690, 135.500]] },
        { days: [8], path: [[34.690, 135.196], [34.700, 135.250], [34.710, 135.310], [34.690, 135.360], [34.690, 135.420], [34.690, 135.500]] },
        { days: [8], bus: true, path: [[35.012, 135.768], [34.960, 135.700], [34.900, 135.620], [34.840, 135.560], [34.780, 135.500], [34.740, 135.430], [34.710, 135.360], [34.690, 135.196]] }
      ],
      captions: {
        1: "D1 · 关西机场 → 大阪 / 34.2 km · 南海电铁",
        2: "D2 · 大阪慢日 · 难波 / 道顿堀",
        3: "D3 · 大阪 · 道顿堀 / 梅田",
        4: "D4 · 大阪 → 奈良 / 21.1 km",
        5: "D5 · 奈良 → 大阪 / 23.4 km",
        6: "D6 · 大阪 ⇄ 京都 / 84.8 km",
        7: "D7 · 大阪 → 岚山 → 京都 → 宇治 → 大阪 / 119 km",
        8: "D8 · 大阪 → 京都 → 神户 → 大阪 / 139 km",
        9: "D9 · 大阪 → 东京 · 夜巴 / 374.8 km"
      }
    },
    kanto: {
      el: "map-kanto",
      data: "data/map/kanto.json",
      bounds: [[35.02, 138.68], [35.74, 139.93]],
      days: [10, 11, 12, 13, 14, 15],
      local: { day: [10, 11], at: [35.681, 139.767], label: "东京 Tokyo" },
      stops: [
        { n: "东京", e: "Tokyo", d: "D10–11", lat: 35.681, lon: 139.767, pos: "l", days: [10, 11, 12, 15] },
        { n: "江之岛", e: "Enoshima", d: "D12", lat: 35.309, lon: 139.487, pos: "b", days: [12, 13] },
        { n: "箱根·强罗", e: "Hakone · Gora", d: "D13–15", lat: 35.247, lon: 139.045, pos: "t", days: [13, 14, 15] },
        { n: "御殿场", e: "Gotemba", d: "D13", lat: 35.308, lon: 138.934, pos: "b", days: [13] },
        { n: "山中湖", e: "Lake Yamanaka", d: "D13", lat: 35.421, lon: 138.876, pos: "l", days: [13, 14] },
        { n: "河口湖", e: "Lake Kawaguchi", d: "D14", lat: 35.517, lon: 138.751, pos: "l", days: [14] },
        { n: "忍野八海", e: "Oshino", d: "D14", lat: 35.460, lon: 138.895, pos: "r", days: [14] },
        { n: "芦之湖", e: "Lake Ashi", d: "D15", lat: 35.204, lon: 139.026, pos: "b", days: [15] },
        { n: "小田原", e: "Odawara", d: "D13 · D15", lat: 35.256, lon: 139.155, pos: "r", days: [13, 15] },
        { n: "羽田", e: "Haneda", d: "D15", lat: 35.549, lon: 139.780, pos: "l", days: [15] }
      ],
      segments: [
        { days: [12], badge: ["D12", 35.450, 139.620], path: [[35.681, 139.767], [35.628, 139.739], [35.550, 139.700], [35.466, 139.622], [35.400, 139.560], [35.353, 139.531], [35.339, 139.487], [35.309, 139.487]] },
        { days: [13], bus: true, badge: ["D13", 35.320, 138.990], path: [[35.309, 139.487], [35.330, 139.400], [35.330, 139.340], [35.300, 139.230], [35.256, 139.155], [35.232, 139.107]] },
        { days: [13], bus: true, path: [[35.232, 139.107], [35.240, 139.075], [35.247, 139.045], [35.272, 138.995], [35.308, 138.934]] },
        { days: [13], path: [[35.308, 138.934], [35.350, 138.930], [35.390, 138.900], [35.421, 138.876]] },
        { days: [14], bus: true, badge: ["D14", 35.443, 138.848], path: [[35.421, 138.876], [35.440, 138.850], [35.470, 138.800], [35.500, 138.770], [35.517, 138.751]] },
        { days: [14], bus: true, path: [[35.517, 138.751], [35.490, 138.800], [35.470, 138.850], [35.460, 138.895]] },
        { days: [14], bus: true, path: [[35.460, 138.895], [35.400, 138.930], [35.330, 138.980], [35.280, 139.020], [35.247, 139.045]] },
        { days: [15], path: [[35.247, 139.045], [35.240, 139.020], [35.230, 139.010], [35.204, 139.026]] },
        { days: [15], path: [[35.247, 139.045], [35.232, 139.107], [35.240, 139.130], [35.256, 139.155]] },
        { days: [15], badge: ["D15", 35.450, 139.500], path: [[35.256, 139.155], [35.350, 139.250], [35.450, 139.450], [35.507, 139.617], [35.628, 139.739], [35.681, 139.767]] },
        { days: [15], path: [[35.681, 139.767], [35.628, 139.739], [35.590, 139.750], [35.549, 139.780]] }
      ],
      captions: {
        10: "D10 · 东京 · 秋叶原 / 上野 / 浅草 / 银座",
        11: "D11 · 东京 · 藏前 / 阿美横町 / 涩谷 / 新宿 / 有乐町",
        12: "D12 · 东京 → 江之岛 / 镰仓高校前 / 七里滨",
        13: "D13 · 江之岛 → 小田原 → 箱根 → 御殿场 → 山中湖",
        14: "D14 · 山中湖 → 河口湖 → 忍野八海 → 强罗",
        15: "D15 · 强罗 → 大涌谷 / 芦之湖 → 东京 → 羽田"
      }
    }
  };

  function smooth(pts, steps) {
    if (pts.length < 3) return pts;
    var out = [pts[0]];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var t = 1; t <= steps; t++) {
        var u = t / steps, u2 = u * u, u3 = u2 * u;
        var lat = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3);
        var lon = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
        out.push([lat, lon]);
      }
    }
    return out;
  }

  async function buildRegion(key, cfg) {
    var map = L.map(cfg.el, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      minZoom: 8,
      maxZoom: 12,
      maxBounds: [[cfg.bounds[0][0] - 0.15, cfg.bounds[0][1] - 0.15], [cfg.bounds[1][0] + 0.15, cfg.bounds[1][1] + 0.15]],
      maxBoundsViscosity: 0.7
    });
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution("© 国土地理院");

    map.createPane("route"); map.getPane("route").style.zIndex = 450;
    map.createPane("badge"); map.getPane("badge").style.zIndex = 620;
    map.createPane("stop"); map.getPane("stop").style.zIndex = 630;

    var baseRenderer = L.canvas({ padding: 0.5 });
    var res = await fetch(cfg.data);
    if (!res.ok) throw new Error("HTTP " + res.status + " " + cfg.data);
    var json = await res.json();

    /* 陆地留纸色，水面是酸黄；道路/铁路只做很浅的印刷底纹 */
    L.geoJSON(json.water, {
      renderer: baseRenderer, interactive: false,
      style: { color: "#111", weight: 0.7, opacity: 0.9, fillColor: "#c9d256", fillOpacity: 1, lineJoin: "round" }
    }).addTo(map);
    L.geoJSON(json.river, {
      renderer: baseRenderer, interactive: false,
      style: { color: "#111", weight: 0.4, opacity: 0.26, fill: false }
    }).addTo(map);
    L.geoJSON(json.road, {
      renderer: baseRenderer, interactive: false,
      style: { color: "#111", weight: 0.28, opacity: 0.10, fill: false }
    }).addTo(map);
    L.geoJSON(json.rail, {
      renderer: baseRenderer, interactive: false,
      style: { color: "#111", weight: 0.34, opacity: 0.16, fill: false }
    }).addTo(map);

    var segs = [];
    for (var si = 0; si < cfg.segments.length; si++) {
      var s = cfg.segments[si];
      var pts = smooth(s.path, 12);
      var casing = L.polyline(pts, { pane: "route", interactive: false, color: "#c9d256", weight: 7, opacity: 1, lineCap: "round", lineJoin: "round" }).addTo(map);
      var line = L.polyline(pts, {
        pane: "route", interactive: false, color: "#111", weight: 2.4, opacity: 1, lineCap: "round", lineJoin: "round",
        dashArray: s.bus ? "2 5" : null
      }).addTo(map);
      segs.push({ cfg: s, casing: casing, line: line });
    }

    var badges = [];
    for (var bi = 0; bi < cfg.segments.length; bi++) {
      var bs = cfg.segments[bi];
      if (!bs.badge) continue;
      var label = bs.badge[0];
      var w = 10 + label.length * 5.2;
      var bm = L.marker([bs.badge[1], bs.badge[2]], {
        pane: "badge", interactive: false,
        icon: L.divIcon({ className: "badge-icon", html: '<div class="badge">' + label + "</div>", iconSize: [w, 18], iconAnchor: [w / 2, 9] })
      }).addTo(map);
      badges.push({ days: bs.days, el: bm });
    }

    var stops = [];
    for (var ti = 0; ti < cfg.stops.length; ti++) {
      var st = cfg.stops[ti];
      var lbl = st.noLabel ? "" : '<span class="lbl"><b>' + st.n + "</b><span>" + st.d + "</span></span>";
      var html = '<div class="stop pos-' + st.pos + '"><span class="dot"></span>' + lbl + "</div>";
      var m = L.marker([st.lat, st.lon], {
        pane: "stop",
        icon: L.divIcon({ className: "stop-icon", html: html, iconSize: [1, 1], iconAnchor: [0, 0] }),
        title: st.n
      }).addTo(map);
      var dayLink = st.days && st.days.length ? '<br><a class="route-pop-link" href="#day-' + st.days[0] + '">Day ' + st.days[0] + " →</a>" : "";
      m.bindPopup('<div class="route-pop"><b>' + st.n + (st.e ? " " + st.e : "") + '</b><span>' + st.d + "</span>" + dayLink + "</div>");
      stops.push({ cfg: st, marker: m });
    }

    var ring = null;
    if (cfg.local) {
      ring = L.marker(cfg.local.at, {
        pane: "stop", interactive: false,
        icon: L.divIcon({ className: "ring-icon", html: '<div class="local-ring"></div>', iconSize: [30, 30], iconAnchor: [15, 15] })
      }).addTo(map);
    }

    var active = null;
    var cap = document.getElementById("cap-" + key);
    var strip = document.getElementById("strip-" + key);

    function setDay(d) {
      active = (d === null || d === undefined) ? null : Number(d);
      for (var i = 0; i < segs.length; i++) {
        var on = active === null || segs[i].cfg.days.indexOf(active) !== -1;
        segs[i].casing.setStyle({ opacity: on ? 1 : 0.10, weight: active !== null && on ? 8 : 7 });
        segs[i].line.setStyle({ opacity: on ? 1 : 0.12, weight: active !== null && on ? 3.1 : 2.4 });
      }
      for (var j = 0; j < badges.length; j++) {
        var bon = active === null || badges[j].days.indexOf(active) !== -1;
        var bel = badges[j].el.getElement();
        var badge = bel && bel.querySelector(".badge");
        if (badge) badge.classList.toggle("dim", !bon);
      }
      for (var k = 0; k < stops.length; k++) {
        var son = active === null || stops[k].cfg.days.indexOf(active) !== -1;
        var sel = stops[k].marker.getElement();
        var inner = sel && sel.querySelector(".stop");
        if (inner) inner.classList.toggle("on", active !== null && son);
      }
      if (ring) {
        var ron = active !== null && cfg.local.day.indexOf(active) !== -1;
        var rel = ring.getElement();
        var r = rel && rel.querySelector(".local-ring");
        if (r) r.classList.toggle("on", ron);
      }
      for (var n = 0; n < strip.children.length; n++) {
        var btn = strip.children[n];
        var isOn = active !== null && btn.dataset.day === String(active);
        btn.classList.toggle("on", isOn);
        btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      }
      cap.textContent = active === null ? "点击 Day 高亮当天路线" : (cfg.captions[active] || ("D" + active));
      var dayData = active !== null && window.CHAPTER && window.CHAPTER.days[active - 1];
      if (dayData && dayData.stops && dayData.stops.length) {
        var list = document.createElement("span");
        list.className = "route-cap-stops";
        list.textContent = dayData.stops.map(function (st) { return st[1]; }).join(" · ");
        cap.appendChild(list);
      }
    }

    for (var di = 0; di < cfg.days.length; di++) {
      (function (d) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = "D" + d; b.dataset.day = d;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { setDay(active === d ? null : d); });
        strip.appendChild(b);
      })(cfg.days[di]);
    }

    /* 容器尺寸为 0 时 fitBounds 会直接跳到 maxZoom；尺寸变化后、用户还没动过地图时重新适配 */
    var host = document.getElementById(cfg.el);
    var userMoved = false, fitting = false;
    function fit() {
      fitting = true;
      map.invalidateSize(false);
      map.fitBounds(cfg.bounds, { padding: [26, 26], animate: false });
      fitting = false;
    }
    map.on("dragstart", function () { userMoved = true; });
    map.on("zoomstart", function () { if (!fitting) userMoved = true; });
    fit();
    if (host) host.classList.remove("loading");
    if ("ResizeObserver" in window && host) {
      new ResizeObserver(function () {
        if (!host.clientWidth || !host.clientHeight) return;
        if (userMoved) map.invalidateSize(); else fit();
      }).observe(host);
    } else {
      window.setTimeout(fit, 0);
    }
    return { map: map, setDay: setDay };
  }

  function panel(cfg) {
    return '<div class="route-panel">' +
      '<div class="route-panel-head"><h3>' + cfg.title + ' <span class="zh">' + cfg.zh + '</span></h3><span class="route-days">' + cfg.dayLabel + "</span></div>" +
      '<div id="' + cfg.el + '" class="route-map loading"></div>' +
      '<div class="route-panel-foot">' +
        '<div class="route-daystrip" id="' + cfg.strip + '"></div>' +
        '<div class="route-legend"><span class="rail"><i></i>Rail</span><span class="bus"><i></i>Bus / Car</span></div>' +
        '<div class="route-cap" id="' + cfg.cap + '">点击 Day 高亮当天路线</div>' +
      "</div>" +
    "</div>";
  }

  window.renderChapterMaps = function (host) {
    if (!host || host.dataset.mapsReady) return;
    host.dataset.mapsReady = "1";
    host.innerHTML =
      '<div class="route-credit"><span>地图数据 © 国土地理院 · 路线与距离据 Timeline 重绘</span><span>拖动地图 · 左上角 + / − 缩放 · 点击 Day 筛选</span></div>' +
      '<div class="route-panels">' +
        panel({ title: "Kansai", zh: "关西", dayLabel: "Days I–IX", el: "map-kansai", strip: "strip-kansai", cap: "cap-kansai" }) +
        panel({ title: "Kanto", zh: "关东", dayLabel: "Days X–XV", el: "map-kanto", strip: "strip-kanto", cap: "cap-kanto" }) +
      "</div>" +
      '<div class="route-connector"><div class="route-conn-kicker"><b>D9</b> · Night bus 夜巴<br>Osaka → Tokyo</div>' +
        '<div class="route-conn-main">Osaka <span class="arrow">→</span> Tokyo</div>' +
        '<div class="route-conn-meta"><b>374.8 km</b>2026.10.13 21:21 → 2026.10.14 05:33<br>约 8 小时 · 夜间移动</div></div>';

    var started = false;
    function start() {
      if (started) return;
      started = true;
      Promise.all([buildRegion("kansai", REGIONS.kansai), buildRegion("kanto", REGIONS.kanto)]).catch(function (err) {
        console.error(err);
        ["map-kansai", "map-kanto"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) {
            el.classList.remove("loading");
            el.innerHTML = '<div class="route-map-error">底图载入失败：' + err.message + "</div>";
          }
        });
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
      }, { rootMargin: "700px 0px" });
      io.observe(host);
    } else {
      start();
    }
  };
})();
