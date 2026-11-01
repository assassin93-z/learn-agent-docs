<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { LESSONS } from "../../../scripts/course-pages.mjs";

const { page: pageData } = useData();
const relativePath = computed(() => pageData.value.relativePath ?? "");
const home = computed(() => relativePath.value === "index.md" || relativePath.value === "en/index.md");
const english = computed(() => relativePath.value.startsWith("en/"));

const copy = computed(() => english.value ? {
  title: "Commit an explainable agent, one capability at a time.",
  lead: "A bilingual TypeScript course that turns eleven small, verifiable capabilities into one understandable agent architecture.",
  start: "Start with module 01",
  path: "Open the learning path",
  sequenceTitle: "Eleven commits. One traceable learning branch.",
  sequenceBody: "Follow the modules in order, inspect the boundary each one adds, and keep every change small enough to verify.",
  sequenceLabel: "Course commit graph",
  stackLabel: "Capability commit groups",
  repository: "learn-agent / course-main",
  status: "11 verified commits"
} : {
  title: "逐项提交一个可解释的 Agent。",
  lead: "用十一项小而可验证的 TypeScript 能力，逐步理解一个 Agent 的完整架构。",
  start: "从 01 模块开始",
  path: "打开学习路径",
  sequenceTitle: "十一次提交，一条可追溯的学习分支。",
  sequenceBody: "按顺序接入每个模块，理解它新增的边界，并让每次变更都保持可解释、可验证。",
  sequenceLabel: "课程提交图",
  stackLabel: "能力提交分组",
  repository: "learn-agent / course-main",
  status: "11 次提交已验证"
});

const stages = computed(() => english.value ? [
  { range: "01", label: "Establish the agent loop" },
  { range: "02–03", label: "Connect tools and permissions" },
  { range: "04–05", label: "Organize context and skills" },
  { range: "06–08", label: "Add channels, schedules, and MCP" },
  { range: "09–11", label: "Delegate, plan, and remember" }
] : [
  { range: "01", label: "建立 Agent 循环" },
  { range: "02–03", label: "接入工具与权限" },
  { range: "04–05", label: "组织上下文与 Skill" },
  { range: "06–08", label: "连接通道、调度与 MCP" },
  { range: "09–11", label: "完成委派、规划与记忆" }
]);

const lessonHref = (lesson) => withBase(`${english.value ? "/en" : ""}/lessons/${lesson.slug}/`);
const learningPathHref = computed(() => withBase(english.value ? "/en/guides/learning-path/" : "/guides/learning-path/"));
const lessonTitle = (lesson) => lesson[english.value ? "en" : "zh"].replace(/^\d+\s*·\s*/, "");
</script>

<template>
  <section v-if="home" class="repo-home">
    <div class="repo-home__hero">
      <div class="repo-home__statusbar" aria-hidden="true">
        <span class="repo-home__repository">{{ copy.repository }}</span>
        <span class="repo-home__status"><i />{{ copy.status }}</span>
      </div>

      <div class="repo-home__workspace">
        <div class="repo-home__copy">
          <h1>{{ copy.title }}</h1>
          <p>{{ copy.lead }}</p>
          <div class="repo-home__actions">
            <a class="repo-action repo-action--primary" :href="lessonHref(LESSONS[0])">{{ copy.start }}</a>
            <a class="repo-action repo-action--secondary" :href="learningPathHref">{{ copy.path }}</a>
          </div>
        </div>

        <ol class="repo-home__pipeline" :aria-label="copy.stackLabel">
          <li v-for="(stage, index) in stages" :key="stage.range" :style="{ '--stage-index': index }">
            <span>{{ stage.range }}</span>
            <strong>{{ stage.label }}</strong>
          </li>
        </ol>
      </div>
    </div>

    <nav class="commit-map" :aria-label="copy.sequenceLabel">
      <div class="commit-map__intro">
        <h2>{{ copy.sequenceTitle }}</h2>
        <p>{{ copy.sequenceBody }}</p>
      </div>
      <ol class="commit-map__list">
        <li v-for="(lesson, index) in LESSONS" :key="lesson.slug">
          <a :href="lessonHref(lesson)">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <strong>{{ lessonTitle(lesson) }}</strong>
          </a>
        </li>
      </ol>
    </nav>
  </section>
</template>
