<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { LESSONS } from "../../../scripts/course-pages.mjs";

const props = defineProps({
  placement: {
    type: String,
    default: "start"
  }
});

const { page: pageData } = useData();
const relativePath = computed(() => pageData.value.relativePath ?? "");
const english = computed(() => relativePath.value.startsWith("en/"));
const lessonIndex = computed(() => {
  const match = relativePath.value.match(/(?:^|\/)lessons\/([^/]+)\/index\.md$/);
  return match ? LESSONS.findIndex((lesson) => lesson.slug === match[1]) : -1;
});
const lesson = computed(() => lessonIndex.value >= 0 ? LESSONS[lessonIndex.value] : null);
const step = computed(() => lessonIndex.value + 1);
const title = computed(() => lesson.value?.[english.value ? "en" : "zh"].replace(/^\d+\s*·\s*/, "") ?? "");
const learningPathHref = computed(() => withBase(english.value ? "/en/guides/learning-path/" : "/guides/learning-path/"));
const lessonHref = (item) => withBase(`${english.value ? "/en" : ""}/lessons/${item.slug}/`);
const lessonLabel = (item) => item[english.value ? "en" : "zh"];
</script>

<template>
  <header v-if="lesson && placement === 'start'" class="lesson-checkout">
    <div class="lesson-checkout__commit" aria-hidden="true">
      <span>{{ english ? 'commit' : '提交' }}</span>
      <strong>{{ String(step).padStart(2, '0') }}</strong>
      <small>/ {{ LESSONS.length }}</small>
    </div>

    <div class="lesson-checkout__content">
      <div class="lesson-checkout__meta" aria-hidden="true">
        <span>course-main</span>
        <span>{{ english ? 'checked out' : '当前检出' }}</span>
      </div>
      <h1>
        <span class="visually-hidden">{{ english ? `Lesson ${step}: ` : `第 ${step} 课：` }}</span>
        {{ title }}
      </h1>
      <p>{{ english ? 'One capability. One verified commit.' : '一项能力，一次可验证的提交。' }}</p>

      <nav class="lesson-checkout__rail" :aria-label="english ? 'Course commit graph' : '课程提交图'">
        <ol>
          <li
            v-for="(item, index) in LESSONS"
            :key="item.slug"
            :class="{ 'is-complete': index < lessonIndex }"
          >
            <a
              :href="lessonHref(item)"
              :aria-current="index === lessonIndex ? 'step' : undefined"
              :aria-label="lessonLabel(item)"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </a>
          </li>
        </ol>
      </nav>
    </div>
  </header>

  <section
    v-else-if="lesson"
    class="commit-complete"
    :aria-label="english ? 'Lesson complete' : '本课完成'"
  >
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="20" />
      <path d="m14 24 7 7 14-16" />
    </svg>
    <div>
      <strong>{{ english ? `Module ${String(step).padStart(2, '0')} committed` : `模块 ${String(step).padStart(2, '0')} 已提交` }}</strong>
      <span>{{ english ? `${step} of ${LESSONS.length} commits verified` : `${step} / ${LESSONS.length} 次提交已验证` }}</span>
    </div>
    <a :href="learningPathHref">{{ english ? 'Review the commit graph' : '查看完整提交图' }}</a>
  </section>
</template>
