import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { checkSite, localTarget, parseHtml } from "../scripts/check-site.mjs";
import { BASE, COURSE_PAGES } from "../scripts/course-pages.mjs";

const fixturePages = [
  { file: "index.md", route: "/", locale: "zh", translation: "/en/" },
  { file: "en/index.md", route: "/en/", locale: "en", translation: "/" }
];

async function put(root, file, text) {
  await mkdir(dirname(join(root, file)), { recursive: true });
  await writeFile(join(root, file), text);
}

async function fixture(callback) {
  const root = await mkdtemp(join(tmpdir(), "docs-site-"));
  try {
    await put(root, "index.html", `<h1 id="start">学习</h1><p align="center">中文 · <a href="${BASE}en/">English</a></p>`);
    await put(root, "en/index.html", `<h1 id="start">Learning</h1><p align="center"><a href="${BASE}">中文</a> · English</p>`);
    await callback(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}

test("defines fifteen reciprocal document pairs without extra languages", () => {
  assert.equal(COURSE_PAGES.length, 30);
  assert.equal(new Set(COURSE_PAGES.map(({ file }) => file)).size, 30);
  for (const page of COURSE_PAGES) {
    const translated = COURSE_PAGES.find(({ route }) => route === page.translation);
    assert.equal(translated.translation, page.route);
    assert.notEqual(translated.locale, page.locale);
  }
});

test("resolves root, relative, encoded and fragment URLs under the project base", () => {
  assert.deepEqual(localTarget(`${BASE}en/?x=1#start`, "index.html"), { file: "en/index.html", fragment: "start" });
  assert.deepEqual(localTarget("../../en/lessons/01-minimal-loop/", "lessons/01-minimal-loop/index.html"), { file: "en/lessons/01-minimal-loop/index.html", fragment: "" });
  assert.deepEqual(localTarget("#%E5%AD%A6%E4%B9%A0", "index.html"), { file: "index.html", fragment: "学习" });
  assert.deepEqual(localTarget(`${BASE}space%20page.html`, "index.html"), { file: "space page.html", fragment: "" });
  assert.equal(localTarget("https://example.com/", "index.html"), undefined);
  assert.equal(localTarget("mailto:contact@example.com", "index.html"), undefined);
});

test("rejects paths outside the deployment base, raw Markdown and unsafe schemes", () => {
  for (const href of ["/wrong/", "../../outside.html", "README.md", "javascript:alert(1)", `${BASE}%00bad.html`]) {
    assert.throws(() => localTarget(href, "index.html"));
  }
});

test("parses HTML resources and explicit anchor identifiers", () => {
  const parsed = parseHtml('<a id="safe" href="#safe">Safe</a><img src="image.png"><script src="app.js"></script><link href="style.css"><source srcset="one.png 1x, two.png 2x"><!-- <a href="fake.html"> -->');
  assert.ok(parsed.anchors.has("safe"));
  assert.deepEqual(parsed.links.map(({ href }) => href), ["#safe", "image.png", "app.js", "style.css", "one.png", "two.png"]);
});

test("ignores fake HTML links in inline executable or stylesheet text", () => {
  const parsed = parseHtml('<script src="app.js">const example = "<a href=\'fake.html\'>";</script><style>.example::after { content: "<a href=\'fake.html\'>"; }</style>');
  assert.deepEqual(parsed.links.map(({ href }) => href), ["app.js"]);
});

test("accepts complete language pairs and matching local resources", async () => fixture(async (root) => {
  await put(root, "assets/app.js", "export default {};");
  await put(root, "assets/style.css", "body { color: green; }");
  await put(root, "index.html", `<h1 id="start">学习</h1><p align="center">中文 · <a href="en/">English</a></p><a href="#start">Start</a><script src="${BASE}assets/app.js"></script><link href="${BASE}assets/style.css">`);
  assert.deepEqual(checkSite(root, { pages: fixturePages, requiredAnchors: false }), []);
}));

test("requires all expected pages to exist as regular files", async () => fixture(async (root) => {
  await rm(join(root, "en/index.html"));
  const failures = checkSite(root, { pages: fixturePages, requiredAnchors: false });
  assert.ok(failures.some((failure) => failure.includes("expected course page is missing")));
}));

test("rejects reversed language order and links to a different translated page", async () => fixture(async (root) => {
  await put(root, "index.html", '<p align="center"><a href="en/">English</a> · 中文</p>');
  assert.ok(checkSite(root, { pages: fixturePages, requiredAnchors: false }).some((failure) => failure.includes("Chinese-first")));
  await put(root, "index.html", '<p align="center">中文 · <a href="en/other/">English</a></p>');
  assert.ok(checkSite(root, { pages: fixturePages, requiredAnchors: false }).some((failure) => failure.includes("matching translated page")));
}));

test("requires the current language to be unlinked and the other linked", async () => fixture(async (root) => {
  await put(root, "index.html", `<p align="center"><a href="${BASE}">中文</a> · <a href="en/">English</a></p>`);
  assert.ok(checkSite(root, { pages: fixturePages, requiredAnchors: false }).some((failure) => failure.includes("current language must be plain text")));
}));

test("rejects missing resources, dangling fragments and raw Markdown destinations", async () => fixture(async (root) => {
  await put(root, "index.html", '<p align="center">中文 · <a href="en/">English</a></p><a href="en/#absent">Missing</a><img src="absent.png"><a href="README.md">Old</a>');
  const failures = checkSite(root, { pages: fixturePages, requiredAnchors: false });
  assert.ok(failures.some((failure) => failure.includes("fragment target is missing")));
  assert.ok(failures.some((failure) => failure.includes("local target is missing")));
  assert.ok(failures.some((failure) => failure.includes("unconverted Markdown")));
}));

test("preserves the required stable guide anchors", async () => fixture(async (root) => {
  const pages = [
    { file: "guides/architecture/index.md", route: "/guides/architecture/", locale: "zh", translation: "/en/guides/architecture/" },
    { file: "en/guides/architecture/index.md", route: "/en/guides/architecture/", locale: "en", translation: "/guides/architecture/" }
  ];
  await put(root, "guides/architecture/index.html", `<p align="center">中文 · <a href="${BASE}en/guides/architecture/">English</a></p><a id="scheduled-grants"></a>`);
  await put(root, "en/guides/architecture/index.html", `<p align="center"><a href="${BASE}guides/architecture/">中文</a> · English</p><a id="scheduled-grants"></a>`);
  assert.deepEqual(checkSite(root, { pages }), []);
  await put(root, "en/guides/architecture/index.html", `<p align="center"><a href="${BASE}guides/architecture/">中文</a> · English</p>`);
  assert.ok(checkSite(root, { pages }).some((failure) => failure.includes("missing stable documentation anchor")));
}));

test("rejects symbolic resources rather than following them", async () => fixture(async (root) => {
  await put(root, "index.html", '<p align="center">中文 · <a href="en/">English</a></p><img src="linked.svg">');
  await symlink(join(root, "en/index.html"), join(root, "linked.svg"));
  assert.ok(checkSite(root, { pages: fixturePages, requiredAnchors: false }).some((failure) => failure.includes("local target is missing or unsafe")));
}));
