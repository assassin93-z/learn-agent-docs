import DefaultTheme from "vitepress/theme-without-fonts";
import { h } from "vue";
import CourseLanding from "./CourseLanding.vue";
import CourseNotices from "./CourseNotices.vue";
import CourseProgress from "./CourseProgress.vue";
import LanguageLinks from "./LanguageLinks.vue";
import MobileBuildNav from "./MobileBuildNav.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "nav-bar-content-after": () => h(LanguageLinks),
    "doc-before": () => [h(CourseLanding), h(CourseProgress, { placement: "start" })],
    "doc-footer-before": () => h(CourseProgress, { placement: "end" }),
    "doc-after": () => h(CourseNotices),
    "layout-bottom": () => h(MobileBuildNav)
  })
};
