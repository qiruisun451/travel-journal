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
    window.CHAPTERS.forEach(function (c, i) {
      list.appendChild(h("li", { class: "reveal" },
        h("a", { class: "chapter-row", href: c.href },
          h("span", { class: "num", text: roman(i + 1) + "." }),
          h("span", { class: "name" }, c.en, zh(c.zh)),
          h("span", { class: "meta" }, c.metaEn, h("br"), zh(c.metaZh))
        )));
    });
    list.appendChild(h("li", { class: "reveal" },
      h("div", { class: "chapter-row soon" },
        h("span", { class: "num", text: roman(window.CHAPTERS.length + 1) + "." }),
        h("span", { class: "name" }, "Next", zh("下一站")),
        h("span", { class: "meta" }, "To be written", h("br"), zh("待续"))
      )));

    var target = document.getElementById("home-collage");
    if (target && window.CHAPTER) collage(target, window.CHAPTER, window.CHAPTERS[0].href);
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
        h("p", null, c.datesEn + " · ", zh(c.datesZh)),
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
        for (var k = 1; k <= count; k++) shots.appendChild(photo(shotPath(c.id, n, k), d.en + ", photo " + k));
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
        h("span", { class: "label", text: c.datesEn })),
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
