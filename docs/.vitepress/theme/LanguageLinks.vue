<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
import { COURSE_PAGES } from "../../../scripts/course-pages.mjs";

const { page: pageData } = useData();
const relativePath = computed(() => pageData.value.relativePath ?? "");
const page = computed(() => COURSE_PAGES.find((item) => item.file === relativePath.value));
const english = computed(() => page.value?.locale === "en" || relativePath.value.startsWith("en/"));
const label = computed(() => english.value ? "Language" : "语言");
const chineseHref = computed(() => page.value
  ? withBase(english.value ? page.value.translation : page.value.route)
  : null);
const englishHref = computed(() => page.value
  ? withBase(english.value ? page.value.route : page.value.translation)
  : null);
</script>

<template>
  <nav v-if="page" class="course-locale-links" :aria-label="label">
    <a v-if="english" :href="chineseHref" lang="zh-Hans">中文</a>
    <span v-else lang="zh-Hans" aria-current="page">中文</span>
    <span class="divider" aria-hidden="true">·</span>
    <span v-if="english" lang="en" aria-current="page">English</span>
    <a v-else :href="englishHref" lang="en">English</a>
  </nav>
</template>
