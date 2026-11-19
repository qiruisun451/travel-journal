(function () {
  document.documentElement.classList.add("js");

  /* ---------- helpers ---------- */
  function roman(n) {
    var map = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]], s = "";
    map.forEach(function (m) { while (n >= m[0]) { s += m[1]; n -= m[0]; } });
    return s;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
  }
  function zh(text) { return h("span", { class: "zh", lang: "zh-Hans", text: text }); }

  // 照片框：文件存在就显示照片，不存在就显示写着文件名的占位框
  // 已导入的照片在 data/<chapter>-photos.js 里登记了宽高，相框按照片原比例显示，不裁切
  function photo(src, alt, ratio) {
    var frame = h("div", { class: "ph" });
    var size = (window.PHOTOS || {})[src.replace(/^photos\//, "")];
    frame.style.aspectRatio = size ? size[0] + "/" + size[1] : (ratio || "4/5");
    var img = new Image();
    img.alt = alt; img.decoding = "async";
    if (size) { img.loading = "lazy"; img.width = size[0]; img.height = size[1]; }
    img.onerror = function () {
      img.remove();
      frame.classList.add("empty");
      frame.appendChild(h("span", { class: "ph-label", text: src }));
    };
    img.src = src;
    frame.appendChild(img);
    return frame;
  }

  function shotCount(chapterId, day) {
    var n = 0;
    while ((window.PHOTOS || {})[chapterId + "/" + pad(day) + "-" + (n + 1) + ".jpg"]) n++;
    return n;
  }

  function shotPath(chapterId, day, shot) {
    return "photos/" + chapterId + "/" + pad(day) + "-" + shot + ".jpg";
  }

  function collage(target, chapter, linkBase) {
    chapter.highlights.forEach(function (item, i) {
      var fig = h("figure", { class: "k" + (i + 1) + " reveal" });
      var body = [
        photo(shotPath(chapter.id, item.day, item.shot), item.en, item.ratio),
        h("figcaption", null, roman(item.day) + ". " + item.en, zh(item.zh)),
      ];
      var link = h("a", { href: linkBase + "#day-" + item.day });
      body.forEach(function (b) { link.appendChild(b); });
      fig.appendChild(link);
      target.appendChild(fig);
    });
  }

  /* ---------- home ---------- */
  function renderHome() {
    var list = document.getElementById("chapter-list");
    if (!list || !window.CHAPTERS) return;
    var byId = {};
    (window.ALL_CHAPTERS || []).forEach(function (c) { if (c) byId[c.id] = c; });

    // 章节卷：每章一卷，后面跟一卷"未冲洗"的下一站
    window.CHAPTERS.forEach(function (c, i) {
      var data = byId[c.id] || {};
      list.appendChild(h("li", { class: "reveal" },
        h("a", { class: "roll", href: c.href },
          c.cover ? h("img", { class: "roll-cover", src: c.cover, alt: "", loading: "lazy", width: 1536, height: 1024 }) : null,
          h("span", { class: "roll-body" },
            h("span", { class: "roll-kicker", text: "Roll " + roman(i + 1) + " · " + c.metaEn }),
            h("span", { class: "roll-name" },
              h("span", { class: "roll-en", text: c.en }),
              h("span", { class: "roll-zh", lang: "zh-Hans", text: c.zh + " · " + c.metaZh })),
            h("span", { class: "roll-route" },
              data.routeEn || "", data.routeZh ? zh(data.routeZh) : null,
              h("span", { class: "roll-open" }, "Open the roll ", h("span", { lang: "zh-Hans", text: "阅读" }), " →"))
          ))));
    });
    list.appendChild(h("li", { class: "reveal" },
      h("div", { class: "roll-next" },
        h("span", { class: "roll-kicker", text: "Roll " + roman(window.CHAPTERS.length + 1) + " · Undeveloped 未冲洗" }),
        h("span", { class: "roll-next-name" }, "Next ", h("span", { lang: "zh-Hans", text: "下一站" })))));

    hero(window.ALL_CHAPTERS || []);
  }

  /* ---------- home hero: 各章精选随机轮换 ---------- */
  function hero(chapters) {
    var stage = document.getElementById("hero-slides"),
        cap = document.getElementById("hero-cap"),
        dots = document.getElementById("hero-dots");
    if (!stage || !cap || !dots) return;

    var meta = {};
    (window.CHAPTERS || []).forEach(function (c) { meta[c.id] = c; });
    var pool = [];
    chapters.forEach(function (c) {
      if (!c || !c.highlights || !meta[c.id]) return;
      c.highlights.forEach(function (item) {
        var d = (c.days || [])[item.day - 1] || {};
        pool.push({
          src: shotPath(c.id, item.day, item.shot),
          href: meta[c.id].href + "#day-" + item.day,
          kicker: meta[c.id].en + " " + meta[c.id].zh + " · " + (d.date || ""),
          en: roman(item.day) + ". " + item.en,
          zh: item.zh,
        });
      });
    });
    if (!pool.length) return;

    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SECONDS = 6, cur = -1, timer = null;

    var imgs = pool.map(function (p, i) {
      var img = h("img", { class: "hero-slide", alt: "", decoding: "async" });
      stage.appendChild(img);
      var b = h("button", { class: "hero-dot", type: "button", "aria-label": (i + 1) + " / " + pool.length + " · " + p.zh, "aria-pressed": "false" }, h("span"));
      b.addEventListener("click", function () { show(i); restart(); });
      dots.appendChild(b);
      return img;
    });

    function load(i, then) {
      var img = imgs[i];
      if (img.dataset.ready) { if (then) then(); return; }
      img.onload = function () { img.dataset.ready = "1"; if (then) then(); };
      img.onerror = function () { if (then) then(); };
      if (!img.getAttribute("src")) img.src = pool[i].src;
    }
    function show(i) {
      load(i, function () {
        if (cur >= 0) imgs[cur].classList.remove("on");
        imgs[i].classList.add("on");
        Array.prototype.forEach.call(dots.children, function (b, j) {
          b.classList.toggle("on", j === i);
          b.setAttribute("aria-pressed", j === i ? "true" : "false");
        });
        var p = pool[i];
        cap.href = p.href;
        cap.textContent = "";
        cap.appendChild(h("span", { class: "hero-kicker", text: p.kicker }));
        cap.appendChild(h("span", { class: "hero-en", text: p.en }));
        cap.appendChild(h("span", { class: "hero-zh", lang: "zh-Hans", text: p.zh }));
        cur = i;
        load(pick()); // 预先加载下一张候选，切换时不闪
      });
    }
    var upcoming = null;
    function pick() {
      if (pool.length < 2) return 0;
      var j = cur;
      while (j === cur) j = Math.floor(Math.random() * pool.length);
      upcoming = j;
      return j;
    }
    function next() {
      if (document.hidden) return;
      show(upcoming != null && upcoming !== cur ? upcoming : pick());
    }
    function restart() {
      clearInterval(timer);
      if (!still && pool.length > 1) timer = setInterval(next, SECONDS * 1000);
    }

    show(Math.floor(Math.random() * pool.length));
    restart();
  }

  /* ---------- chapter ---------- */
  function renderChapter() {
    var c = window.CHAPTER, root = document.getElementById("chapter");
    if (!root || !c) return;

    var cover = h("div", { class: "chapter-cover" });
    cover.appendChild(h("header", { class: "chapter-head" },
      h("p", { class: "label" }, "Chapter " + roman(c.number) + " · ", zh("第" + "一二三四五六七八九十"[c.number - 1] + "章")),
      h("h1", { class: "chapter-title", text: c.en }),
      h("div", { class: "chapter-sub" },
        h("p", null, zh(c.zh)),
        h("p", null, c.dates),
        h("p", { class: "route" }, c.routeEn, h("br"), zh(c.routeZh)))
    ));

    var col = h("div", { class: "collage" });
    collage(col, c, "");
    cover.appendChild(h("section", { class: "collage-section", "aria-label": "Highlights" }, col));
    root.appendChild(cover);

    var mapHost = h("div", { class: "chapter-maps", id: "chapter-maps" });
    root.appendChild(h("section", { id: "route" },
      h("div", { class: "section-head" }, h("h2", { class: "label" }, "The route ", zh("路线")),
        h("span", { class: "label", text: c.days.length + " days" })),
      mapHost));

    if (window.renderChapterMaps) window.renderChapterMaps(mapHost);

    var days = h("ol", { class: "days" });
    c.days.forEach(function (d, i) {
      var n = i + 1;
      var stops = h("ul", { class: "stops" });
      d.stops.forEach(function (st) { stops.appendChild(h("li", null, h("span", { text: st[0] }), zh(st[1]))); });
      var count = shotCount(c.id, n), shots = null;
      if (count) {
        shots = h("div", { class: "shots" });
        // 每两张一行；按照片宽高比分配宽度，同一行两张等高，上下两边都对齐，也不裁切
        var row = null;
        for (var k = 1; k <= count; k++) {
          if (k % 2 === 1) { row = h("div", { class: "shot-row" }); shots.appendChild(row); }
          var src = shotPath(c.id, n, k), frame = photo(src, d.en + ", photo " + k);
          var size = (window.PHOTOS || {})[src.replace(/^photos\//, "")];
          frame.style.flex = (size ? size[0] / size[1] : 0.8) + " 1 0";
          row.appendChild(frame);
        }
      }
      days.appendChild(h("li", { class: "day reveal" + (count ? "" : " text-only"), id: "day-" + n },
        h("div", null,
          h("p", { class: "num", text: roman(n) }),
          h("p", { class: "label date", text: "Day " + pad(n) + " · " + d.date })),
        h("div", null,
          h("h3", null, d.en, zh(d.zh)),
          stops,
          h("p", { class: "note" }, d.noteEn, zh(d.noteZh))),
        shots
      ));
    });
    root.appendChild(h("section", { id: "days" },
      h("div", { class: "section-head" }, h("h2", { class: "label" }, "Day by day ", zh("逐日行程")),
        h("span", { class: "label", text: c.dates })),
      days));

    root.appendChild(h("nav", { class: "chapter-foot block", "aria-label": "Chapter navigation" },
      h("a", { href: "index.html#chapters" }, "← All chapters ", zh("全部章节")),
      h("a", { href: "#top" }, "Back to top ", zh("回到顶部"), " ↑")));
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var pending = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    function check() {
      var limit = window.innerHeight * 0.94;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0) { el.classList.add("in"); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    check();
  }

  renderHome();
  renderChapter();
  reveal();

  // 带 #day-N 进入章节页时，内容是脚本生成的，需要手动滚动到位
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      var go = function () { target.scrollIntoView({ behavior: "instant", block: "start" }); };
      go();
      // 网络字体加载完后版面高度会变，再定位一次
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
      window.addEventListener("load", go);
    }
  }
})();
