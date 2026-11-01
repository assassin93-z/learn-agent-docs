---
name: Learn Agent
description: 双语 TypeScript Agent 课程的版本控制工作台阅读系统
seedReference: "seed:0ab6907bb51f4ec3"
colors:
  repo-shell: "#08111a"
  repo-shell-raised: "#101c28"
  repo-panel: "#162536"
  repo-paper: "#f3f6f6"
  repo-sheet: "#ffffff"
  repo-ink: "#17242f"
  repo-muted: "#5d6d79"
  repo-frame-muted: "#aebdc7"
  repo-frame-disabled: "#718795"
  repo-line: "#c8d3d9"
  repo-line-dark: "#2a3d4d"
  repo-cyan: "#49c6ff"
  repo-cyan-ink: "#05698f"
  repo-green: "#32d27d"
  repo-amber: "#f4b942"
  repo-red: "#ff687b"
  repo-code: "#0d1722"
  repo-code-ink: "#dcefff"
typography:
  display:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "clamp(50px, 5.7vw, 78px)"
    fontWeight: 680
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  lesson-title:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "clamp(38px, 4.2vw, 58px)"
    fontWeight: 680
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "30px"
    fontWeight: 670
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.2
  body:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.82
  label:
    fontFamily: '"IBM Plex Sans", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.4
  mono:
    fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.62
  mono-label:
    fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
  micro:
    fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
  wordmark:
    fontFamily: '"Barlow Condensed", "Noto Sans CJK SC", "PingFang SC", sans-serif'
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1
rounded:
  compact: "6px"
  control: "10px"
  panel: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "48px"
  chapter: "72px"
components:
  primary-action:
    backgroundColor: "{colors.repo-green}"
    textColor: "{colors.repo-shell}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  secondary-action:
    backgroundColor: "transparent"
    textColor: "{colors.repo-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  checkout-header:
    backgroundColor: "{colors.repo-shell}"
    textColor: "{colors.repo-sheet}"
    rounded: "{rounded.panel}"
    padding: "26px 32px 24px"
  commit-complete:
    backgroundColor: "{colors.repo-shell-raised}"
    textColor: "{colors.repo-sheet}"
    rounded: "{rounded.panel}"
    padding: "22px"
  code-block:
    backgroundColor: "{colors.repo-code}"
    textColor: "{colors.repo-code-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.control}"
    padding: "22px 24px 18px"
---

# Design System: Learn Agent

## Overview

**Creative North Star: "Version-Control Workbench / 可追溯提交工作台"**

Learn Agent 的共享主题像一个为阅读而设计的版本控制工作台。十一项能力不是装饰性步骤，而是一条可追溯的提交历史：读者能看见当前 checkout、已验证提交、后续分支和课程完成状态，同时继续在安静的浅色阅读面上理解技术内容。

这是一个 Read 模式界面。深色 repository 框架负责身份、导航与状态，浅色 document surface 负责正文、表格和长时间阅读。系统借用 commit graph、diff 状态、checkout 与 merged 的出版语言，但不把文档伪装成终端或 IDE；导航仍是标准导航，正文仍是标准文档。

**Key Characteristics:**

- 深色顶部与侧栏构成稳定的 repository chrome，正文始终落在浅色阅读面。
- 首页第一屏是一张 repository 工作区：状态栏、课程主张和能力提交分组共同出现。
- 十一模块使用连续 commit graph 表达顺序、当前位置和已验证状态。
- IBM Plex Sans 承担阅读与标题，IBM Plex Mono 只用于代码、路径、状态和测量标签。
- 6/10/14px 圆角、1px 结构线、克制阴影和明确状态色建立层级，不依赖霓虹光效。

## Colors

### Repository Frame

- **Repo Shell** `#08111a`：顶部导航、侧栏、移动课程导航和最深框架。
- **Repo Shell Raised** `#101c28`：首页提交分组、章节头内容面和完成状态。
- **Repo Panel** `#162536`：深色控件、代码复制按钮和局部活动面。

### Document Surface

- **Repo Paper** `#f3f6f6`：全局阅读底面。
- **Repo Sheet** `#ffffff`：首页主张区、分页和需要更强分离的内容面。
- **Repo Ink** `#17242f`：正文、标题和主要信息。
- **Repo Muted** `#5d6d79`：说明、元信息和低优先级导航。
- **Repo Frame Muted** `#aebdc7`：深色 repository 框架上的次要导航与搜索说明。
- **Repo Frame Disabled** `#718795`：深色框架上的不可用方向与禁用状态，保持可读但弱于普通导航。
- **Repo Line** `#c8d3d9`：正文表格、分页和阅读区分隔。
- **Repo Line Dark** `#2a3d4d`：深色框架内的结构线。

### State

- **Commit Green** `#32d27d`：已验证、已完成、可继续和主行动。
- **Branch Cyan** `#49c6ff`：链接、分支路径、语言标签和导航提示。
- **Branch Cyan Ink** `#05698f`：浅色阅读面上的链接与路径文字，满足正文尺寸对比度。
- **Checkout Amber** `#f4b942`：当前模块、当前检出和需要立即识别的活动状态。
- **Diff Red** `#ff687b`：错误、危险或移除语义；不得作为普通装饰。

**The State Color Rule.** 绿色表示已验证或正向完成，青色表示路径与可导航信息，琥珀色只表示当前 checkout，红色只表示错误或移除。状态色不能互换。

**The Calm Document Rule.** 深色框架可以高密度，正文阅读面必须保持浅色、低噪声和真实对比；不把连续正文放进深色终端皮肤。

## Typography

**Display and Body Font:** 自托管 IBM Plex Sans Variable（中文回退为 Noto Sans CJK SC、PingFang SC）

**Code and State Font:** 自托管 IBM Plex Mono Regular / SemiBold

**Wordmark Font:** 自托管 Barlow Condensed SemiBold，仅用于 `LEARN / AGENT` 标记和极少量框架标签

### Hierarchy

- **Display**（680，`clamp(50px, 5.7vw, 78px)`，0.98）：首页主张。
- **Lesson Title**（680，`clamp(38px, 4.2vw, 58px)`，1）：章节 checkout 标题和普通页面主标题。
- **Headline**（670，28–30px，1.15）：正文 H2，以 commit node 和细分隔线建立节奏。
- **Title**（620–650，16–22px）：提交分组、完成态、分页和三级标题。
- **Body**（400，16px，1.82）：中英文技术长文，约 68ch。
- **Mono**（400–600，11–14px）：代码、模块编号、分支、状态、语言标签和提交轨迹。

**The Mono Evidence Rule.** 等宽字体只用于代码、路径、状态和编号；不把标题或连续正文全部改成等宽字体来制造“技术感”。

**The Traceable Number Rule.** 数字只表达真实的十一模块顺序、当前位置或已验证数量，不使用虚构 hash、指标或运行数据。

## Layout

桌面端保留 VitePress 的侧栏、正文和页内目录三栏骨架。顶部与左侧进入深色 repository frame，正文和页内目录留在浅色 document surface。首页关闭页内目录，内容扩展到约 1120px。

首页第一屏由三层组成：深色 repository status bar、浅色课程主张面、深色能力提交分组。下方课程入口不再使用双列卡片墙，而是单列 commit history，通过一条纵向 branch line 串联十一模块。

课程页顶部是 checkout header：左侧显示真实模块号和总数，右侧显示 `course-main`、当前 checkout、章节标题和十一节点 commit rail。已完成节点为绿色，当前节点为琥珀色，后续节点保持中性。

正文宽度维持约 68ch。代码和表格可以占满正文列；页内目录继续回答当前章节位置。移动端收起桌面侧栏，将 checkout header 纵向排列，并使用固定的上一课 / 学习分支 / 下一课导航。

## Elevation & Depth

正文区域依赖纸面、结构线和留白；深色框架使用少量带垂直偏移的柔和阴影与浅色内容面分离。首页 repository 窗口和 checkout header 可以使用 `0 20–24px 46–60px` 的低透明阴影，普通控件不使用常驻阴影。

**The Frame Owns Depth Rule.** 阴影只属于大框架，不属于列表项、提示块和每个按钮。需要增加局部层级时，优先使用 1px 结构线和状态面。

## Shapes

系统使用三档圆角：紧凑状态与行内代码 6px、普通控件与代码块 10px、主要工作区与 checkout header 14px。commit node 保持圆形，表格网格和结构分隔保持直线。

**The Workbench Radius Rule.** 圆角用于大型框架和可操作控件，不把所有列表行包成柔软卡片，也不使用胶囊作为默认形状。

## Components

### Primary Navigation

- 顶部导航使用 Repo Shell；站点标记由小型绿色 commit node 和 `LEARN / AGENT` 组成。
- 主导航默认使用冷灰文字，活动项变为 Commit Green 并显示 2px 下划线。
- 搜索和语言切换使用 raised shell、1px 深色结构线和明确的青色/绿色状态。

### Repository Landing

- 首页状态栏显示真实的课程 repository 名称和十一项验证状态，不展示虚构 hash 或在线指标。
- 左侧浅色面承载主张和行动，右侧深色面使用连续 branch line 分组十一项能力。
- 主行动使用 Commit Green，次行动保持透明边框；两者高度与圆角一致。
- 下方课程入口使用单列 commit history，hover 只改变阅读行背景和文字，不变成卡片墙。

### Sidebar Commit Graph

- 课程组使用一条细 branch line 和十一枚圆形 commit node。
- 当前模块节点变为绿色并获得低强度 halo；条目使用绿色文字和半透明活动面。
- 指南组与课程组通过 1px 深色结构线和更大间距分开。

### Lesson Checkout Header

- 左侧显示 `commit`、真实模块号和 `/ 11`；右侧显示 `course-main`、当前 checkout、标题和 commit rail。
- 已完成节点使用绿色，当前 checkout 使用琥珀色，未来节点使用中性蓝灰。
- 移动端模块号横向排列，commit rail 可水平滚动，保持可点击尺寸。

### Code And Technical Evidence

- 代码块使用 Repo Code 底色、1px 深色边框和 10px 圆角。
- 顶部 2px 状态轨同时出现绿色、青色和琥珀色，用于区分技术证据面，不模拟窗口按钮。
- 代码正文为 13px / 1.62；语言标签为 11px。复制按钮为 32px、图标为 16px、反馈文字为 11px。
- 行内代码使用浅青底、细边框和深青文字。

### Review Notes And Tables

- 普通提示使用低强度蓝灰背景与 1px 边框，标题前使用状态 node。
- warning 使用琥珀色，danger 使用 Diff Red；颜色只改变边界和状态点，不覆盖整块高饱和底色。
- 表头使用 raised shell 和浅色文字，正文单元格使用白色半透明面。

### Commit Complete And Pager

- 课程页尾使用深色 merged 状态板、绿色勾选和真实提交计数。
- 上下模块分页使用白色阅读面和 1px 边框；hover 切换为低强度青色面。
- 第三方许可、IBM Plex 和 Barlow 字体许可保持可达。

### Mobile Repository Navigation

- 仅课程页显示固定底栏，三段分别为上一课、当前学习分支、下一课。
- 中段使用 Commit Green 与深色文字，两侧使用 Repo Shell；不可用方向降低对比但保留布局。
- 正文底部预留空间，完成状态、分页和许可链接不得被遮挡。

## Do's and Don'ts

### Do:

- **Do** 让 repository frame 明确包围浅色阅读区，而不是把整站做成黑底终端。
- **Do** 用 commit graph、checkout 和 committed 状态持续回答“我在哪里、完成了什么、下一步去哪”。
- **Do** 只使用真实课程顺序、模块数量和验证状态。
- **Do** 在 1440px、800px、390px 和 320px 检查中英文标题、提交轨迹、代码宽度和固定导航。
- **Do** 保持课程 Markdown 正文、课程事实、中英文对应关系和 Agent 工程代码不变。

### Don't:

- **Don't** 使用霓虹紫、发光边框、玻璃拟态或整页扫描线来替代真实信息层级。
- **Don't** 把标准导航改造成需要学习的 terminal 命令界面。
- **Don't** 用虚构 commit hash、在线状态、性能指标或运行数据增强“科技感”。
- **Don't** 把每个提交、提示和列表项都包成同尺寸卡片。
- **Don't** 修改课程正文或 learn-agent Agent 代码来适配主题。
