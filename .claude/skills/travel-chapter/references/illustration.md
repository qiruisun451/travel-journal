# 章节插画

每一章配一张手绘插画，显示在首页章节列表那一行：电脑上在行的最右侧，手机上在日期下面占满整行。没有插画的"下一站"行显示一个同尺寸的虚线空框。所以插画是**跟着章节走**的，不要拿它替换首页的照片拼贴。

用户把提示词拿到 GPT 里生成，生成后发回来，你负责存成 `assets/chapters/<id>.jpg`（JPEG 质量约 84）并在 `data/chapters.js` 填 `cover`。画幅统一横版 3:2。

## 用户喜欢什么、不喜欢什么

日本篇试过两种风格，用户选了**钢笔淡彩旅行手账**（墨线 + 水彩，米色纸底，几个小景用虚线串起来），也明确说两张都"AI 味太浓"。另一张吉卜力式的大场景被否掉了。

AI 味主要来自：

- 每个地方画得一样满、一样精致，没有主次和省略。
- 全是明信片式的标志景点，像旅游宣传图，而不是用户自己的旅行。
- 线条太干净均匀，颜色恰好铺满，水彩边缘完美，没有画错、涂改、未完成的地方。
- 构图太规整（整齐的格子、公式化的"左边夕阳右边夜景"）。

## 写提示词的原则

- **用一张真实照片当参考图**最能去掉 AI 味：让 GPT 把用户自己的照片画成现场速写，画面就来自用户真正看到的东西。
- **少即是多**：一个场景，或者最多三个用户照片里的日常瞬间（店里的师傅、雨夜街口、夜车车厢），不要列十个景点。
- **把"手的痕迹"写成具体动作**：线条画过头、重复描线、保留铅笔辅助线、透视大致对但不用尺子、细节集中在视觉中心、边缘只剩几笔然后是空白纸。
- **限制颜色**：两三种颜色，快速不均匀的淡彩，局部溢出线外，大面积留白，天空留纸。
- **文字**：标题用 `"<DESTINATION> <YEAR>"` 这样的短字，放在角落像随手写的日期，不做醒目大标题；招牌画成涂鸦形状，不出现可读的字和品牌。
- 结尾写硬性排除：`No other text, no logos, no watermark.` 和画幅 `Landscape orientation 3:2.`

## 模板（参考图版）

```
Turn the attached photo into a quick on-location sketch, the kind an urban sketcher makes in about twenty minutes standing on the street.

Draw it with a fine black fountain pen on slightly yellowed sketchbook paper. The linework is fast and a little wobbly: lines overshoot at the corners, some are drawn twice, faint pencil construction lines are still visible under the ink, and the perspective is roughly right but not ruler-straight. Detail is concentrated where the eye goes (<视觉中心>) and falls away toward the edges, where things become a few loose strokes and then bare paper.

Color is added sparingly with a small travel watercolor set: only two or three colors (<颜色>), laid in quick uneven washes that drift outside the lines in places, with a few hard-edged puddles and dry-brush streaks. Large areas stay uncolored. Leave the sky as untouched paper.

Keep the composition of the photo, but crop it loosely so the drawing does not reach the edges of the page; the sketch fades out irregularly into the paper.

In the bottom right corner, a small handwritten note in loose pen: "<DESTINATION> <YEAR>" (EXACT, verbatim), written quickly like a date scribbled after finishing the drawing, small and casual, not a headline.

Signs in the scene are rendered as simple shapes and scribbles rather than readable words. No other text, no logos, no watermark. Landscape orientation 3:2.
```

给用户提示词时，同时推荐用哪一张照片当参考（给出 `photos/<id>/DD-K.jpg` 路径），并附两三条生成小建议：太挤就减少景物；只想改一处时说"只改 X，其他保持不变"。
