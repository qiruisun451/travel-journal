#!/usr/bin/env python3
"""把相机卡里选中的照片压缩后放进 photos/<chapter>/，并生成 data/<chapter>-photos.js。

用法:  python3 tools/import_photos.py
要换照片：改下面 PICKS 里的编号（DSC_ 后面的四位数），再运行一次。
每天的第 1 张会用在首页和章节顶部的拼贴里。
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageOps

SOURCE = "/Volumes/Untitled/DCIM/100NZ7_2"
CHAPTER = "japan"
LONG_EDGE = 1800
PICKS = {  # 第几天: [照片编号...]
    5:  [7748, 7720, 7698, 7771],
    6:  [7810, 7800, 7857, 7868],
    7:  [7926, 7887, 7902, 7943],
    8:  [8090, 8031, 8017, 8106],
    12: [8144, 8141, 8172, 8177],
    13: [8203, 8182, 8192, 8293],
    14: [8327, 8316, 8334, 8351],
    15: [8366, 8365, 8377, 8375],
}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "photos", CHAPTER)
os.makedirs(OUT, exist_ok=True)

def load(stem):
    jpg = os.path.join(SOURCE, stem + ".JPG")
    if os.path.exists(jpg):
        return ImageOps.exif_transpose(Image.open(jpg))
    nef = os.path.join(SOURCE, stem + ".NEF")
    if not os.path.exists(nef):
        raise FileNotFoundError(stem)
    with Image.open(nef) as raw:  # 只读方向信息
        orientation = raw.getexif().get(274, 1)
    tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False).name
    subprocess.run(["sips", "-s", "format", "jpeg", nef, "--out", tmp], check=True, capture_output=True)
    im = Image.open(tmp); im.load(); os.unlink(tmp)
    if im.width > im.height and orientation in (6, 8):
        im = im.rotate(270 if orientation == 6 else 90, expand=True)
    return im

manifest = {}
for day, numbers in sorted(PICKS.items()):
    for i, n in enumerate(numbers, 1):
        name = "%02d-%d.jpg" % (day, i)
        im = load("DSC_%04d" % n).convert("RGB")
        im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
        # 不写入 EXIF：相机序列号、拍摄参数等不会带到网站上
        im.save(os.path.join(OUT, name), "JPEG", quality=82, optimize=True, progressive=True)
        manifest["%s/%s" % (CHAPTER, name)] = [im.width, im.height]
        print(name, "<- DSC_%04d" % n, im.size, os.path.getsize(os.path.join(OUT, name)) // 1024, "KB")

with open(os.path.join(ROOT, "data", CHAPTER + "-photos.js"), "w") as f:
    f.write("// 由 tools/import_photos.py 生成，请勿手改。格式：文件 -> [宽, 高]\n")
    f.write("window.PHOTOS = Object.assign(window.PHOTOS || {}, %s);\n" % json.dumps(manifest, indent=1))
