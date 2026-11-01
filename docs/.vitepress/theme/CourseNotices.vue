<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";

const { lang } = useData();
const english = computed(() => lang.value === "en");
const href = withBase("/THIRD_PARTY_NOTICES.txt");
const plexHref = withBase("/fonts/ibm-plex-sans/OFL.txt");
const barlowHref = withBase("/fonts/barlow-condensed/OFL.txt");
</script>

<template>
  <p class="course-notices">
    <a :href="href">{{ english ? 'Third-party notices' : '第三方许可说明' }}</a>
    <span aria-hidden="true">·</span>
    <a :href="plexHref">{{ english ? 'IBM Plex license' : 'IBM Plex 字体许可' }}</a>
    <span aria-hidden="true">·</span>
    <a :href="barlowHref">{{ english ? 'Barlow license' : 'Barlow 字体许可' }}</a>
  </p>
</template>
