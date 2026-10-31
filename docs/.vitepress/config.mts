import { defineConfig } from "vitepress";
import { BASE, GUIDES, LESSONS } from "../../scripts/course-pages.mjs";

function sidebar(locale: "zh" | "en") {
  const english = locale === "en";
  const prefix = english ? "/en" : "";
  return [
    {
      text: english ? "Start Here" : "开始阅读",
      items: [
        { text: english ? "Course overview" : "课程首页", link: `${prefix}/` },
        ...GUIDES.map((guide) => ({ text: guide[locale], link: `${prefix}/guides/${guide.slug}/` }))
      ]
    },
    {
      text: english ? "Eleven Small Capabilities" : "十一块 Agent 积木",
      items: LESSONS.map((lesson) => ({ text: lesson[locale], link: `${prefix}/lessons/${lesson.slug}/` }))
    }
  ];
}

export default defineConfig({
  title: "Learn Agent",
  description: "通过十一项小能力理解 Agent 的 TypeScript 实现。",
  base: BASE,
  cleanUrls: false,
  lastUpdated: false,
  appearance: false,
  head: [
    ["meta", { name: "theme-color", content: "#f7f5ee" }],
    ["meta", { name: "referrer", content: "strict-origin-when-cross-origin" }]
  ],
  locales: {
    root: {
      label: "中文",
      lang: "zh-Hans",
      description: "通过十一项小能力理解 Agent 的 TypeScript 实现。",
      themeConfig: {
        nav: [
          { text: "学习路径", link: "/guides/learning-path/" },
          { text: "第一课", link: "/lessons/01-minimal-loop/" },
          { text: "架构指南", link: "/guides/architecture/" }
        ],
        sidebar: sidebar("zh"),
        outline: { label: "本页内容", level: [2, 3] },
        docFooter: { prev: "上一页", next: "下一页" },
        sidebarMenuLabel: "课程目录",
        returnToTopLabel: "返回顶部",
        footer: { message: "仅发布课程文档 · 代码与提交历史仍为私有", copyright: "一项能力，一次验证。" }
      }
    },
    en: {
      label: "English",
      lang: "en",
      description: "Understand agent architecture through eleven small TypeScript capabilities.",
      themeConfig: {
        nav: [
          { text: "Learning path", link: "/en/guides/learning-path/" },
          { text: "First lesson", link: "/en/lessons/01-minimal-loop/" },
          { text: "Architecture", link: "/en/guides/architecture/" }
        ],
        sidebar: sidebar("en"),
        outline: { label: "On This Page", level: [2, 3] },
        docFooter: { prev: "Previous", next: "Next" },
        sidebarMenuLabel: "Course contents",
        returnToTopLabel: "Back to top",
        footer: { message: "Documentation only · Code and commit history remain private", copyright: "One capability. One verified step." }
      }
    }
  },
  themeConfig: {
    siteTitle: "LEARN / AGENT",
    search: { provider: "local" },
    externalLinkIcon: true
  }
});
