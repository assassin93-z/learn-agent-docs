import DefaultTheme from "vitepress/theme-without-fonts";
import { h } from "vue";
import { withBase } from "vitepress";
import LanguageLinks from "./LanguageLinks.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    "nav-bar-content-after": () => h(LanguageLinks),
    "doc-after": () => h("p", { class: "course-notices" }, [
      h("a", { href: withBase("/THIRD_PARTY_NOTICES.txt") }, "第三方许可 / Third-party notices")
    ])
  })
};
