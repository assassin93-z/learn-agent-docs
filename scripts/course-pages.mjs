export const BASE = "/learn-agent-docs/";

export const LESSONS = [
  { slug: "01-minimal-loop", zh: "01 · 最小 Agent 循环", en: "01 · Minimal agent loop" },
  { slug: "02-tool-system", zh: "02 · 工具注册表", en: "02 · Tool registry" },
  { slug: "03-permissions", zh: "03 · 宿主权限", en: "03 · Host permissions" },
  { slug: "04-context", zh: "04 · 上下文与会话", en: "04 · Context and sessions" },
  { slug: "05-skills", zh: "05 · 按需加载 Skill", en: "05 · Skills on demand" },
  { slug: "06-chat-channel", zh: "06 · 聊天渠道", en: "06 · Chat channel" },
  { slug: "07-scheduling", zh: "07 · 定时任务与心跳", en: "07 · Scheduling and heartbeats" },
  { slug: "08-mcp", zh: "08 · 本地 stdio MCP", en: "08 · Local stdio MCP" },
  { slug: "09-subagents", zh: "09 · 独立子 Agent", en: "09 · Child agents" },
  { slug: "10-planning", zh: "10 · 审批后的计划", en: "10 · Reviewed execution plans" },
  { slug: "11-memory", zh: "11 · 记忆与历史搜索", en: "11 · Memory and history search" }
];

export const GUIDES = [
  { slug: "learning-path", zh: "学习路径", en: "Learning path" },
  { slug: "course-map", zh: "功能对照", en: "Feature map" },
  { slug: "architecture", zh: "架构指南", en: "Architecture guide" }
];

const paths = ["", ...GUIDES.map(({ slug }) => `guides/${slug}/`), ...LESSONS.map(({ slug }) => `lessons/${slug}/`)];

export const COURSE_PAGES = ["zh", "en"].flatMap((locale) => paths.map((path) => {
  const prefix = locale === "en" ? "en/" : "";
  const translatedPrefix = locale === "en" ? "" : "en/";
  return {
    file: `${prefix}${path}index.md`,
    route: `/${prefix}${path}`,
    locale,
    translation: `/${translatedPrefix}${path}`
  };
}));
