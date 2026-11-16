---
name: travel-chapter
description: 为这个中英双语旅行手记网站新增或完善一个旅行章节（一个目的地 = 一个章节页）的完整流程：整理每日行程、挑选和导入照片（相机卡或 iPhone 经 Cowork 导出）、做路线图、写章节插画的提示词、按网站既定版式校验并提交。只要用户说"开始下一章""做法国/冰岛/阿勒泰/西藏那一章""给某天加/换照片""补照片""写每天的小记""做路线图""章节插画/封面图提示词"，或想检查某一章是否符合网站规范，都应使用这个 skill——即使没有提到"章节"两个字。
---

# 旅行章节（Travel chapter）

这个网站是一本中英双语的旅行手记：首页是章节目录，每段旅程一个章节页。第一章「日本 · 十五日」已经完成，它就是所有后续章节的样板。做新章节时，先读一遍日本篇的实际文件，照着它的结构做，而不是凭记忆重造。用户有时会在两次会话之间用别的工具（如 DeepSeek）改代码，所以动手前先重新读文件。

## 项目结构

| 文件 | 作用 |
|---|---|
| `index.html` | 首页：照片拼贴、章节列表、关于、联系、页脚 |
| `<id>.html` | 章节页外壳（如 `japan.html`），内容由脚本生成 |
| `data/chapters.js` | 首页章节列表：`id / href / en / zh / metaEn / metaZh / cover` |
| `data/<id>.js` | 章节内容 `window.CHAPTER`：标题、日期、路线文字、`highlights`（拼贴）、`days`（每天） |
| `data/<id>-photos.js` | 由导入脚本生成的照片清单（文件 → 宽高），不要手改 |
| `photos/<id>/DD-K.jpg` | 第 DD 天第 K 张，长边 1800px，无 EXIF |
| `assets/chapters/<id>.jpg` | 章节插画，显示在首页章节列表那一行 |
| `js/site.js` | 渲染首页与章节页 |
| `js/map.js` + `css/map.css` + `data/map/*.json` | 路线图（Leaflet + 本地矢量底图） |
| `tools/import_photos.py` | 选片 → 压缩 → 写清单 |
| `tools/serve.py` | 本地预览服务器（不缓存），`.claude/launch.json` 里名为 `travel-site`，端口 8765 |
| `Timeline.json` | 用户的定位记录，已 gitignore，只在本地读，绝不发布 |

## 开工前要问清楚的

一次问完，别边做边零碎地问。能从文件里查到的就自己查。

1. **目的地和日期**：每一天的日期（日期格式见规范）、大致去了哪里。`~/Pictures/` 下有按旅程命名的文件夹（如 `20250416🇫🇷`、`20250710🇮🇸`、`20260206altay`、`20260801tibet`），可以先看看用户指的是哪一个。
2. **照片来源**：相机卡（`/Volumes/.../DCIM`）、`~/Pictures/` 里的文件夹，还是 iPhone（需要用户在 Cowork 里导出，见 `references/photos.md`）。
3. **定位记录**：有没有这段旅程的 Timeline 导出？有的话行程骨架和路线图都能从它推出来。
4. **要不要路线图**：城市步行为主的行程，地图意义不大；跨城、跨区域的才值得做。要做的话分几个区域面板。
5. **插画**：要不要给这一章做首页插画（见 `references/illustration.md`）。

## 流程

按顺序做，每一步做完在浏览器里看一眼再往下走。

1. **行程骨架**：写 `data/<id>.js`，每一天的 `date / en / zh / stops / noteEn / noteZh`。小记（note）如果是根据定位数据推出来的，就在文件里注明"草稿，请换成你自己的话"，并在回复里提醒用户。小记最影响质感，最好让用户口述，再由你整理成中英两版。
2. **页面接线**：复制 `japan.html` 为 `<id>.html`，换掉 title、description 和 `data/` 脚本；在 `data/chapters.js` 加一项。第一次做第二章时，还要先处理下面"写死成日本的地方"。
3. **照片**：按 `references/photos.md` 选片、导入。
4. **路线图**（可选）：按 `references/maps.md` 做。
5. **插画**（可选）：按 `references/illustration.md` 写提示词，用户生成后存到 `assets/chapters/<id>.jpg`，在 `chapters.js` 里填 `cover`。
6. **校验**：按 `references/site-conventions.md` 的清单逐项检查，在手机宽度（375）和桌面宽度（1400）下都截图看。
7. **提交与发布**：只在用户要求时提交。网站发布在 GitHub Pages：仓库 `qiruisun451/travel-journal`（公开），网址 https://qiruisun451.github.io/travel-journal/ ，推送到 `main` 后一两分钟自动更新。仓库是公开的，推送前确认没有住处照片、`Timeline.json`、真实邮箱等私人内容；提交作者邮箱用 GitHub 匿名邮箱（已在仓库本地配置）。用 `gh` 命令行操作 GitHub（GitHub 插件连不上）。

## 写死成日本的地方（做第二章时先改通用）

日本篇是第一章，有几处是按"只有一章"写的。做第二章时先把它们改成按章节读取，不要复制一份再改名：

- `index.html` 直接加载 `data/japan.js` 和 `data/japan-photos.js` 来做首页拼贴；左下角 "Read 阅读" 写死链接到 `japan.html`。有了第二章后，跟用户商量首页拼贴是"自动显示最新一章"还是"各章混选"，"Read" 指向最新一章。
- `tools/import_photos.py` 里 `CHAPTER`、相机卡路径 `SOURCE`、手机文件夹 `PHONE_SOURCE`，以及"第几天 → 日期文件夹"的换算（`2026-10-%02d` % (4 + day)）都是日本篇的。改成从命令行参数或章节配置读取。
- `js/map.js` 的 `REGIONS`、面板标题（Kansai / Kanto）、中间的连接条（Osaka → Tokyo 夜巴）、版权行（© 国土地理院）都写死了。建议把地图配置挪进 `data/<id>.js`（例如 `CHAPTER.maps`），`map.js` 只负责画。
- 底图来自日本国土地理院（GSI），只覆盖日本。其他国家要换数据源，见 `references/maps.md`。
- `js/site.js` 用 `"一二三四五六七八九十"[c.number - 1]` 生成"第几章"，超过十章时要改。

## 和用户协作的方式

这些是在日本篇里用户明确表达过的偏好：

- **先出小样再改**：涉及审美的决定（字体、版式、插画风格），先做一个测试页或几个方案让用户比较，问清楚再动网站。测试页用完就删。
- **说人话**：用户读中文，回复用中文，少用术语；需要用户做的事要写清楚在哪里点、点什么。
- **删除要谨慎**：删东西前先说清楚删什么、为什么、能不能找回，等用户确认。优先移到废纸篓（`mv` 到 `~/.Trash/`）。桌面开了 iCloud 同步，用"访达"删除可能失败，这时用 `mv`。清理「下载」时只认按日期能确定属于这次的文件，不按文件名批量删。
- **隐私**：住处（民宿门口、庭院、室内）、门牌、自拍、截图（签证、付款）、陌生人正脸近景都不上网站；照片的 GPS 和设备信息在导入时去掉；Timeline 只用到"区域"级别。
