#!/usr/bin/env python3
"""把选中的照片压缩后放进 photos/<chapter>/，并生成 data/<chapter>-photos.js。

用法:  python3 tools/import_photos.py
照片有两个来源：
  PICKS        相机卡里的 DSC_ 编号（卡没插时，已导入的照片保持不变）
  PHONE_PICKS  手机原件（HEIC/JPG），写文件名（文件夹不在时，已导入的照片保持不变）
要换照片：改编号或文件名，再运行一次。每天的第 1 张会用在拼贴和当天的首图。
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

PHONE_SOURCE = os.environ.get("PHONE_SOURCE", os.path.expanduser("~/Desktop/japan-phone-candidates"))
PHONE_PICKS = {  # 第几天: [手机文件名...]，文件放在 PHONE_SOURCE/<日期>/ 下
    1:  ["IMG_7722.JPG", "IMG_7729.HEIC", "IMG_7741.HEIC", "IMG_7740.JPG"],
    2:  ["IMG_7778.JPG", "IMG_7765.HEIC", "IMG_7759.HEIC", "IMG_7770.HEIC"],
    3:  ["IMG_7802.HEIC", "IMG_7791.JPG", "IMG_7794.HEIC", "IMG_7805.HEIC"],
    4:  ["IMG_7808.HEIC", "IMG_7810.HEIC"],  # 住处的照片不放
    9:  ["IMG_8644.HEIC", "IMG_8640.HEIC", "IMG_8642.HEIC", "IMG_8651.HEIC"],
    10: ["IMG_8673.HEIC", "IMG_8674.HEIC", "IMG_8679.HEIC", "IMG_8692.HEIC"],
    11: ["IMG_8712.JPG", "IMG_8709.HEIC", "IMG_8718.HEIC", "IMG_8715.JPG"],
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

def load_phone(day, filename):
    folder = "2026-10-%02d" % (4 + day)  # Day 1 = 10.05
    path = os.path.join(PHONE_SOURCE, folder, filename)
    if filename.upper().endswith(".HEIC"):
        tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False).name
        subprocess.run(["sips", "-s", "format", "jpeg", path, "--out", tmp], check=True, capture_output=True)
        im = Image.open(tmp); im.load(); os.unlink(tmp)
    else:
        im = Image.open(path)
    return ImageOps.exif_transpose(im)

def save(im, name, source):
    im = im.convert("RGB")
    im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)
    # 不写入 EXIF：机身序列号、GPS 定位、拍摄参数等不会带到网站上
    im.save(os.path.join(OUT, name), "JPEG", quality=82, optimize=True, progressive=True)
    manifest["%s/%s" % (CHAPTER, name)] = [im.width, im.height]
    print(name, "<-", source, im.size, os.path.getsize(os.path.join(OUT, name)) // 1024, "KB")

def keep_existing(name):
    path = os.path.join(OUT, name)
    if not os.path.exists(path):
        return False
    with Image.open(path) as im:
        manifest["%s/%s" % (CHAPTER, name)] = [im.width, im.height]
    return True

manifest = {}
card = os.path.isdir(SOURCE)
for day, numbers in sorted(PICKS.items()):
    for i, n in enumerate(numbers, 1):
        name = "%02d-%d.jpg" % (day, i)
        if card:
            save(load("DSC_%04d" % n), name, "DSC_%04d" % n)
        elif not keep_existing(name):
            sys.exit("相机卡未插入，且缺少 %s" % name)
phone = os.path.isdir(PHONE_SOURCE)
for day, files in sorted(PHONE_PICKS.items()):
    for i, f in enumerate(files, 1):
        name = "%02d-%d.jpg" % (day, i)
        if phone:
            save(load_phone(day, f), name, f)
        elif not keep_existing(name):
            sys.exit("手机照片文件夹不在，且缺少 %s" % name)
manifest = dict(sorted(manifest.items()))

with open(os.path.join(ROOT, "data", CHAPTER + "-photos.js"), "w") as f:
    f.write("// 由 tools/import_photos.py 生成，请勿手改。格式：文件 -> [宽, 高]\n")
    f.write("window.PHOTOS = Object.assign(window.PHOTOS || {}, %s);\n" % json.dumps(manifest, indent=1))
