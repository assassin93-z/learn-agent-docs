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
      text: english ? "Agent Commit History" : "Agent 提交历史",
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
    ["meta", { name: "theme-color", content: "#08111a" }],
    ["meta", { name: "referrer", content: "strict-origin-when-cross-origin" }]
  ],
  locales: {
    root: {
      label: "中文",
      lang: "zh-Hans",
      description: "通过十一项小能力理解 Agent 的 TypeScript 实现。",
      themeConfig: {
        nav: [
          { text: "学习路径", link: "/guides/learning-path/", activeMatch: "^/guides/learning-path/" },
          { text: "提交图", link: "/lessons/01-minimal-loop/", activeMatch: "^/lessons/" },
          { text: "架构指南", link: "/guides/architecture/", activeMatch: "^/guides/architecture/" }
        ],
        sidebar: sidebar("zh"),
        outline: { label: "本页内容", level: [2, 3] },
        docFooter: { prev: "上一模块", next: "下一模块" },
        langMenuLabel: "切换语言",
        skipToContentLabel: "跳到正文",
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
          { text: "Learning path", link: "/en/guides/learning-path/", activeMatch: "^/en/guides/learning-path/" },
          { text: "Commit graph", link: "/en/lessons/01-minimal-loop/", activeMatch: "^/en/lessons/" },
          { text: "Architecture", link: "/en/guides/architecture/", activeMatch: "^/en/guides/architecture/" }
        ],
        sidebar: sidebar("en"),
        outline: { label: "On This Page", level: [2, 3] },
        docFooter: { prev: "Previous module", next: "Next module" },
        langMenuLabel: "Change language",
        skipToContentLabel: "Skip to content",
        sidebarMenuLabel: "Course contents",
        returnToTopLabel: "Back to top",
        footer: { message: "Documentation only · Code and commit history remain private", copyright: "One capability. One verified step." }
      }
    }
  },
  themeConfig: {
    siteTitle: "LEARN / AGENT",
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索课程仓库", buttonAriaLabel: "搜索课程仓库" },
              modal: {
                displayDetails: "显示详细结果",
                resetButtonTitle: "清除搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "没有找到相关内容",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "回车键",
                  navigateText: "切换结果",
                  navigateUpKeyAriaLabel: "上方向键",
                  navigateDownKeyAriaLabel: "下方向键",
                  closeText: "关闭",
                  closeKeyAriaLabel: "Esc 键"
                }
              }
            }
          },
          en: {
            translations: {
              button: { buttonText: "Search the course repository", buttonAriaLabel: "Search the course repository" },
              modal: {
                displayDetails: "Display detailed results",
                resetButtonTitle: "Reset search",
                backButtonTitle: "Close search",
                noResultsText: "No results found",
                footer: {
                  selectText: "Select",
                  selectKeyAriaLabel: "Enter key",
                  navigateText: "Navigate",
                  navigateUpKeyAriaLabel: "Up arrow",
                  navigateDownKeyAriaLabel: "Down arrow",
                  closeText: "Close",
                  closeKeyAriaLabel: "Escape key"
                }
              }
            }
          }
        }
      }
    },
    externalLinkIcon: true
  }
});
