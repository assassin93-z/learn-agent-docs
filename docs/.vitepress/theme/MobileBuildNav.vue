<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { LESSONS } from "../../../scripts/course-pages.mjs";

const { page: pageData } = useData();
const relativePath = computed(() => pageData.value.relativePath ?? "");
const english = computed(() => relativePath.value.startsWith("en/"));
const lessonIndex = computed(() => {
  const match = relativePath.value.match(/(?:^|\/)lessons\/([^/]+)\/index\.md$/);
  return match ? LESSONS.findIndex((lesson) => lesson.slug === match[1]) : -1;
});
const lesson = computed(() => lessonIndex.value >= 0 ? LESSONS[lessonIndex.value] : null);
const previous = computed(() => lessonIndex.value > 0 ? LESSONS[lessonIndex.value - 1] : null);
const next = computed(() => lessonIndex.value >= 0 && lessonIndex.value < LESSONS.length - 1
  ? LESSONS[lessonIndex.value + 1]
  : null);
const lessonHref = (item) => withBase(`${english.value ? "/en" : ""}/lessons/${item.slug}/`);
const learningPathHref = computed(() => withBase(english.value ? "/en/guides/learning-path/" : "/guides/learning-path/"));
</script>

<template>
  <nav v-if="lesson" class="mobile-repo-nav" :aria-label="english ? 'Course branch navigation' : '课程分支导航'">
    <a v-if="previous" class="mobile-repo-nav__edge" :href="lessonHref(previous)" :aria-label="english ? 'Previous lesson' : '上一课'">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 7.5 12l7 7" /></svg>
      <span>{{ english ? 'Previous' : '上一课' }}</span>
    </a>
    <span v-else class="mobile-repo-nav__edge is-disabled" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M14.5 5 7.5 12l7 7" /></svg>
      <span>{{ english ? 'Previous' : '上一课' }}</span>
    </span>

    <a class="mobile-repo-nav__current" :href="learningPathHref">
      <span>{{ lessonIndex + 1 }} / {{ LESSONS.length }}</span>
      <strong>{{ english ? 'Course branch' : '学习分支' }}</strong>
    </a>

    <a v-if="next" class="mobile-repo-nav__edge" :href="lessonHref(next)" :aria-label="english ? 'Next lesson' : '下一课'">
      <span>{{ english ? 'Next' : '下一课' }}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
    </a>
    <span v-else class="mobile-repo-nav__edge is-disabled" aria-hidden="true">
      <span>{{ english ? 'Next' : '下一课' }}</span>
      <svg viewBox="0 0 24 24"><path d="m9.5 5 7 7-7 7" /></svg>
    </span>
  </nav>
</template>
